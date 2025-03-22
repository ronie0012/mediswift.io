import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff 
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await signIn(email, password);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = (provider: "google" | "facebook") => {
    toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is coming soon!`);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:p-10 p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Login to access your MediSwift account</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-medical-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me for 30 days
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-medical-500 hover:bg-medical-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-medical-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                type="button" 
                className="w-full"
                onClick={() => handleSocialLogin("google")}
              >
                Google
              </Button>
              <Button 
                variant="outline" 
                type="button" 
                className="w-full"
                onClick={() => handleSocialLogin("facebook")}
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
