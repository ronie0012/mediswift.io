@echo off
echo Starting MediSwift application...

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update the .env file with your configuration
)

echo Starting containers...
docker-compose up -d

echo Waiting for services to be ready...
timeout /t 10 /nobreak > nul

echo Checking service status...
docker-compose ps

echo.
echo MediSwift application is starting up!
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo MongoDB: localhost:27017
echo Redis: localhost:6379
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
pause