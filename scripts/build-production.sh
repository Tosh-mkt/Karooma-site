#!/bin/bash
set -e

echo "Installing production dependencies..."
npm install --production=false

echo "Building frontend..."
npm run build

echo "Build complete!"
