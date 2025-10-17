@echo off
echo Building MediSwift Docker containers...

echo Building backend image...
docker build -t mediswift-backend:latest ./backend

echo Building frontend image...
docker build -t mediswift-frontend:latest -f Dockerfile.frontend .

echo Build completed successfully!
echo Run 'docker-compose up -d' to start the application
pause