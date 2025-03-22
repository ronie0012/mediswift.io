import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'

// Auth Context
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Import layouts
import Layout from './components/layout/Layout'
import AdminLayout from './app/admin/layout'

// ErrorBoundary component to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid red',
          borderRadius: '5px'
        }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '15px',
              padding: '8px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple test component to verify rendering
const TestComponent = () => {
  const [counter, setCounter] = useState(0);
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>MediSwift is loading...</h1>
      <p>If you see this, basic React rendering is working!</p>
      <p>Counter: {counter}</p>
      <button 
        onClick={() => setCounter(counter + 1)}
        style={{
          padding: '10px 20px',
          margin: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click me
      </button>
    </div>
  );
};

// Dynamic parameter wrappers to handle Next.js style pages
const MedicineDetailsWrapper = () => {
  const { id } = useParams();
  const MedicineDetailsPage = require('./app/medicines/[id]/page').default;
  return <MedicineDetailsPage params={{ id }} />;
};

const MedicineReviewWrapper = () => {
  const { id } = useParams();
  const MedicineReviewPage = require('./app/medicines/[id]/review/page').default;
  return <MedicineReviewPage params={{ id }} />;
};

const DoctorDetailsWrapper = () => {
  const { id } = useParams();
  const DoctorDetailsPage = require('./app/doctors/[id]/page').default;
  return <DoctorDetailsPage params={{ id }} />;
};

const OrderDetailsWrapper = () => {
  const { id } = useParams();
  const OrderDetailsPage = require('./app/orders/[id]/page').default;
  return <OrderDetailsPage params={{ id }} />;
};

// Direct imports for non-dynamic pages
const HomePage = React.lazy(() => import('./app/page'));
const MedicinesPage = React.lazy(() => import('./app/medicines/page'));
const DoctorsPage = React.lazy(() => import('./app/doctors/page'));
const AppointmentBookingPage = React.lazy(() => import('./app/appointments/page'));
const CartPage = React.lazy(() => import('./app/cart/page'));
const CheckoutPage = React.lazy(() => import('./app/checkout/page'));
const OrdersPage = React.lazy(() => import('./app/orders/page'));
const DashboardPage = React.lazy(() => import('./app/dashboard/page'));
const ContactPage = React.lazy(() => import('./app/contact/page'));

// Auth pages
const LoginPage = React.lazy(() => import('./app/auth/login/page'));
const RegisterPage = React.lazy(() => import('./app/auth/register/page'));
const ResetPasswordPage = React.lazy(() => import('./app/auth/reset-password/page'));
const NewPasswordPage = React.lazy(() => import('./app/auth/new-password/page'));

// Admin pages
const AdminDashboardPage = React.lazy(() => import('./app/admin/dashboard/page'));
const AdminProductsPage = React.lazy(() => import('./app/admin/products/page'));
const AdminOrdersPage = React.lazy(() => import('./app/admin/orders/page'));

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('sb-auth-token')
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  
  return <>{children}</>
}

// AdminRoute component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('sb-auth-token')
  const userRole = localStorage.getItem('user-role')
  
  if (!isAuthenticated || userRole !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  const [showRoutes, setShowRoutes] = useState(false);
  
  useEffect(() => {
    // Delay showing routes to allow for debugging if needed
    const timer = setTimeout(() => {
      setShowRoutes(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!showRoutes) {
    return <TestComponent />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <React.Suspense fallback={<div className="loading">Loading...</div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Layout><HomePage /></Layout>} />
                <Route path="/medicines" element={<Layout><MedicinesPage /></Layout>} />
                <Route path="/medicines/:id" element={<Layout><MedicineDetailsWrapper /></Layout>} />
                <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
                <Route path="/doctors/:id" element={<Layout><DoctorDetailsWrapper /></Layout>} />
                <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
                
                {/* Auth routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="/auth/new-password" element={<NewPasswordPage />} />
                
                {/* Protected routes */}
                <Route path="/medicines/:id/review" element={
                  <ProtectedRoute>
                    <Layout><MedicineReviewWrapper /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <Layout><AppointmentBookingPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Layout><CartPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Layout><CheckoutPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Layout><OrdersPage /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <Layout><OrderDetailsWrapper /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><DashboardPage /></Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminLayout><AdminDashboardPage /></AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminLayout><AdminProductsPage /></AdminLayout>
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminLayout><AdminOrdersPage /></AdminLayout>
                  </AdminRoute>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
