import { Device } from 'mediasoup-client';
import { Transport, Producer, Consumer, RtpCapabilities } from 'mediasoup-client/lib/types';
import { io, Socket } from 'socket.io-client';

export interface PeerInfo {
  id: string;
  name: string;
}

export interface MediaStreams {
  localVideo?: MediaStream;
  localAudio?: MediaStream;
  remoteStreams: Map<string, { stream: MediaStream; peerId: string; kind: string }>;
}

export class WebRTCClient {
  private socket: Socket;
  private device: Device;
  private sendTransport?: Transport;
  private recvTransport?: Transport;
  private producers = new Map<string, Producer>();
  private consumers = new Map<string, Consumer>();
  private mediaStreams: MediaStreams = {
    remoteStreams: new Map(),
  };

  public onPeerJoined?: (peer: PeerInfo) => void;
  public onPeerLeft?: (peerId: string) => void;
  public onNewStream?: (peerId: string, stream: MediaStream, kind: string) => void;
  public onRecordingStarted?: (recordingId: string, startTime: Date) => void;
  public onRecordingStopped?: (recordingId: string, endTime: Date) => void;
  public onError?: (error: string) => void;

  constructor(serverUrl: string) {
    this.socket = io(`${serverUrl}/webrtc`);
    this.device = new Device();
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('joined', this.handleJoined.bind(this));
    this.socket.on('existingPeers', this.handleExistingPeers.bind(this));
    this.socket.on('peerJoined', this.handlePeerJoined.bind(this));
    this.socket.on('peerLeft', this.handlePeerLeft.bind(this));
    this.socket.on('transportCreated', this.handleTransportCreated.bind(this));
    this.socket.on('transportConnected', this.handleTransportConnected.bind(this));
    this.socket.on('produced', this.handleProduced.bind(this));
    this.socket.on('newProducer', this.handleNewProducer.bind(this));
    this.socket.on('consumed', this.handleConsumed.bind(this));
    this.socket.on('consumerResumed', this.handleConsumerResumed.bind(this));
    this.socket.on('recordingStarted', this.handleRecordingStarted.bind(this));
    this.socket.on('recordingStopped', this.handleRecordingStopped.bind(this));
    this.socket.on('error', this.handleError.bind(this));
  }

