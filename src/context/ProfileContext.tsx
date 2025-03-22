import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { profileService, UserProfile } from '@/services/profile.service';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      refreshProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const refreshProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userProfile = await profileService.getProfile(user.id);
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // If no profile exists, create a basic one with email
        const newProfile = await profileService.createProfile(user.id, {
          email: user.email || '',
          name: user.user_metadata?.name || null,
        });
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile',
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    try {
      const updatedProfile = await profileService.updateProfile(user.id, data);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        return updatedProfile;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your profile',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};