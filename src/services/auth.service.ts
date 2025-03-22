import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

class AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('users')
        .select('name, phone')
        .eq('id', user.id)
        .single();
      
      return {
        id: user.id,
        email: user.email!,
        name: profile?.name || undefined,
        phone: profile?.phone || undefined
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  async login({ email, password, rememberMe = false }: LoginData): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      const user = data.user;
      
      if (!user) {
        throw new Error('No user returned from login');
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('users')
        .select('name, phone')
        .eq('id', user.id)
        .single();
      
      return {
        id: user.id,
        email: user.email!,
        name: profile?.name || undefined,
        phone: profile?.phone || undefined
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }
  
  async signup({ name, email, phone, password }: SignUpData): Promise<AuthUser> {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });
      
      if (error) throw error;
      
      const user = data.user;
      
      if (!user) {
        throw new Error('No user returned from signup');
      }
      
      // Create user profile
      await supabase.from('users').insert({
        id: user.id,
        email: email,
        name: name,
        phone: phone,
        created_at: new Date().toISOString()
      });
      
      return {
        id: user.id,
        email,
        name,
        phone
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  }
  
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to log out. Please try again.');
    }
  }
  
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send password reset link. Please try again.');
    }
  }
  
  async updatePassword(password: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password. Please try again.');
    }
  }
  
  async updateProfile(data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const { id, ...profileData } = data;
      
      if (!id) {
        throw new Error('User ID is required');
      }
      
      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Get updated profile
      const user = await this.getCurrentUser();
      
      if (!user) {
        throw new Error('Failed to get updated user profile');
      }
      
      return user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile. Please try again.');
    }
  }
}

export const authService = new AuthService(); 