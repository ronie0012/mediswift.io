import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authService, AuthUser, LoginData, SignUpData } from "@/services/auth.service";
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    async function getSession() {
      setLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user || null);

          // Check if user is admin
          if (session?.user) {
            const isUserAdmin = session.user.app_metadata?.role === 'admin';
            setIsAdmin(isUserAdmin);
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    }

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Check if user is admin
        if (session?.user) {
          const isUserAdmin = session.user.app_metadata?.role === 'admin';
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
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
