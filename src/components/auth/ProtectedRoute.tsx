
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, ReactNode, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Save the intended path for redirection after login
    const saveIntendedPath = () => {
      if (!user && !loading && location.pathname !== '/auth/login') {
        sessionStorage.setItem('intendedPath', location.pathname);
      }
    };

    saveIntendedPath();

    if (!loading) {
      // If not logged in, redirect to login
      if (!user) {
        navigate('/auth/login', { replace: true });
      } 
      // If admin-only and user is not admin, redirect to dashboard
      else if (adminOnly && !isAdmin) {
        navigate('/dashboard', { replace: true });
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, navigate, adminOnly, isAdmin, location.pathname]);

  // Show loading state while checking authorization
  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  // If we reach here, the user is authenticated and has proper permissions
  return <>{children}</>;
}
