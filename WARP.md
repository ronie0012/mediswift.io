# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MediSwift is a comprehensive healthcare platform built with React, TypeScript, and Vite. It provides services for medicine ordering, doctor appointments, emergency services, health records management, and more. The application uses a modern tech stack with Supabase as the backend, Radix UI for components, and Tailwind CSS for styling.

## Development Commands

### Essential Commands
- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

### Package Management
- Install dependencies: `npm install`
- The project uses npm as the package manager

## Architecture Overview

### Frontend Structure
- **React 18** with TypeScript and Vite bundler
- **Routing**: React Router v6 with lazy-loaded pages
- **State Management**: Multiple React Context providers for different domains
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom healthcare-themed color palette
- **Forms**: React Hook Form with Zod validation
- **API Layer**: Axios with JWT authentication and token refresh interceptors

### Key Context Providers
The app uses multiple context providers in a nested structure:
1. `AuthContext` - User authentication and session management
2. `CartContext` - Medicine cart functionality
3. `AddressContext` - User address management
4. `OrderContext` - Order tracking and management
5. `AppointmentContext` - Medical appointment scheduling

### Backend Integration
- **API Base URL**: Configurable via `VITE_API_URL` environment variable
- **Authentication**: JWT tokens with automatic refresh
- **Backend**: Django REST API (documented in `backend/API_DOCUMENTATION.md`)
- **Database**: Supabase (PostgreSQL)

### Component Architecture
- **UI Components**: Located in `src/components/ui/` (shadcn/ui)
- **Feature Components**: Located in `src/components/`
- **Pages**: Located in `src/pages/` with lazy loading for performance
- **Utilities**: Centralized in `src/lib/utils.ts` with date formatting, validation helpers, etc.

### Folder Structure
```
src/
├── components/        # Reusable components and UI elements
├── context/          # React Context providers for state management
├── data/            # Static data (doctors, medicines)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API services
├── pages/           # Route components (lazy-loaded)
```

### Configuration Files
- **Vite Config**: Custom server config with proxy for backend API
- **TypeScript**: Project references setup with separate app and node configs
- **Tailwind**: Custom theme with medical/emergency color palettes
- **ESLint**: TypeScript-specific rules with React hooks validation

## Environment Setup

### Required Environment Variables
See `.env.example` for complete list. Key variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL (default: http://localhost:8000/api)
- `VITE_APP_URL` - Frontend URL (default: http://localhost:8080)

### Development Server
- Frontend: `http://localhost:8080` (Vite dev server)
- Backend API proxy: `/api` routes are proxied to `http://localhost:8000`

## API Integration

### Authentication Flow
- JWT-based authentication with access/refresh token pattern
- Automatic token refresh via Axios interceptors
- Auth state managed through `AuthContext`
- Protected routes redirect to login when unauthenticated

### Error Handling
- Centralized error handling in `src/lib/errorHandling.ts`
- Network errors show user-friendly toast notifications
- API errors are logged and handled appropriately

## UI/UX Patterns

### Design System
- Uses shadcn/ui component library built on Radix UI primitives
- Custom color palette for medical (`medical-*`) and emergency (`emergency-*`) themes
- Consistent spacing and typography through Tailwind CSS
- Dark mode support via `next-themes`

### Component Patterns
- Form handling with React Hook Form and Zod schemas
- Loading states with custom `LoadingSpinner` component
- Error boundaries for robust error handling
- Responsive design with mobile-first approach

## Development Workflow

### Code Style
- TypeScript strict mode enabled
- ESLint with React-specific rules
- Prettier formatting (though no config file present)
- Import aliases configured (`@/` for src directory)

### Performance Optimization
- Lazy loading for route components
- Code splitting with manual chunks for vendor libraries
- Image optimization and proper loading states
- Minimal bundle size through tree shaking

## Testing

Currently no testing framework is configured. When adding tests, consider:
- Jest + React Testing Library for unit/integration tests
- Cypress or Playwright for e2e tests
- Mock Service Worker for API mocking

## Deployment

### Build Configuration
- Production builds use Terser for minification
- Console logs are stripped in production builds
- Source maps only generated in development
- Static assets are optimized and cached

### Supported Deployment Platforms
- Vercel (recommended - see README)
- Netlify
- Any static hosting service

## Common Development Tasks

### Adding New Routes
1. Create page component in `src/pages/`
2. Add lazy import in `App.tsx`
3. Add route configuration in the Routes component

### Adding New API Endpoints
1. Add service functions in appropriate file under `src/lib/`
2. Use the configured `api` instance from `src/lib/api.ts`
3. Handle errors appropriately with toast notifications

### Adding New UI Components
1. Use shadcn/ui CLI: `npx shadcn-ui@latest add [component-name]`
2. Components are automatically added to `src/components/ui/`
3. Follow existing patterns for theming and variants

### Context Management
When adding new global state:
1. Create context in `src/context/`
2. Add provider to the provider stack in `App.tsx`
3. Export custom hook for consuming the context