import { supabase, type SupabaseResponse } from './supabase';

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service';
  is_verified: boolean;
  is_active: boolean;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'role' | 'is_verified' | 'is_active' | 'updated_at'>>;

export type DoctorProfile = Profile & {
  specialty: string;
  license_number: string;
  years_of_experience?: number;
  education?: string[];
  certifications?: string[];
  hospital_affiliation?: string;
  bio?: string;
  consultation_fee?: number;
  available_days?: number[];
  available_hours?: { start: string; end: string };
  average_rating?: number;
  total_reviews?: number;
  is_available?: boolean;
};

export type DoctorProfileUpdate = ProfileUpdate & Partial<Omit<DoctorProfile, keyof Profile | 'average_rating' | 'total_reviews'>>;

/**
 * Get all profiles
 */
export const getAllProfiles = async (): Promise<SupabaseResponse<Profile[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as Profile[], error: null };
  } catch (error) {
    console.error('Error getting all profiles:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get a profile by ID
 */
export const getProfileById = async (id: string): Promise<SupabaseResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return { data: data as Profile, error: null };
  } catch (error) {
    console.error(`Error getting profile with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get a doctor profile by ID
 */
export const getDoctorById = async (id: string): Promise<SupabaseResponse<DoctorProfile>> => {
  try {
    // First get the profile data
    const { data: profileData, error: profileError } = await getProfileById(id);
    
    if (profileError) throw profileError;
    if (!profileData) throw new Error('Profile not found');
    
    // Then get the doctor-specific data
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (doctorError) throw doctorError;
    if (!doctorData) throw new Error('Doctor data not found');
    
    // Combine the data
    const doctorProfile: DoctorProfile = {
      ...profileData,
      ...doctorData,
    };
    
    return { data: doctorProfile, error: null };
  } catch (error) {
    console.error(`Error getting doctor profile with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update a user's profile
 */
export const updateProfile = async (id: string, updates: ProfileUpdate): Promise<SupabaseResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data: data as Profile, error: null };
  } catch (error) {
    console.error(`Error updating profile with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update a doctor's profile
 */
export const updateDoctorProfile = async (id: string, updates: DoctorProfileUpdate): Promise<SupabaseResponse<DoctorProfile>> => {
  try {
    // Separate profile updates from doctor updates
    const { 
      specialty, license_number, years_of_experience, education, 
      certifications, hospital_affiliation, bio, consultation_fee, 
      available_days, available_hours, is_available,
      ...profileUpdates 
    } = updates;
    
    // Update the profile first
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id);
      
      if (profileError) throw profileError;
    }
    
    // Then update the doctor-specific data
    const doctorUpdates: any = {};
    if (specialty !== undefined) doctorUpdates.specialty = specialty;
    if (license_number !== undefined) doctorUpdates.license_number = license_number;
    if (years_of_experience !== undefined) doctorUpdates.years_of_experience = years_of_experience;
    if (education !== undefined) doctorUpdates.education = education;
    if (certifications !== undefined) doctorUpdates.certifications = certifications;
    if (hospital_affiliation !== undefined) doctorUpdates.hospital_affiliation = hospital_affiliation;
    if (bio !== undefined) doctorUpdates.bio = bio;
    if (consultation_fee !== undefined) doctorUpdates.consultation_fee = consultation_fee;
    if (available_days !== undefined) doctorUpdates.available_days = available_days;
    if (available_hours !== undefined) doctorUpdates.available_hours = available_hours;
    if (is_available !== undefined) doctorUpdates.is_available = is_available;
    
    if (Object.keys(doctorUpdates).length > 0) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .update(doctorUpdates)
        .eq('id', id);
      
      if (doctorError) throw doctorError;
    }
    
    // Get the updated doctor profile
    return getDoctorById(id);
  } catch (error) {
    console.error(`Error updating doctor profile with ID ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Upload an avatar for a user
 */
export const uploadAvatar = async (id: string, file: File): Promise<SupabaseResponse<{ avatar_url: string }>> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file to the avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    // Update the user's profile with the avatar URL
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', id)
      .select('avatar_url')
      .single();
    
    if (updateError) throw updateError;
    
    return { data: { avatar_url: publicUrl }, error: null };
  } catch (error) {
    console.error(`Error uploading avatar for user ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get profiles by role
 */
export const getProfilesByRole = async (role: string): Promise<SupabaseResponse<Profile[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as Profile[], error: null };
  } catch (error) {
    console.error(`Error getting profiles with role ${role}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Search profiles by name
 */
export const searchProfiles = async (query: string): Promise<SupabaseResponse<Profile[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return { data: data as Profile[], error: null };
  } catch (error) {
    console.error(`Error searching profiles with query "${query}":`, error);
    return { data: null, error: error as Error };
  }
}; 