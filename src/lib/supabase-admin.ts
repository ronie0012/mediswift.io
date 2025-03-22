import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// These environment variables are only available on the server
// This client should only be used in server contexts (API routes, server components, etc.)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Supabase admin client with service role key.
 * This has admin privileges and should only be used in secure server environments,
 * never in the browser.
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a new user with email and password
 */
export async function createUser(email: string, password: string, metadata?: { [key: string]: any }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Delete a user by their ID
 */
export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Get a user by their ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: string) {
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Reset database to a clean state (for testing purposes)
 * This will delete all data in the specified tables
 */
export async function resetDatabase(tables: string[]) {
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).delete().not('id', 'is', null);
    if (error) throw error;
  }
  return true;
}

/**
 * Run a batch of queries in a transaction
 */
export async function runTransaction<T>(callback: () => Promise<T>): Promise<T> {
  try {
    // Start transaction
    await supabaseAdmin.rpc('begin');
    
    // Run the callback which contains the queries
    const result = await callback();
    
    // Commit transaction
    await supabaseAdmin.rpc('commit');
    
    return result;
  } catch (error) {
    // Rollback transaction on error
    await supabaseAdmin.rpc('rollback');
    throw error;
  }
} 