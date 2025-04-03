# MediSwift - Healthcare Platform

MediSwift is a comprehensive healthcare platform that provides services for medicines, doctor appointments, and emergency services.

## Features

- Medicine ordering and delivery
- Doctor appointments and consultations
- Emergency services booking
- Health packages
- Online consultations
- Health records management
- Lab tests booking
- Health blogs and articles

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Query
- React Router
- Radix UI Components

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mediswift.git
   cd mediswift
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase credentials and other configuration.

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`.

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

## Deployment

### Deploying to Netlify

This project is configured for deployment on Netlify, which will host both the frontend React application and the backend Django API using serverless functions.

#### Prerequisites

1. A Netlify account
2. Git repository with your project
3. PostgreSQL database (such as Supabase or a managed PostgreSQL service)

#### Steps to Deploy

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your Netlify account and click "New site from Git"

3. Connect to your Git provider and select your repository

4. Configure the build settings:
   - Build command: (this is configured in netlify.toml)
   - Publish directory: (this is configured in netlify.toml)

5. Configure the required environment variables in Netlify:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: A secure random string for Django
   - `DJANGO_SETTINGS_MODULE`: Set to `mediswift_backend.netlify_settings`
   - Other environment variables as needed (email settings, API keys, etc.)

6. Deploy the site

7. After the initial deployment, you might need to run database migrations manually:
   - Go to Netlify site settings > Functions > Console
   - Run: `cd backend && python manage.py migrate`

#### How It Works

- The React frontend is built and served as static files
- API requests to `/api/*` are routed to serverless functions
- The Django backend runs as a serverless function
- Static files are served by Netlify's CDN
- The Django database uses an external PostgreSQL service

#### Troubleshooting

If you encounter issues after deployment:

1. Check the Netlify function logs for errors
2. Verify environment variables are set correctly
3. Ensure database connections are working
4. Check CORS settings if frontend can't communicate with backend

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@mediswift.io or join our Slack channel.

## Updated
Project dependencies installed and running successfully.
