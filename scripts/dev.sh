#!/bin/bash
set -Eeuo pipefail

PORT=5000
WORKSPACE_PATH="${WORKSPACE_PATH:-$(pwd)}"
APP_PORT="${APP_PORT:-$PORT}"

cd "${WORKSPACE_PATH}"

kill_port_if_listening() {
    local pids
    pids=$(lsof -ti tcp:"${APP_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true)
    if [[ -z "${pids}" ]]; then
      echo "Port ${APP_PORT} is free."
      return
    fi
    echo "Port ${APP_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -I {} kill -9 {}
    sleep 1
    pids=$(lsof -ti tcp:"${APP_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${APP_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${APP_PORT} cleared."
    fi
}

echo "Clearing port ${APP_PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${APP_PORT} for dev..."

npx next dev --webpack --port "${APP_PORT}"
