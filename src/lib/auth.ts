import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export async function getSession() {
  const supabase = createServerComponentClient<Database>({ cookies });
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export async function isUserAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

export async function getUserId() {
  const user = await getCurrentUser();
  return user?.id;
}

export async function hasUserRole(role: string) {
  const session = await getSession();
  return session?.user?.app_metadata?.role === role;
}

export async function isAdmin() {
  return hasUserRole('admin');
}