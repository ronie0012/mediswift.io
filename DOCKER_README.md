# MediSwift Docker Deployment

This guide explains how to deploy the MediSwift application using Docker containers.

## Architecture

The application consists of the following services:

- **Frontend**: React + Vite application served by Nginx
- **Backend**: Django application with WebSocket support
- **MongoDB**: Database for storing application data
- **Redis**: Cache and message broker for WebSocket channels

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for containers

## Quick Start

### 1. Build Images

```bash
# Make build script executable
chmod +x docker-build.sh

# Build all images
./docker-build.sh
```

### 2. Start Application

```bash
# Make run script executable
chmod +x docker-run.sh

# Start all services
./docker-run.sh
```

### 3. Access Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin (admin/admin123)

## Manual Commands

### Build Images

```bash
# Build backend
docker build -t mediswift-backend:latest ./backend

# Build frontend
docker build -t mediswift-frontend:latest -f Dockerfile.frontend .
```

### Run Services

```bash
# Production environment
docker-compose up -d

# Development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Configuration

### Production Environment Variables

Create a `.env` file in the root directory:

```env
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this
ALLOWED_HOST=yourdomain.com

# MongoDB Settings
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DB_NAME=mediswift
MONGO_USERNAME=admin
MONGO_PASSWORD=your-secure-password
MONGO_AUTH_SOURCE=admin

# Redis Settings
REDIS_HOST=redis
REDIS_PORT=6379
```

### Development Environment

For development, use `docker-compose.dev.yml` which includes:
- Debug mode enabled
- Hot reloading for backend
- Development-friendly settings

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Database Management

### MongoDB Access

```bash
# Connect to MongoDB container
docker exec -it mediswift_mongodb mongosh

# Use the mediswift database
use mediswift

# Show collections
show collections
```

### Django Management Commands

```bash
# Run migrations
docker exec -it mediswift_backend python manage.py migrate

# Create superuser
docker exec -it mediswift_backend python manage.py createsuperuser

# Collect static files
docker exec -it mediswift_backend python manage.py collectstatic

# Django shell
docker exec -it mediswift_backend python manage.py shell
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Service Status

```bash
# Check running containers
docker-compose ps

# Check resource usage
docker stats
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :80
   netstat -tulpn | grep :8000
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Frontend Build Issues**
   ```bash
   # Rebuild frontend image
   docker-compose build frontend --no-cache
   ```

4. **Backend Migration Issues**
   ```bash
   # Reset database (WARNING: This will delete all data)
   docker-compose down -v
   docker-compose up -d
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi mediswift-backend:latest mediswift-frontend:latest

# Rebuild and restart
./docker-build.sh
./docker-run.sh
```

## Production Deployment

### Security Considerations

1. **Change Default Passwords**
   - Update MongoDB admin password
   - Set a strong Django SECRET_KEY
   - Use environment-specific credentials

2. **Network Security**
   - Use Docker secrets for sensitive data
   - Configure firewall rules
   - Enable SSL/TLS certificates

3. **Resource Limits**
   ```yaml
   # Add to docker-compose.yml services
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

### Backup Strategy

```bash
# Backup MongoDB
docker exec mediswift_mongodb mongodump --out /backup

# Backup volumes
docker run --rm -v mediswift_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data
```

## Scaling

### Horizontal Scaling

```yaml
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer (nginx, traefik, etc.)
```

### Performance Optimization

1. **Enable Redis persistence**
2. **Configure MongoDB replica set**
3. **Use CDN for static files**
4. **Implement caching strategies**

## Support

For issues and questions:
1. Check the logs first
2. Review this documentation
3. Check Docker and application-specific documentation
4. Create an issue in the project repository