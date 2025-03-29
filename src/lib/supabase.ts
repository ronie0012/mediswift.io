import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

// Supabase client for client-side usage
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Function to create a Supabase admin client (server-side only)
export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role key');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Utility function to handle Supabase errors
export const handleSupabaseError = (error: Error) => {
  console.error('Supabase error:', error);
  
  // You might want to do different things depending on the error
  if (error.message.includes('JWT')) {
    // Handle auth errors
    return {
      error: 'Authentication error. Please log in again.',
      code: 'auth/invalid-token',
    };
  }
  
  if (error.message.includes('permission denied')) {
    // Handle permission errors
    return {
      error: 'You do not have permission to perform this action.',
      code: 'permission-denied',
    };
  }
  
  // Default error
  return {
    error: 'An unexpected error occurred. Please try again later.',
    code: 'unknown-error',
  };
};

// Types for Supabase responses
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Re-export for convenient usage
export type { Database }; 