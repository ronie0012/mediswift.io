# MediSwift - Online Medicine Delivery Platform

MediSwift is a comprehensive online medicine delivery platform that allows users to browse, order, and track deliveries of pharmaceutical products. The platform also offers doctor consultations, appointment scheduling, and personalized healthcare recommendations.

## Features

### For Customers
- **Medicine Catalog**: Browse and search through a wide range of medicines
- **Advanced Filtering**: Filter medicines by category, price range, availability
- **Prescription Upload**: Securely upload prescriptions for restricted medicines
- **Doctor Consultations**: Book appointments with specialists
- **Order Tracking**: Track orders in real-time
- **User Dashboard**: Manage orders, prescriptions, and medical history
- **Review System**: Rate and review medicines and doctors

### For Administrators
- **Inventory Management**: Add, update, and track medicine stock
- **Order Management**: Process, approve, and track customer orders
- **User Management**: Manage customer accounts and access
- **Analytics Dashboard**: View sales, user growth, and inventory statistics

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: React Context API, React Query
- **Routing**: React Router
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel/Netlify (frontend), Supabase (backend)

## Project Structure

```
mediswift/
├── public/            # Static assets
├── src/
│   ├── app/           # Main application pages
│   ├── components/    # Reusable UI components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and libraries
│   ├── services/      # API service functions
│   └── types/         # TypeScript interfaces and types
├── supabase/
│   ├── migrations/    # Database migrations
│   └── seed.sql       # Seed data for development
└── ...configuration files
```

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mediswift.git
   cd mediswift
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. Set up the database
   ```bash
   # Run migrations
   npx supabase migration up
   
   # Seed the database with initial data
   npx supabase db seed
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Build for production
   ```bash
   npm run build
   ```

## Deployment

### Frontend Deployment

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy to Vercel/Netlify:
   - Connect your GitHub repository to Vercel/Netlify
   - Configure environment variables in the deployment platform
   - Deploy the project

### Database Deployment

1. Create a production Supabase project
2. Run migrations on the production database
3. Update environment variables in your deployed frontend to point to the production Supabase instance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [Vite](https://vitejs.dev/)
