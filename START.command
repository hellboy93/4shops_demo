#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1
PORT=8080
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do PORT=$((PORT + 1)); done
echo "4Shops → http://127.0.0.1:$PORT/"
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python not found. Install Python 3 or open index.html in Chrome."
  read -r _
  exit 1
fi
$PY -m http.server "$PORT" &
PID=$!
sleep 1
open "http://127.0.0.1:$PORT/"
echo "Server running. Close this window or press Ctrl+C to stop."
wait $PID
