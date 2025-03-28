import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";

// Update the user schema to match our profile structure
const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  isLoggedIn: z.boolean()
});

interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  validatePassword: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory storage for users
const users: { [email: string]: { user: User; password: string } } = {};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };
  
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const userAccount = users[email];
      
      if (!userAccount || userAccount.password !== password) {
        throw new Error("Invalid email or password");
      }
      
      setUser(userAccount.user);
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userAccount.user));
      }
      
      toast.success("Logged in successfully!");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please check your credentials.");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      if (!validatePassword(password)) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      if (users[email]) {
        throw new Error("Email already registered");
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        isLoggedIn: true
      };
      
      users[email] = {
        user: newUser,
        password
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success("Account created successfully!");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
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
        validatePassword
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
