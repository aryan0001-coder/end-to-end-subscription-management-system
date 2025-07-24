import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { WebRTCClient, PeerInfo } from '../WebRTC/WebRTCClient';
import VideoGrid from './VideoGrid';
import ControlPanel from './ControlPanel';
import ParticipantsList from './ParticipantsList';
import RecordingPanel from './RecordingPanel';

const VideoCallContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: white;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const VideoArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Sidebar = styled.div<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '300px' : '0'};
  background: #2a2a2a;
  transition: width 0.3s ease;
  overflow: hidden;
  border-left: 1px solid #444;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  background: #333;
  border-bottom: 1px solid #444;
`;

const RoomInfo = styled.div`
  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #fff;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    color: #ccc;
    font-size: 0.9rem;
  }
`;

const ConnectionStatus = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.connected ? '#4CAF50' : '#f44336'};
  }
`;

const ErrorMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #f44336;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  z-index: 1000;
  max-width: 300px;
`;

interface VideoCallProps {
  roomName: string;
  userName: string;
  serverUrl?: string;
}

interface RemoteStream {
  peerId: string;
  stream: MediaStream;
  kind: 'video' | 'audio';
}

const VideoCall: React.FC<VideoCallProps> = ({ 
  roomName, 
  userName, 
  serverUrl = 'http://localhost:3001' 
}) => {
  const [webrtcClient, setWebrtcClient] = useState<WebRTCClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<PeerInfo[]>([]);
  const [localVideoStream, setLocalVideoStream] = useState<MediaStream | null>(null);
  const [localAudioStream, setLocalAudioStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, RemoteStream>>(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);

  const clientRef = useRef<WebRTCClient | null>(null);

  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [roomName, userName]);

  const initializeWebRTC = async () => {
    try {
      const client = new WebRTCClient(serverUrl);
      clientRef.current = client;
      setWebrtcClient(client);

      // Set up event handlers
      client.onPeerJoined = (peer: PeerInfo) => {
        setParticipants(prev => [...prev.filter(p => p.id !== peer.id), peer]);
      };

      client.onPeerLeft = (peerId: string) => {
        setParticipants(prev => prev.filter(p => p.id !== peerId));
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          for (const [key, stream] of newStreams) {
            if (stream.peerId === peerId) {
              newStreams.delete(key);
            }
          }
          return newStreams;
        });
      };

      client.onNewStream = (peerId: string, stream: MediaStream, kind: string) => {
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          const key = `${peerId}-${kind}`;
          newStreams.set(key, {
            peerId,
            stream,
            kind: kind as 'video' | 'audio',
          });
          return newStreams;
        });
      };

      client.onRecordingStarted = (recordingId: string, startTime: Date) => {
        setIsRecording(true);
        setRecordingId(recordingId);
        setRecordingStartTime(startTime);
      };

      client.onRecordingStopped = (recordingId: string, endTime: Date) => {
        setIsRecording(false);
        setRecordingId(null);
        setRecordingStartTime(null);
      };

      client.onError = (error: string) => {
        setError(error);
        setTimeout(() => setError(null), 5000);
      };

      // Join the room
      await client.joinRoom(roomName, userName);
      setIsConnected(true);

    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      setError(`Failed to join room: ${error}`);
    }
  };

  const handleToggleVideo = async () => {
    if (!webrtcClient) return;

    try {
      if (isVideoEnabled) {
        await webrtcClient.disableWebcam();
        setLocalVideoStream(null);
        setIsVideoEnabled(false);
      } else {
        const stream = await webrtcClient.enableWebcam();
        setLocalVideoStream(stream);
        setIsVideoEnabled(true);
      }
    } catch (error) {
      setError(`Failed to toggle video: ${error}`);
    }
  };

  const handleToggleAudio = async () => {
    if (!webrtcClient) return;

    try {
      if (isAudioEnabled) {
        await webrtcClient.disableMicrophone();
        setLocalAudioStream(null);
        setIsAudioEnabled(false);
      } else {
        const stream = await webrtcClient.enableMicrophone();
        setLocalAudioStream(stream);
        setIsAudioEnabled(true);
      }
    } catch (error) {
      setError(`Failed to toggle audio: ${error}`);
    }
  };

  const handleStartRecording = async () => {
    if (!webrtcClient) return;

    try {
      await webrtcClient.startRecording();
    } catch (error) {
      setError(`Failed to start recording: ${error}`);
    }
  };

  const handleStopRecording = async () => {
    if (!webrtcClient || !recordingId) return;

    try {
      await webrtcClient.stopRecording(recordingId);
    } catch (error) {
      setError(`Failed to stop recording: ${error}`);
    }
  };

  const handleLeaveCall = () => {
    if (webrtcClient) {
      webrtcClient.disconnect();
    }
    // Navigate back or close the call
    window.location.href = '/';
  };

  return (
    <VideoCallContainer>
      <Header>
        <RoomInfo>
          <h2>{roomName}</h2>
          <p>{participants.length + 1} participant{participants.length !== 0 ? 's' : ''}</p>
        </RoomInfo>
        <ConnectionStatus connected={isConnected}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </ConnectionStatus>
      </Header>

      <MainContent>
        <VideoArea>
          <VideoGrid
            localVideoStream={localVideoStream}
            localAudioStream={localAudioStream}
            remoteStreams={remoteStreams}
            participants={participants}
            userName={userName}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
          />
          
          <ControlPanel
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={handleToggleVideo}
            onToggleAudio={handleToggleAudio}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onLeaveCall={handleLeaveCall}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isRecording={isRecording}
            sidebarOpen={sidebarOpen}
          />
        </VideoArea>

        <Sidebar isOpen={sidebarOpen}>
          <ParticipantsList 
            participants={[{ id: 'local', name: userName }, ...participants]}
            currentUserId="local"
          />
          
          <RecordingPanel
            isRecording={isRecording}
            recordingStartTime={recordingStartTime}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </Sidebar>
      </MainContent>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
    </VideoCallContainer>
  );
};

export default VideoCall;