#!/bin/bash

# Run script for MediSwift Docker containers

echo "Starting MediSwift application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your configuration"
fi

# Start the application
echo "Starting containers..."
docker-compose up -d

echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "Checking service status..."
docker-compose ps

echo ""
echo "MediSwift application is starting up!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo "MongoDB: localhost:27017"
echo "Redis: localhost:6379"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"