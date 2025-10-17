"""
Docker-specific Django settings for mediswift_backend project.
"""

from .settings import *
import os

# Keep SQLite for Django admin and auth, use MongoDB for app data
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/app/db.sqlite3',
    }
}

# MongoDB connection using mongoengine
import mongoengine

def connect_mongodb():
    try:
        mongoengine.connect(
            db=os.environ.get('MONGO_DB_NAME', 'mediswift'),
            host=os.environ.get('MONGO_HOST', 'mongodb'),
            port=int(os.environ.get('MONGO_PORT', 27017)),
            username=os.environ.get('MONGO_USERNAME', ''),
            password=os.environ.get('MONGO_PASSWORD', ''),
            authentication_source=os.environ.get('MONGO_AUTH_SOURCE', 'admin'),
        )
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")

# Connect to MongoDB
connect_mongodb()

# Redis for Channels (WebSocket)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(os.environ.get('REDIS_HOST', 'redis'), int(os.environ.get('REDIS_PORT', 6379)))],
        },
    },
}

# Security settings for Docker
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-docker-key-change-in-production')

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'backend',
    'frontend',
    os.environ.get('ALLOWED_HOST', '*'),
]

# CORS settings for Docker
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:80",
    "http://127.0.0.1:80",
]

CORS_ALLOW_ALL_ORIGINS = True  # For development only

# Static files
STATIC_ROOT = '/app/staticfiles'
MEDIA_ROOT = '/app/media'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}