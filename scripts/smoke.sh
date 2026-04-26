#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"

echo "Checking backend health..."
curl -fsS "$BACKEND_URL/api/health" | python3 -m json.tool

echo "Checking Ollama provider through backend..."
curl -fsS "$BACKEND_URL/api/providers/ollama" | python3 -m json.tool

echo "Checking recent events..."
curl -fsS "$BACKEND_URL/api/events/recent?limit=10" | python3 -m json.tool
