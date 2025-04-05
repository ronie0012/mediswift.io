import os
from django.core.wsgi import get_wsgi_application

# Set the production settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings_production')

try:
    # Get the WSGI application
    application = get_wsgi_application()
    print("WSGI application initialized successfully")
except Exception as e:
    print(f"Error initializing WSGI application: {e}")
    # Still create an application to avoid deployment errors
    def application(environ, start_response):
        status = '500 Internal Server Error'
        response_headers = [('Content-type', 'text/plain')]
        start_response(status, response_headers)
        return [b'Internal Server Error - Application failed to initialize']

# For Vercel deployment
app = application 