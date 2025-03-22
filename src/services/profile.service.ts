import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type UserProfile = Database['public']['Tables']['users']['Row'];

export class ProfileService {
  /**
   * Get a user's profile by their ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  /**
   * Create a new user profile
   */
  async createProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          ...profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  }

  /**
   * Update a user's profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // Remove id, created_at from updates
      const { id, created_at, ...validUpdates } = updates as any;
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...validUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return null;
    }
  }

  /**
   * Get multiple user profiles by their IDs
   */
  async getProfiles(userIds: string[]): Promise<UserProfile[]> {
    try {
      if (!userIds.length) return [];
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching user profiles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProfiles:', error);
      return [];
    }
  }

  /**
   * Check if a user profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking if profile exists:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in profileExists:', error);
      return false;
    }
  }
}

export const profileService = new ProfileService(); 