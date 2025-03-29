#!/bin/bash

# Initialize Supabase project if not already initialized
if [ ! -f "supabase/config.toml" ]; then
  echo "Initializing Supabase project..."
  npx supabase init
fi

# Start Supabase local development setup
echo "Starting Supabase local development..."
npx supabase start

# Generate types from the database
echo "Generating TypeScript types from database schema..."
npx supabase gen types typescript --local > src/types/database.types.ts

echo "Supabase local development environment is ready!"
echo "You can use the local API URL and anon key for development."
echo "To stop Supabase, run: npx supabase stop" 