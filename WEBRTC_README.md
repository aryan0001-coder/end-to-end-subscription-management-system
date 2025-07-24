# 🎥 Database-Free WebRTC Video Calling Platform

A **zero-configuration** WebRTC video calling platform built with **NestJS** (backend) and **React** (frontend), featuring **mediasoup SFU** for scalable video conferencing and **FFmpeg-based recording** capabilities.

> **🚀 No Database Required!** No signup, no login, no complex setup - just pure WebRTC video calling!

## ✨ Key Features

### **🔥 Zero Configuration**
- ✅ **No Database** - Everything runs in memory
- ✅ **No Authentication** - Join rooms instantly with just a name
- ✅ **No Signup/Login** - Start video calls immediately
- ✅ **Plug & Play** - Works out of the box with minimal setup

### **🎯 Core Video Calling**
- ✅ **HD Video Calls** - 1080p video with adaptive bitrate
- ✅ **Crystal Clear Audio** - Opus codec with noise cancellation
- ✅ **Real-time Communication** - Low-latency peer-to-peer communication
- ✅ **Responsive UI** - Modern, clean interface that works on all devices

### **🏗️ SFU Architecture (Selective Forwarding Unit)**
- ✅ **Scalable Architecture** - Support for multiple participants
- ✅ **Bandwidth Optimization** - Each participant sends once, receives multiple streams
- ✅ **Quality Adaptation** - Automatic bitrate adaptation based on network conditions
- ✅ **Multiple Codec Support** - VP8, VP9, H.264 video codecs + Opus audio

### **📹 Recording Capabilities**
- ✅ **One-Click Recording** - Start/stop recording with a single button
- ✅ **High-Quality Output** - H.264 video + Opus audio in MKV format
- ✅ **Server-Side Recording** - Uses FFmpeg for reliable recording
- ✅ **Real-time Status** - Live recording indicator with timer

### **🌐 Advanced NAT Traversal**
- ✅ **Full ICE Implementation** - Automatic connectivity establishment
- ✅ **STUN Servers** - Built-in NAT traversal for most networks
- ✅ **TURN Support** - Optional relay servers for restrictive networks
- ✅ **Auto-Discovery** - Finds the best connection path automatically

## 🛠️ Technology Stack

### **Backend**
- **NestJS** - Scalable Node.js framework
- **mediasoup** - WebRTC SFU (Selective Forwarding Unit)
- **Socket.IO** - Real-time bidirectional communication
- **FFmpeg** - Video/audio recording and processing
- **TypeScript** - Type-safe development

### **Frontend**
- **React** - Modern UI library
- **mediasoup-client** - WebRTC client library
- **Socket.IO Client** - Real-time communication
- **Styled Components** - CSS-in-JS styling
- **TypeScript** - Type-safe development

## 🚀 Quick Start (3 Steps!)

### **Prerequisites**
- Node.js 18+ and npm
- FFmpeg installed on the system (for recording)

### **1. Clone & Install**
```bash
git clone <your-repo>
cd webrtc-video-platform
npm install
cd frontend && npm install && cd ..
```

### **2. Start the Application**
```bash
# Option 1: Use the simple startup script
./start.sh

# Option 2: Manual startup
# Terminal 1 - Backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### **3. Start Video Calling!**
- Open http://localhost:3000
- Enter any room name + your name
- Click "Join Call" - that's it! 🎉

## 🎯 How It Works

### **Simple Room Flow:**
1. **Enter Room Name**: Any name creates a room automatically
2. **Enter Your Name**: Display name for other participants  
3. **Join Call**: Instantly connected - no registration needed
4. **Share Room Name**: Others join the same room by name

### **No Persistence Needed:**
- 🏠 **Rooms** are created on-demand when first user joins
- 👥 **Participants** exist only during the call
- 📹 **Recordings** are saved to local files (optional)
- 🗑️ **Everything cleans up** when the last person leaves

## 🔧 Configuration

### **Environment Variables (Optional)**
```env
# Basic Configuration (already set)
MEDIASOUP_ANNOUNCED_IP=127.0.0.1
RECORDINGS_PATH=./recordings
PORT=3001

