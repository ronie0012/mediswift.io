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
- **AI-Powered Chat Assistant** - Real-time chat with an AI healthcare assistant

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Query
- React Router
- Radix UI Components
- Django Channels (for WebSocket support)

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Git
- Python 3.8+
- Django 4.2+

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mediswift.git
   cd mediswift
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your Supabase credentials and other configuration.

6. Run database migrations:
   ```bash
   python manage.py migrate
   ```

7. Start the development server:
   ```bash
   # In one terminal, start the backend
   cd backend
   python manage.py runserver
   
   # In another terminal, start the frontend
   cd ..
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Chat Feature

The MediSwift platform includes an AI-powered chat assistant that provides real-time healthcare support:

- Real-time messaging using WebSockets
- Secure authentication integration
- Context-aware AI responses
- Message history persistence
- Responsive chat interface

To use the chat feature:
1. Log in to the application
2. Click the chat icon in the bottom right corner
3. Start chatting with the AI assistant

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

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure environment variables in Netlify
4. Deploy!

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

## Screenshot of project :-

![image](https://github.com/user-attachments/assets/a618ca36-a6ee-44e8-a57c-76283ad0fdef)
![image](https://github.com/user-attachments/assets/8a0a282e-5f8e-473f-9096-a96cace16228)
![image](https://github.com/user-attachments/assets/54cdf950-a051-48c6-88f0-0f5a9593d851)
![image](https://github.com/user-attachments/assets/014d9335-dc16-4b35-8e41-482180938efb)