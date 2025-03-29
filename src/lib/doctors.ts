import { supabase } from './supabase';
import type { Database } from '@/types/database.types';

export type Doctor = Database['public']['Tables']['doctors']['Row'];
export type DoctorUpdate = Database['public']['Tables']['doctors']['Update'];
export type DoctorInsert = Database['public']['Tables']['doctors']['Insert'];

// Get all doctors
export const getAllDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url,
        gender
      )
    `)
    .order('created_at', { ascending: false });

  return { data, error };
};

// Get doctor by ID
export const getDoctorById = async (id: string) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url,
        phone,
        gender,
        city,
        state,
        country
      )
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

// Create doctor profile
export const createDoctorProfile = async (doctor: DoctorInsert) => {
  const { data, error } = await supabase
    .from('doctors')
    .insert(doctor)
    .select()
    .single();

  return { data, error };
};

// Update doctor profile
export const updateDoctorProfile = async (id: string, updates: DoctorUpdate) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

// Delete doctor profile (admin only)
export const deleteDoctorProfile = async (id: string) => {
  const { error } = await supabase
    .from('doctors')
    .delete()
    .eq('id', id);

  return { error };
};

// Search doctors by specialty or name
export const searchDoctors = async (query: string) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url,
        gender
      )
    `)
    .or(`specialty.ilike.%${query}%,profiles.first_name.ilike.%${query}%,profiles.last_name.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return { data, error };
};

// Get doctors by specialty
export const getDoctorsBySpecialty = async (specialty: string) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url,
        gender
      )
    `)
    .eq('specialty', specialty)
    .order('average_rating', { ascending: false });

  return { data, error };
};

// Get top-rated doctors
export const getTopRatedDoctors = async (limit = 10) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url,
        gender
      )
    `)
    .order('average_rating', { ascending: false })
    .limit(limit);

  return { data, error };
};

// Get available doctors for a specific date and time
export const getAvailableDoctors = async (date: string, specialtyFilter?: string) => {
  // Convert date to day of week (0-6 for Sunday-Saturday)
  const dayOfWeek = new Date(date).getDay();
  
  let query = supabase
    .from('doctors')
    .select(`
      *,
      profiles:id (
        first_name,
        last_name,
        avatar_url,
        gender
      )
    `)
    .contains('available_days', [dayOfWeek])
    .eq('is_available', true);
    
  if (specialtyFilter) {
    query = query.eq('specialty', specialtyFilter);
  }
  
  const { data, error } = await query;

  return { data, error };
}; 