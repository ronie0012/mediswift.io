
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Session, User } from '@supabase/supabase-js';
import { supabase, isBrowser } from '@/lib/supabase';

// Update the user schema to match our profile structure
const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: object) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;

    async function initializeAuth() {
      setLoading(true);
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log(`Auth state changed: ${event}`, newSession);
            setSession(newSession);
            setUser(newSession?.user || null);
            
            // Check if user is admin
            if (newSession?.user) {
              const isUserAdmin = newSession.user.app_metadata?.role === 'admin';
              setIsAdmin(isUserAdmin);
              console.log(`User is admin: ${isUserAdmin}`);
            } else {
              setIsAdmin(false);
            }
            
            setLoading(false);
          }
        );

        // THEN check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user || null);

          // Check if user is admin
          if (initialSession?.user) {
            const isUserAdmin = initialSession.user.app_metadata?.role === 'admin';
            setIsAdmin(isUserAdmin);
          }
        }

        setLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  async function signUp(email: string, password: string, userData?: object) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success("Account created successfully! Please check your email to verify your account");
        return { success: true };
      }

      return { success: false, error: 'Unknown error during sign up' };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      return { success: false, error: error.message };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success("Welcome back! You have successfully signed in");
        if (data.user.app_metadata?.role === 'admin') {
          localStorage.setItem('user-role', 'admin');
        } else {
          localStorage.setItem('user-role', 'user');
        }
        return { success: true };
      }

      return { success: false, error: 'Unknown error during sign in' };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      return { success: false, error: error.message };
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user-role');
      toast.success("You have been signed out successfully");
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/new-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success("Password reset email sent. Check your email for the password reset link");
      return { success: true };
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      return { success: false, error: error.message };
    }
  }

  async function updatePassword(token: string, newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success("Your password has been updated successfully");
      return { success: true };
    } catch (error: any) {
      console.error('Error in updatePassword:', error);
      return { success: false, error: error.message };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