  async joinRoom(roomName: string, peerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit('join', { roomName, peerName });
      
      this.socket.once('joined', async (data) => {
        try {
          await this.device.load({ routerRtpCapabilities: data.rtpCapabilities });
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  async enableWebcam(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      this.mediaStreams.localVideo = stream;
      await this.createSendTransport();
      await this.produce(stream.getVideoTracks()[0], 'video');
      
      return stream;
    } catch (error) {
      throw new Error(`Failed to enable webcam: ${error}`);
    }
  }

  async enableMicrophone(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStreams.localAudio = stream;
      await this.createSendTransport();
      await this.produce(stream.getAudioTracks()[0], 'audio');
      
      return stream;
    } catch (error) {
      throw new Error(`Failed to enable microphone: ${error}`);
    }
  }

  async disableWebcam(): Promise<void> {
    const videoProducer = Array.from(this.producers.values())
      .find(p => p.kind === 'video');
    
    if (videoProducer) {
      videoProducer.close();
      this.producers.delete(videoProducer.id);
    }

    if (this.mediaStreams.localVideo) {
      this.mediaStreams.localVideo.getTracks().forEach(track => track.stop());
      this.mediaStreams.localVideo = undefined;
    }
  }

  async disableMicrophone(): Promise<void> {
    const audioProducer = Array.from(this.producers.values())
      .find(p => p.kind === 'audio');
    
    if (audioProducer) {
      audioProducer.close();
      this.producers.delete(audioProducer.id);
    }

    if (this.mediaStreams.localAudio) {
      this.mediaStreams.localAudio.getTracks().forEach(track => track.stop());
      this.mediaStreams.localAudio = undefined;
    }
  }

  async startRecording(): Promise<void> {
    this.socket.emit('startRecording');
  }

  async stopRecording(recordingId: string): Promise<void> {
    this.socket.emit('stopRecording', { recordingId });
  }

  private async createSendTransport(): Promise<void> {
    if (this.sendTransport) return;

    return new Promise((resolve, reject) => {
      this.socket.emit('createTransport', {
        peerId: this.socket.id,
        direction: 'send',
      });

      this.socket.once('transportCreated', async (data) => {
        try {
          this.sendTransport = this.device.createSendTransport({
            id: data.transportId,
            iceParameters: data.iceParameters,
            iceCandidates: data.iceCandidates,
            dtlsParameters: data.dtlsParameters,
            iceServers: data.iceServers || [], // Use ICE servers from server
          });

          this.sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
              this.socket.emit('connectTransport', {
                transportId: this.sendTransport!.id,
                dtlsParameters,
              });
              
              this.socket.once('transportConnected', () => {
                callback();
              });
            } catch (error) {
              errback(error);
            }
          });

          this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
            try {
              this.socket.emit('produce', {
                peerId: this.socket.id,
                transportId: this.sendTransport!.id,
                kind,
                rtpParameters,
                appData,
              });

              this.socket.once('produced', (data) => {
                callback({ id: data.producerId });
              });
            } catch (error) {
              errback(error);
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async createRecvTransport(): Promise<void> {
    if (this.recvTransport) return;

    return new Promise((resolve, reject) => {
      this.socket.emit('createTransport', {
        peerId: this.socket.id,
        direction: 'recv',
      });

      this.socket.once('transportCreated', async (data) => {
        try {
          this.recvTransport = this.device.createRecvTransport({
            id: data.transportId,
            iceParameters: data.iceParameters,
            iceCandidates: data.iceCandidates,
            dtlsParameters: data.dtlsParameters,
            iceServers: data.iceServers || [], // Use ICE servers from server
          });

          this.recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
              this.socket.emit('connectTransport', {
                transportId: this.recvTransport!.id,
                dtlsParameters,
              });
              
              this.socket.once('transportConnected', () => {
                callback();
              });
            } catch (error) {
              errback(error);
            }
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async produce(track: MediaStreamTrack, kind: 'audio' | 'video'): Promise<void> {
    if (!this.sendTransport) {
      throw new Error('Send transport not created');
    }

    const producer = await this.sendTransport.produce({
      track,
      encodings: kind === 'video' ? [
        { maxBitrate: 100000 },
        { maxBitrate: 300000 },
        { maxBitrate: 900000 },
      ] : undefined,
      codecOptions: kind === 'video' ? {
        videoGoogleStartBitrate: 1000,
      } : undefined,
    });

    this.producers.set(producer.id, producer);
  }

  private async consume(peerId: string, producerId: string): Promise<void> {
    await this.createRecvTransport();

    this.socket.emit('consume', {
      peerId: this.socket.id,
      producerId,
      rtpCapabilities: this.device.rtpCapabilities,
    });
  }

  // Socket event handlers
  private handleJoined(data: any): void {
    console.log('Joined room:', data);
  }

  private handleExistingPeers(data: { peers: PeerInfo[] }): void {
    data.peers.forEach(peer => {
      if (this.onPeerJoined) {
        this.onPeerJoined(peer);
      }
    });
  }

  private handlePeerJoined(data: PeerInfo): void {
    if (this.onPeerJoined) {
      this.onPeerJoined(data);
    }
  }

  private handlePeerLeft(data: { peerId: string }): void {
    // Clean up streams for this peer
    const streamsToRemove: string[] = [];
    this.mediaStreams.remoteStreams.forEach((streamInfo, key) => {
      if (streamInfo.peerId === data.peerId) {
        streamInfo.stream.getTracks().forEach(track => track.stop());
        streamsToRemove.push(key);
      }
    });
    
    streamsToRemove.forEach(key => {
      this.mediaStreams.remoteStreams.delete(key);
    });

    if (this.onPeerLeft) {
      this.onPeerLeft(data.peerId);
    }
  }

  private handleTransportCreated(data: any): void {
    // Handled in createSendTransport/createRecvTransport
  }

  private handleTransportConnected(data: any): void {
    // Handled in transport connect events
  }

  private handleProduced(data: any): void {
    // Handled in produce method
  }

  private handleNewProducer(data: { peerId: string; producerId: string; kind: string }): void {
    this.consume(data.peerId, data.producerId);
  }

  private handleConsumed(data: any): void {
    const { consumerId, producerId, kind, rtpParameters } = data;

    this.recvTransport!.consume({
      id: consumerId,
      producerId,
      kind,
      rtpParameters,
    }).then(consumer => {
      this.consumers.set(consumerId, consumer);

      const stream = new MediaStream([consumer.track]);
      const streamKey = `${consumer.producerId}-${kind}`;
      this.mediaStreams.remoteStreams.set(streamKey, {
        stream,
        peerId: data.peerId || 'unknown',
        kind,
      });

      // Resume the consumer
      this.socket.emit('resumeConsumer', { consumerId });

      if (this.onNewStream) {
        this.onNewStream(data.peerId || 'unknown', stream, kind);
      }
    });
  }

  private handleConsumerResumed(data: { consumerId: string }): void {
    console.log('Consumer resumed:', data.consumerId);
  }

  private handleRecordingStarted(data: { recordingId: string; startTime: Date }): void {
    if (this.onRecordingStarted) {
      this.onRecordingStarted(data.recordingId, data.startTime);
    }
  }

  private handleRecordingStopped(data: { recordingId: string; endTime: Date }): void {
    if (this.onRecordingStopped) {
      this.onRecordingStopped(data.recordingId, data.endTime);
    }
  }

  private handleError(data: { message: string }): void {
    if (this.onError) {
      this.onError(data.message);
    }
  }

  disconnect(): void {
    // Clean up all streams
    if (this.mediaStreams.localVideo) {
      this.mediaStreams.localVideo.getTracks().forEach(track => track.stop());
    }
    if (this.mediaStreams.localAudio) {
      this.mediaStreams.localAudio.getTracks().forEach(track => track.stop());
    }
    
    this.mediaStreams.remoteStreams.forEach(streamInfo => {
      streamInfo.stream.getTracks().forEach(track => track.stop());
    });

    // Close transports
    if (this.sendTransport) {
      this.sendTransport.close();
    }
    if (this.recvTransport) {
      this.recvTransport.close();
    }

    // Disconnect socket
    this.socket.disconnect();
  }

  getLocalStreams(): { video?: MediaStream; audio?: MediaStream } {
    return {
      video: this.mediaStreams.localVideo,
      audio: this.mediaStreams.localAudio,
    };
  }

  getRemoteStreams(): Map<string, { stream: MediaStream; peerId: string; kind: string }> {
    return this.mediaStreams.remoteStreams;
  }
}