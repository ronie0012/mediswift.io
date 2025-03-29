# MediSwift Backend

This is the backend for MediSwift, an AI-powered healthcare platform for instant doctor appointments, medicine delivery, and ambulance services.

## Tech Stack

- Supabase (PostgreSQL, Authentication, Edge Functions, Storage, and API)
- TypeScript
- React (for frontend)

## Features

- ✅ User Authentication – Secure login, signup, and session management using Supabase Auth
- ✅ Database Management – PostgreSQL setup with tables for users, doctors, appointments, prescriptions, and orders
- ✅ API Endpoints – RESTful APIs for booking appointments, ordering medicines, and managing ambulance requests
- ✅ Role-Based Access Control (RBAC) – Different access levels for patients, doctors, and admins
- ✅ Real-Time Updates – Supabase real-time features for instant status updates
- ✅ Secure Data Handling – Using service_role key only on the backend and storing API keys in .env

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase CLI (optional, for local development)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mediswift.git
   cd mediswift
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Setting up Supabase Locally (Optional)

1. Install the Supabase CLI
   ```bash
   npm install -g supabase
   ```

2. Run the setup script
   ```bash
   chmod +x supabase/setup.sh
   ./supabase/setup.sh
   ```

3. This will start a local Supabase instance and apply the database migrations

## Folder Structure

```
mediswift/
├── public/                # Static assets
├── src/
│   ├── lib/               # API and service functions
│   │   ├── auth.ts        # Authentication services
│   │   ├── profiles.ts    # User profile services
│   │   ├── doctors.ts     # Doctor-related services
│   │   ├── appointments.ts # Appointment services
│   │   ├── prescriptions.ts # Prescription services
│   │   ├── pharmacy.ts    # Pharmacy and medicine services
│   │   ├── ambulance.ts   # Ambulance services
│   │   ├── notifications.ts # Notification services
│   │   ├── payments.ts    # Payment services
│   │   ├── reviews.ts     # Review services
│   │   ├── medical-records.ts # Medical records services
│   │   ├── supabase.ts    # Supabase client initialization
│   │   └── index.ts       # Export all services
│   ├── types/             # TypeScript type definitions
│   │   └── database.types.ts # Database types
├── supabase/
│   ├── migrations/        # Database migrations
│   │   ├── 20230701000000_initial_schema.sql
│   │   └── 20230701000001_seed_data.sql
│   ├── setup.sh           # Setup script for local development
│   └── storage.sql        # Storage bucket setup
└── .env                   # Environment variables (not committed to git)
```

## API Reference

The backend provides API endpoints for all core features:

- Authentication (signup, login, logout)
- User profiles (create, update, get)
- Doctors (list, search, filter)
- Appointments (book, cancel, reschedule)
- Prescriptions (create, view)
- Pharmacy (medicine inventory, orders)
- Ambulance services (request, track)
- Payments
- Reviews and ratings

## License

[MIT](LICENSE)
