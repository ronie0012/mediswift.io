#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
until nc -z mongodb 27017; do
  echo "MongoDB is unavailable - sleeping"
  sleep 1
done
echo "MongoDB is up - executing command"

# Wait a bit more for MongoDB to be fully ready
sleep 5

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"

# Start server
echo "Starting server..."
exec daphne -b 0.0.0.0 -p 8000 mediswift_backend.asgi:application