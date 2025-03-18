import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  isLoggedIn: z.boolean()
});

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  validatePassword: (password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const validatedUser = userSchema.parse(parsedUser);
        setUser({
          id: validatedUser.id,
          name: validatedUser.name,
          email: validatedUser.email,
          phone: validatedUser.phone,
          isLoggedIn: validatedUser.isLoggedIn
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);
  
  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long and contain at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };
  
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored user data if exists
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const user = storedUsers.find((u: any) => u.email === email);
      
      if (!user) {
        throw new Error("User not found");
      }
      
      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isLoggedIn: true
      };
      
      setUser(userData);
      
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
      
      toast.success("Logged in successfully!");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your credentials.");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      if (!validatePassword(password)) {
        throw new Error("Password must be at least 8 characters long and contain at least one number and one special character");
      }
      
      // Get existing users
      const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if email already exists
      if (storedUsers.some((user: any) => user.email === email)) {
        throw new Error("Email already registered");
      }
      
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        password // In a real app, this should be hashed
      };
      
      // Save user to storage
      localStorage.setItem("users", JSON.stringify([...storedUsers, newUser]));
      
      const userData: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isLoggedIn: true
      };
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("Account created successfully!");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account. Please try again.");
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
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
