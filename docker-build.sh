#!/bin/bash

# Build script for MediSwift Docker containers

echo "Building MediSwift Docker containers..."

# Build backend image
echo "Building backend image..."
docker build -t mediswift-backend:latest ./backend

# Build frontend image
echo "Building frontend image..."
docker build -t mediswift-frontend:latest -f Dockerfile.frontend .

echo "Build completed successfully!"

# Optional: Push to registry (uncomment if needed)
# echo "Pushing images to registry..."
# docker tag mediswift-backend:latest your-registry/mediswift-backend:latest
# docker tag mediswift-frontend:latest your-registry/mediswift-frontend:latest
# docker push your-registry/mediswift-backend:latest
# docker push your-registry/mediswift-frontend:latest

echo "All images built successfully!"
echo "Run 'docker-compose up -d' to start the application"