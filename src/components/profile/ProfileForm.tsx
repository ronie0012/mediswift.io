import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useProfile } from '@/context/ProfileContext';
import { UserProfile } from '@/services/profile.service';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function ProfileForm() {
  const { profile, updateProfile, loading } = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
  });
  
  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile, reset]);
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!isDirty) {
      toast.info('No changes to save');
      return;
    }
    
    setIsSaving(true);
    try {
      const result = await updateProfile(data as Partial<UserProfile>);
      if (result) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
      console.error('Profile update error:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-full max-w-md space-y-6 rounded-lg border p-4 shadow-sm">
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 animate-pulse rounded bg-gray-200"></div>
          <div className="h-20 animate-pulse rounded bg-gray-200"></div>
          <div className="h-10 w-1/3 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-3xl space-y-6 rounded-lg border p-6 shadow-sm">
      <h2 className="text-2xl font-bold">Your Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            {...register('name', { required: 'Name is required' })}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              }
            })}
            placeholder="Enter your email address"
            disabled // Email cannot be changed
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone', { 
              pattern: {
                value: /^[0-9+\-\s()]{7,15}$/,
                message: 'Please enter a valid phone number',
              }
            })}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...register('address')}
            placeholder="Enter your full address"
            rows={3}
          />
        </div>
        
        <Button 
          type="submit" 
          className="mt-4" 
          disabled={isSaving || !isDirty}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
} 