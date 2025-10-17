# MediSwift Docker Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the MediSwift application using Docker containers with MongoDB as the database.

## Architecture Components

- **Frontend**: React + Vite + TypeScript (Nginx server)
- **Backend**: Django + Django Channels (WebSocket support)
- **Database**: MongoDB 7.0
- **Cache/Message Broker**: Redis 7
- **Reverse Proxy**: Nginx (for frontend)

## Prerequisites

1. **Docker Engine** (version 20.10 or higher)
2. **Docker Compose** (version 2.0 or higher)
3. **Minimum System Requirements**:
   - 4GB RAM
   - 10GB free disk space
   - CPU: 2 cores recommended

## Installation Steps

### Step 1: Verify Docker Installation

```bash
# Check Docker version
docker --version
docker-compose --version

# Test Docker
docker run hello-world
```

### Step 2: Clone and Setup

```bash
# Navigate to project directory
cd /path/to/mediswift.io

# Copy environment file
cp .env.example .env

# Edit environment variables (important!)
# Update SECRET_KEY, MONGO_PASSWORD, and other sensitive values
```

### Step 3: Build Docker Images

**On Windows:**
```cmd
docker-build.bat
```

**On Linux/Mac:**
```bash
chmod +x docker-build.sh
./docker-build.sh
```

**Manual Build:**
```bash
# Build backend
docker build -t mediswift-backend:latest ./backend

# Build frontend
docker build -t mediswift-frontend:latest -f Dockerfile.frontend .
```

### Step 4: Start Services

**On Windows:**
```cmd
docker-run.bat
```

**On Linux/Mac:**
```bash
chmod +x docker-run.sh
./docker-run.sh
```

**Manual Start:**
```bash
# Production
docker-compose up -d

# Development (with debug mode)
docker-compose -f docker-compose.dev.yml up -d
```

### Step 5: Verify Deployment

1. **Check Services Status:**
   ```bash
   docker-compose ps
   ```

2. **Access Applications:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

3. **Default Credentials:**
   - Username: `admin`
   - Password: `admin123`

## Configuration

### Environment Variables

Edit `.env` file for production:

```env
# Security (CHANGE THESE!)
DEBUG=False
SECRET_KEY=your-256-bit-secret-key-here
ALLOWED_HOST=yourdomain.com

# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=your-secure-password-here
MONGO_DB_NAME=mediswift

# Application URLs
VITE_API_URL=https://yourdomain.com/api
VITE_WS_BASE_URL=wss://yourdomain.com
```

### MongoDB Configuration

The MongoDB container is configured with:
- **Port**: 27017
- **Database**: mediswift
- **Admin User**: admin
- **Default Password**: password123 (change this!)

### Redis Configuration

Redis is used for:
- WebSocket channel layers
- Session storage
- Caching

## Management Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f
docker-compose logs -f backend

# Scale services
docker-compose up -d --scale backend=3
```

### Database Management

```bash
# Django migrations
docker exec -it mediswift_backend python manage.py migrate

# Create superuser
docker exec -it mediswift_backend python manage.py createsuperuser

# Django shell
docker exec -it mediswift_backend python manage.py shell

# MongoDB shell
docker exec -it mediswift_mongodb mongosh
```

### Backup and Restore

```bash
# Backup MongoDB
docker exec mediswift_mongodb mongodump --out /backup --db mediswift

# Backup volumes
docker run --rm -v mediswift_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz /data

# Restore MongoDB
docker exec -i mediswift_mongodb mongorestore /backup
```

## Monitoring

### Health Checks

```bash
# Check container health
docker-compose ps

# Resource usage
docker stats

# Service logs
docker-compose logs --tail=50 -f backend
```

### Performance Monitoring

1. **MongoDB Monitoring:**
   ```bash
   docker exec -it mediswift_mongodb mongosh --eval "db.stats()"
   ```

2. **Redis Monitoring:**
   ```bash
   docker exec -it mediswift_redis redis-cli info
   ```

## Troubleshooting

### Common Issues

1. **Port Already in Use:**
   ```bash
   # Find process using port
   netstat -tulpn | grep :80
   netstat -tulpn | grep :8000
   
   # Kill process or change port in docker-compose.yml
   ```

2. **Database Connection Failed:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Frontend Build Errors:**
   ```bash
   # Rebuild with no cache
   docker-compose build frontend --no-cache
   ```

4. **Backend Migration Issues:**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Run migrations manually
   docker exec -it mediswift_backend python manage.py migrate
   ```

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker rmi mediswift-backend:latest mediswift-frontend:latest

# Remove unused volumes
docker volume prune

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

### Security Checklist

- [ ] Change default passwords
- [ ] Set strong SECRET_KEY
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Enable Docker secrets
- [ ] Configure backup strategy
- [ ] Set up monitoring
- [ ] Configure log rotation

### Performance Optimization

1. **Resource Limits:**
   ```yaml
   # Add to services in docker-compose.yml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 1G
   ```

2. **MongoDB Optimization:**
   - Enable authentication
   - Configure replica set
   - Set up proper indexes
   - Configure memory limits

3. **Redis Optimization:**
   - Enable persistence
   - Configure memory policies
   - Set up clustering if needed

### SSL/HTTPS Setup

1. **Using Let's Encrypt with Nginx:**
   ```bash
   # Add certbot container to docker-compose.yml
   # Configure nginx with SSL certificates
   ```

2. **Update nginx.conf for HTTPS:**
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/ssl/certs/cert.pem;
       ssl_certificate_key /etc/ssl/private/key.pem;
       # ... rest of configuration
   }
   ```

## Support and Maintenance

### Regular Maintenance

1. **Weekly Tasks:**
   - Check logs for errors
   - Monitor resource usage
   - Backup database
   - Update security patches

2. **Monthly Tasks:**
   - Update Docker images
   - Review and rotate logs
   - Performance analysis
   - Security audit

### Getting Help

1. **Check Logs First:**
   ```bash
   docker-compose logs -f
   ```

2. **Common Log Locations:**
   - Backend: Django logs in container
   - Frontend: Nginx access/error logs
   - Database: MongoDB logs
   - Cache: Redis logs

3. **Debug Mode:**
   ```bash
   # Enable debug mode
   docker-compose -f docker-compose.dev.yml up -d
   ```

For additional support, refer to:
- Django documentation
- MongoDB documentation
- Docker documentation
- Project-specific README files