"""
ASGI config for mediswift_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')

# Get the Django ASGI application first
django_asgi_app = get_asgi_application()

# Now import Django-dependent modules after Django is set up
from channels.routing import ProtocolTypeRouter

application = ProtocolTypeRouter({
    "http": django_asgi_app,
})