# WebRTC Video Calling Platform with SFU & Recording

A comprehensive WebRTC-based video calling platform built with **NestJS** (backend) and **React** (frontend), featuring **mediasoup SFU** for scalable video conferencing and **FFmpeg-based recording** capabilities.

## 🚀 Features

### Core Video Calling
- ✅ **HD Video Calls** - 1080p video with adaptive bitrate
- ✅ **Crystal Clear Audio** - Opus codec with noise cancellation
- ✅ **Real-time Communication** - Low-latency peer-to-peer communication
- ✅ **Responsive UI** - Modern, clean interface that works on all devices

### SFU Architecture (Selective Forwarding Unit)
- ✅ **Scalable Architecture** - Support for multiple participants
- ✅ **Bandwidth Optimization** - Each participant sends once, receives multiple streams
- ✅ **Quality Adaptation** - Automatic bitrate adaptation based on network conditions
- ✅ **Multiple Codec Support** - VP8, VP9, H.264 video codecs + Opus audio

### Recording Capabilities
- ✅ **One-Click Recording** - Start/stop recording with a single button
- ✅ **High-Quality Output** - H.264 video + Opus audio in MKV format
- ✅ **Server-Side Recording** - Uses FFmpeg for reliable recording
- ✅ **Real-time Status** - Live recording indicator with timer

### Advanced Features
- ✅ **Real-time Participant Management** - See who's online, speaking, or muted
- ✅ **Dynamic Room Creation** - Rooms created automatically when first user joins
- ✅ **Connection Status Monitoring** - Real-time connection health indicators
- ✅ **Responsive Video Grid** - Automatic layout adjustment based on participant count

## 🏗️ Architecture

### Backend (NestJS + mediasoup)
```
src/modules/webrtc/
├── webrtc.module.ts           # Main WebRTC module
├── webrtc.gateway.ts          # WebSocket gateway for signaling
├── mediasoup.service.ts       # mediasoup SFU management
├── room.service.ts            # Room and peer management
├── recording.service.ts       # FFmpeg recording service
├── config/
│   └── mediasoup.config.ts    # mediasoup configuration
└── interfaces/
    └── webrtc.interfaces.ts   # TypeScript interfaces
```

### Frontend (React + mediasoup-client)
```
src/components/
├── Landing/
│   └── Landing.tsx            # Room joining interface
├── VideoCall/
│   ├── VideoCall.tsx          # Main video call component
│   ├── VideoGrid.tsx          # Video tiles grid layout
│   ├── ControlPanel.tsx       # Audio/video/recording controls
│   ├── ParticipantsList.tsx   # Participants sidebar
│   └── RecordingPanel.tsx     # Recording status and controls
└── WebRTC/
    └── WebRTCClient.ts        # mediasoup client wrapper
```

## 🛠️ Technical Stack

### Backend
- **NestJS** - Scalable Node.js framework
- **mediasoup** - WebRTC SFU (Selective Forwarding Unit)
- **Socket.IO** - Real-time bidirectional communication
- **FFmpeg** - Video/audio recording and processing
- **TypeScript** - Type-safe development

### Frontend
- **React** - Modern UI library
- **mediasoup-client** - WebRTC client library
- **Socket.IO Client** - Real-time communication
- **Styled Components** - CSS-in-JS styling
- **TypeScript** - Type-safe development

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- FFmpeg installed on the system
- Available UDP ports 10000-10100 for RTC

### 1. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure the following WebRTC-specific variables in `.env`:
```env
# WebRTC Configuration
MEDIASOUP_ANNOUNCED_IP=127.0.0.1    # Your server's public IP
RECORDINGS_PATH=./recordings          # Recording storage path
PORT=3001                            # Backend server port
```

### 3. Start the Application

**Start Backend (Terminal 1):**
```bash
npm run start:dev
```

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🎯 Usage Guide

### Joining a Video Call

1. **Open the Application** - Navigate to http://localhost:3000
2. **Enter Room Details**:
   - Room Name: Any name (rooms are created automatically)
   - Your Name: Display name for other participants
3. **Click "Join Call"** - You'll be connected to the room

### Video Call Controls

