import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not logged in, redirect to login
      if (!user) {
        router.push('/login');
      } 
      // If admin-only and user is not admin, redirect to dashboard
      else if (adminOnly && !isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, adminOnly, isAdmin]);

  // Show nothing while loading or if not authenticated / not authorized
  if (loading || !user || (adminOnly && !isAdmin)) {
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