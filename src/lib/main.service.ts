import api from './api';
import { handleApiError } from './errorHandling';

interface UserProfile {
  id?: number;
  user: number;
  phone_number?: string;
  address?: string;
}

export const mainService = {
  // User profiles
  getUserProfile: async () => {
    try {
      const response = await api.get('/profiles/me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleApiError(error, 'Failed to fetch user profile');
      throw error;
    }
  },

  updateUserProfile: async (data: Partial<UserProfile>) => {
    try {
      const response = await api.patch('/profiles/me/', data);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      handleApiError(error, 'Failed to update user profile');
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health-check/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      // Don't show toast for health check failures
      handleApiError(error, 'API server is not responding', false);
      throw error;
    }
  }
};

export default mainService;
