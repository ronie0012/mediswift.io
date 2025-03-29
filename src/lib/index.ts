// Export the Supabase client
export * from './supabase';

// Auth services
export {
  signUp,
  signIn,
  signInWithProvider,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  hasRole
} from './auth';

// Profile services - explicitly re-exporting to avoid conflicts
export {
  getAllProfiles,
  getProfileById,
  uploadAvatar,
  getProfilesByRole,
  searchProfiles
} from './profiles';
// Re-export Profile type from profiles to avoid conflict with auth
export type { Profile, ProfileUpdate } from './profiles';
// Re-export the updateProfile function from profiles since it's more comprehensive
export { updateProfile } from './profiles';

// Doctor services
export * from './doctors';

// Appointment services
export * from './appointments';

// Prescription services
export * from './prescriptions';

// Pharmacy services
export * from './pharmacy';

// Ambulance services
export * from './ambulance';

// Notification services
export * from './notifications';

// Payment services
export * from './payments';

// Review services
export * from './reviews';

// Medical record services
export * from './medical-records'; 