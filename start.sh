#!/bin/bash

# WebRTC Video Calling Platform Startup Script
echo "🚀 Starting WebRTC Video Calling Platform..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Create recordings directory if it doesn't exist
mkdir -p recordings

echo "🎬 Starting backend server..."
npm run start:dev &

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🎨 Starting frontend..."
cd frontend && npm start &

echo "✅ Setup complete!"
echo "📱 Frontend: http://localhost:3000"
echo "🖥️  Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
wait