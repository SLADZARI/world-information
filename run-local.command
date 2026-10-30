#!/bin/bash
# Double-click on macOS after git clone, or run: bash run-local.command
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v python3 >/dev/null; then
  echo "Python 3 is required. Install it, or serve this repository with another local HTTP server."
  exit 1
fi
PORT="${PORT:-8000}"
if ! [[ "$PORT" =~ ^[0-9]{2,5}$ ]]; then
  echo "PORT must be numeric (e.g. 8000)"
  exit 1
fi
echo "World Information at http://127.0.0.1:${PORT}/"
echo "Close with Control-C. Three.js requires internet access to its pinned CDN."
python3 -m http.server "$PORT" --bind 127.0.0.1 &
PID=$!
trap 'kill "$PID" >/dev/null 2>&1 || true' EXIT
sleep 1
if ! kill -0 "$PID" 2>/dev/null; then echo "Could not start server (port may be in use)."; exit 1; fi
if command -v open >/dev/null; then open "http://127.0.0.1:${PORT}/"; fi
wait "$PID"
