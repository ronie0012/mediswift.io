import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuthCheck } from "@/lib/api.hooks";
import { Loader2, ShieldOff } from "lucide-react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useAdminAuthCheck();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      // Don't redirect automatically — show Access Denied
    }
  }, [isError, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-medical-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-sm">
          <ShieldOff className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">
            You need admin privileges to view this page. Please log in with a staff account.
          </p>
          <a
            href="/admin/login"
            className="bg-medical-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-medical-700 transition-colors inline-block"
          >
            Admin Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
