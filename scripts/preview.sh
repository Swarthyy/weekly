#!/bin/sh
# preview.sh - Start dev servers accessible on your local network
# so you can preview the app on your phone's browser.

# Detect local network IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP=$(ifconfig 2>/dev/null | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
fi

if [ -z "$LOCAL_IP" ]; then
  echo "Error: Could not detect local IP address."
  echo "Make sure you are connected to a network."
  exit 1
fi

WEB_PORT=${WEB_PORT:-8081}
API_PORT=${PORT:-8787}

export EXPO_PUBLIC_API_BASE_URL="http://${LOCAL_IP}:${API_PORT}"
export REACT_NATIVE_PACKAGER_HOSTNAME="$LOCAL_IP"
export PORT="$API_PORT"

echo ""
echo "=========================================="
echo "  Mobile Preview"
echo "=========================================="
echo ""
echo "  Open on your phone:"
echo "  http://${LOCAL_IP}:${WEB_PORT}"
echo ""
echo "  API server:"
echo "  http://${LOCAL_IP}:${API_PORT}"
echo ""
echo "  Make sure your phone is on the"
echo "  same WiFi network as this computer."
echo "=========================================="
echo ""

# Start API server in background
node server/index.js &
API_PID=$!

# Clean up API server when this script exits
cleanup() {
  kill $API_PID 2>/dev/null
}
trap cleanup EXIT INT TERM

# Start Expo web (foreground)
npx expo start --web --port "$WEB_PORT" --host lan
