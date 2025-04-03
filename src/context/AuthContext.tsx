import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import authService from "../lib/auth.service";
import { handleApiError } from '../lib/errorHandling';

// Update the user schema to match the Django backend user structure
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional()
});

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (username: string, email: string, password: string, password2: string, first_name: string, last_name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  validatePassword: (password: string) => boolean;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await checkAuthStatus();
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const checkAuthStatus = async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      return false;
    }
    
    try {
      // First try to get the stored user
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Verify the token is still valid
      await authService.verifyToken(token);
      
      // If token is valid but we don't have user data, fetch it
      if (!storedUser) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error("Token validation failed:", error);
      // Clear invalid auth data
      authService.logout();
      setUser(null);
      return false;
    }
  };
  
  const validatePassword = (password: string): boolean => {
    // Django's default password validator requires at least 8 characters
    return password.length >= 8;
  };
  
  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ username, password });
      
      // data.user should be set by the auth service
      setUser(data.user);
      
      toast.success("Logged in successfully!");
      return Promise.resolve();
    } catch (error: any) {
      handleApiError(error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.non_field_errors?.[0] || 
                          "Login failed. Please check your credentials.";
      toast.error(errorMessage);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (
    username: string, 
    email: string, 
    password: string, 
    password2: string, 
    first_name: string, 
    last_name: string
  ) => {
    setIsLoading(true);
    try {
      if (!validatePassword(password)) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      if (password !== password2) {
        throw new Error("Passwords do not match");
      }
      
      const data = await authService.register({
        username,
        email,
        password,
        password2,
        first_name,
        last_name
      });
      
      setUser(data.user);
      
      toast.success("Account created successfully!");
      return Promise.resolve();
    } catch (error: any) {
      handleApiError(error);
      
      // Handle different types of error responses from Django
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.response?.data) {
        const responseData = error.response.data;
        
        // Check for field-specific errors
        if (typeof responseData === 'object') {
          const fieldErrors = Object.entries(responseData)
            .filter(([key, value]) => key !== 'detail' && Array.isArray(value))
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('; ');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          } else if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.non_field_errors) {
            errorMessage = responseData.non_field_errors[0];
          }
        }
      }
      
      toast.error(errorMessage);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully");
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        isLoading,
        validatePassword,
        checkAuthStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
