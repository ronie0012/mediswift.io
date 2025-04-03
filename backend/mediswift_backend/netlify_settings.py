"""
Django settings for mediswift_backend project on Netlify.
"""

import os
import dj_database_url
from pathlib import Path
from .settings import *  # Import base settings

# Override base settings for production

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Use environment variable for secret key
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)

# Allow all Netlify domains and the custom domain
ALLOWED_HOSTS = ['.netlify.app', os.environ.get('SITE_URL', '')]

# Add Netlify domain to CORS allowed origins
CORS_ALLOWED_ORIGINS += [
    os.environ.get('URL', ''),  # Netlify URL
    os.environ.get('SITE_URL', ''),  # Custom domain
]

# Configure database with Netlify environment
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True,
        )
    }

# Static files and media settings
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add whitenoise middleware
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Security settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'mediswift@example.com') 