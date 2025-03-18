
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userData) {
            setUser({
              id: session.user.id,
              name: userData.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              phone: userData.phone || '',
              isLoggedIn: true
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Setup auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          // User logged in
          try {
            const { data: userData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (userData) {
              setUser({
                id: session.user.id,
                name: userData.name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                phone: userData.phone || '',
                isLoggedIn: true
              });
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          // User logged out
          setUser(null);
        }
        setIsLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const validatePassword = (password: string): boolean => {
    // Password must be at least 8 characters long
    // This is a simpler requirement compared to the previous one, which is fine for Supabase's default requirements
    return password.length >= 8;
  };
  
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
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
      
      // Create the user in Supabase Auth with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });
      
      if (authError) throw authError;
      
      // If user creation was successful, update their profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name,
            phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);
          
        if (profileError) console.error("Error updating profile:", profileError);
      }
      
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
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
