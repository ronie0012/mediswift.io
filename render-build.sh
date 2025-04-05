#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Build the project
npm run build

# Create a .env.production file for deployment
echo "VITE_API_URL=https://mediswift-backend.onrender.com" > .env.production
echo "VITE_APP_URL=https://mediswift-io.onrender.com" >> .env.production
echo "VITE_APP_ENV=production" >> .env.production

# Create redirects for SPA
echo '/* /index.html 200' > dist/_redirects 