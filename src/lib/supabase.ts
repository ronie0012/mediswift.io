
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client with hardcoded values for the preview environment
// In a production environment, these would come from environment variables
const supabaseUrl = 'https://qzfcczdsyrmqoryyawyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6ZmNjemRzeXJtcW9yeXlhd3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDU5MDUsImV4cCI6MjA1Nzc4MTkwNX0.JcWgAi7TAPlGF_4wS43DJ7ElKmtdY8rcYtxqBBrOLws';

// Validate that we have the required credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'sb-auth-token',
  }
});

// Helper function to check if running in the browser
export const isBrowser = () => typeof window !== 'undefined';

// Re-export Database type
export type { Database } from '@/types/supabase';
