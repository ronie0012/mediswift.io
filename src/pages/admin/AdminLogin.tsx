import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminLogin } from "@/lib/api.hooks";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync, isPending } = useAdminLogin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync({ username, password });
      toast({ title: "Login successful", description: "Welcome to the admin panel." });
      navigate("/admin/marketing");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err?.response?.data?.detail || "Invalid credentials. Staff accounts only.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-medical-500/10 p-8 w-full max-w-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-medical-100 mb-4">
            <ShieldCheck className="h-7 w-7 text-medical-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Staff accounts only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin_username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-medical-600 hover:bg-medical-700 h-12 rounded-xl mt-2"
          >
            {isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Sign In as Admin"}
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Token-based auth via <code className="bg-gray-100 px-1 rounded">/api/auth/token/</code>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
