#!/bin/bash
set -Eeuo pipefail

WORKSPACE_PATH="${WORKSPACE_PATH:-$(pwd)}"
PORT=5000
APP_PORT="${APP_PORT:-$PORT}"

start_service() {
    cd "${WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${APP_PORT}..."
    npx next start --port "${APP_PORT}"
}

echo "Starting HTTP service on port ${APP_PORT}..."
start_service
