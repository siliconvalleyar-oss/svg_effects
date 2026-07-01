#!/bin/bash
PORT=${1:-8080}
echo "Iniciando servidor en http://localhost:$PORT"
python3 -m http.server "$PORT" -d "$(dirname "$0")"