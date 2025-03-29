import { supabase } from './supabase';
import type { Provider } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  userData: {
    first_name: string;
    last_name: string;
    role?: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service';
  }
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role || 'patient',
      },
    },
  });

  return { data, error };
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

// Sign in with OAuth provider
export const signInWithProvider = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
  });

  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

// Update user profile
export const updateProfile = async (
  id: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Get user profile
export const getProfile = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
};

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

// Update password
export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  return { data, error };
};

// Check if user has a specific role
export const hasRole = async (
  userId: string,
  role: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service'
) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === role;
}; 