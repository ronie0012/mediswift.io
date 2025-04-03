#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run migrations (if needed for Vercel)
python manage.py migrate --noinput

# Create a superuser (optional, only if needed)
# python manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL

# Collect static files
python manage.py collectstatic --noinput

echo "Build completed successfully!" 