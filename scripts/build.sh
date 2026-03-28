#!/bin/bash
set -Eeuo pipefail

WORKSPACE_PATH="${WORKSPACE_PATH:-$(pwd)}"

cd "${WORKSPACE_PATH}"

if [[ "${VERCEL:-}" != "1" ]]; then
  echo "Installing dependencies..."
  pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only
else
  echo "Using dependencies installed by Vercel."
fi

echo "Building the project..."
npx next build

echo "Build completed successfully!"
