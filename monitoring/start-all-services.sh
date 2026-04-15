#!/bin/bash

echo "🚀 Starting K-System Services..."

# Start Docker services
echo "📦 Starting Docker containers..."
docker start mysql influxdb2 grafana mosquitto nodered telegraf 2>/dev/null

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 5

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 3001 > /dev/null &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$NGROK_URL" ]; then
  echo "✅ ngrok tunnel active: $NGROK_URL"
  echo ""
  echo "📝 Add this URL to Vercel environment variables:"
  echo "   NEXT_PUBLIC_API_URL=$NGROK_URL"
  echo "   API_URL=$NGROK_URL"
else
  echo "❌ Failed to start ngrok tunnel"
fi

echo ""
echo "🖥️  Starting Node.js API server..."
npm run dev

# Cleanup on exit
trap "kill $NGROK_PID 2>/dev/null" EXIT