# Production TURN Servers (optional)
TURN_SERVER_HOST=your-turn-server.com
TURN_USERNAME=your_username
TURN_PASSWORD=your_password
```

### **Network Protocols Used:**
- **WebRTC**: Core real-time communication
- **ICE**: Automatic NAT traversal and connectivity
- **STUN**: NAT type discovery (Google's free servers included)
- **TURN**: Relay traffic for restrictive networks (optional)
- **Socket.IO**: Signaling server communication

## 📁 Project Structure

```
webrtc-video-platform/
├── 🖥️  Backend (NestJS + mediasoup)
│   ├── src/modules/webrtc/          # Core WebRTC logic
│   │   ├── webrtc.gateway.ts        # WebSocket signaling
│   │   ├── mediasoup.service.ts     # SFU management
│   │   ├── room.service.ts          # In-memory room management
│   │   ├── recording.service.ts     # FFmpeg recording
│   │   └── config/                  # Configuration files
│   └── recordings/                  # Recorded meeting files
├── 📱 Frontend (React)
│   └── src/components/
│       ├── Landing/                 # Room join interface
│       ├── VideoCall/               # Main call interface
│       └── WebRTC/                  # mediasoup client
├── .env                             # Basic configuration
├── start.sh                         # One-command startup
└── WEBRTC_README.md                # This file
```

## 🌍 Production Deployment

### **For Local Networks (LAN/WiFi):**
- ✅ Works immediately with zero configuration
- ✅ No additional setup needed

### **For Internet Deployment:**
1. **Set Public IP**: Update `MEDIASOUP_ANNOUNCED_IP` in `.env`
2. **Enable HTTPS**: Required for camera/microphone access
3. **Open Ports**: UDP ports 10000-10100 on your server
4. **Optional TURN**: Add TURN servers for restrictive corporate networks

### **Docker Deployment:**
```bash
# Build containers
docker build -t webrtc-backend .
docker build -t webrtc-frontend ./frontend

# Run with docker-compose
docker-compose up
```

## 🎨 Features Demo

### **Video Call Controls:**
- 🎤 **Microphone**: Toggle audio on/off
- 📹 **Camera**: Toggle video on/off  
- 🔴 **Record**: Start recording the meeting
- ⏹️ **Stop Recording**: End active recording
- 📞 **Leave Call**: Exit the room
- 👥 **Participants**: View all connected users

### **Smart Features:**
- 📱 **Responsive Design**: Works on mobile and desktop
- 🔄 **Auto-Reconnect**: Handles network interruptions
- 📊 **Quality Adaptation**: Adjusts to network conditions
- 🎯 **Grid Layout**: Automatically adjusts for participant count

## 🆘 Troubleshooting

### **Common Issues:**
1. **Can't see/hear others**: Check browser permissions for camera/microphone
2. **Connection failed**: Ensure UDP ports 10000-10100 are open
3. **Recording not working**: Install FFmpeg and ensure write permissions
4. **High CPU usage**: Reduce video quality in configuration

### **Network Issues:**
- Most home networks work immediately with STUN servers
- Corporate networks may need TURN servers configured
- Use HTTPS in production for browser permissions

## 🎉 What Makes This Special

### **🚀 Instant Setup:**
- No complex database setup
- No user management system
- No authentication flows
- Just pure video calling!

### **🔒 Privacy-Focused:**
- No data stored permanently
- No user tracking
- Rooms disappear when empty
- Optional local recording only

### **⚡ Performance:**
- Memory-based room management
- Efficient SFU architecture
- Minimal server requirements
- Scales with demand

### **🛠️ Developer-Friendly:**
- Clean, modular code
- TypeScript throughout
- Extensive documentation
- Easy to customize

---

**🎯 Perfect for:**
- Quick video meetings
- Temporary collaboration
- Privacy-focused calls
- Prototype/demo applications
- Educational WebRTC learning

**Built with ❤️ for simplicity and performance!**