- **🎤 Microphone** - Toggle audio on/off
- **📹 Camera** - Toggle video on/off  
- **🔴 Record** - Start recording the meeting
- **⏹️ Stop Recording** - Stop active recording
- **📞 Leave Call** - Exit the room
- **◀️ Sidebar** - Toggle participants panel

### Recording Features

- **Start Recording** - Click the red record button
- **Live Status** - See recording timer and participant count
- **Stop Recording** - Click the stop button to end recording
- **File Output** - Recordings saved to `./recordings/` directory

## 🔧 Configuration

### mediasoup Configuration

Edit `src/modules/webrtc/config/mediasoup.config.ts` to customize:

```typescript
export const mediasoupConfig = {
  mediasoup: {
    worker: {
      rtcMinPort: 10000,        // RTC port range start
      rtcMaxPort: 10100,        // RTC port range end
      logLevel: 'warn',         // Logging level
    },
    router: {
      mediaCodecs: [            // Supported codecs
        { kind: 'audio', mimeType: 'audio/opus' },
        { kind: 'video', mimeType: 'video/VP8' },
        { kind: 'video', mimeType: 'video/h264' }
      ]
    },
    webRtcTransport: {
      maxIncomingBitrate: 1500000,      // Max incoming bitrate
      initialAvailableOutgoingBitrate: 1000000  // Initial outgoing bitrate
    }
  },
  recording: {
    videoCodec: 'libx264',      # Video encoder
    audioCodec: 'libopus',      # Audio encoder  
    format: 'mkv'               # Output format
  }
}
```

### Network Configuration

For **production deployment**, configure:

1. **Set Public IP**: Update `MEDIASOUP_ANNOUNCED_IP` in `.env`
2. **Open Ports**: Ensure UDP ports 10000-10100 are open
3. **HTTPS**: Configure SSL certificates for WebRTC to work in browsers
4. **STUN/TURN**: Add STUN/TURN servers for NAT traversal if needed

## 🚀 Production Deployment

### Docker Setup (Recommended)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

### Environment Variables for Production

```env
# Production WebRTC Configuration
MEDIASOUP_ANNOUNCED_IP=your.server.public.ip
RECORDINGS_PATH=/app/recordings
NODE_ENV=production
PORT=3001

# Database (if using)
DB_HOST=your_database_host
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

## 🔍 API Endpoints

### WebSocket Events (Socket.IO)

**Client → Server:**
- `join` - Join a room
- `createTransport` - Create WebRTC transport
- `connectTransport` - Connect transport
- `produce` - Start producing media
- `consume` - Start consuming media
- `startRecording` - Begin recording
- `stopRecording` - End recording

**Server → Client:**
- `joined` - Successfully joined room
- `peerJoined` - New participant joined
- `peerLeft` - Participant left
- `newProducer` - New media stream available
- `recordingStarted` - Recording began
- `recordingStopped` - Recording ended

## 🐛 Troubleshooting

### Common Issues

**1. No Video/Audio**
- Ensure camera/microphone permissions are granted
- Check if HTTPS is enabled (required for WebRTC in browsers)
- Verify firewall allows UDP traffic on ports 10000-10100

**2. Recording Not Working**
- Ensure FFmpeg is installed and in PATH
- Check write permissions for recordings directory
- Verify sufficient disk space

**3. Connection Failed**
- Check `MEDIASOUP_ANNOUNCED_IP` matches server's public IP
- Ensure UDP ports are not blocked by firewall
- Try using STUN servers for NAT traversal

**4. High CPU Usage**
- Reduce video resolution/bitrate in config
- Limit number of simultaneous participants
- Use hardware encoding if available

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

And in mediasoup config:
```typescript
logLevel: 'debug'
```

## 📈 Performance Optimization

### Server Optimization
- Use PM2 for process management
- Enable hardware acceleration for FFmpeg
- Configure load balancing for multiple servers
- Implement horizontal scaling with Redis

### Client Optimization  
- Implement simulcast for better bandwidth usage
- Add quality adaptation based on network conditions
- Use lazy loading for video components
- Implement connection quality monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review mediasoup documentation: https://mediasoup.org/

---

**Built with ❤️ using WebRTC, mediasoup, NestJS, and React**