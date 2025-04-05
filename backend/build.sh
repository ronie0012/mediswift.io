#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Run migrations and collect static files
python manage.py collectstatic --noinput
python manage.py migrate 