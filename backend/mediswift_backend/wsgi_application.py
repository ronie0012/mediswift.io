import os
from django.core.wsgi import get_wsgi_application

# Set the production settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings_production')

# Get the WSGI application
application = get_wsgi_application()

# For Vercel deployment
app = application 