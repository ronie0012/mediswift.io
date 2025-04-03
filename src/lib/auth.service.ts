import api from './api';
import { handleApiError, handleApiSuccess } from './errorHandling';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

interface ResetPasswordRequestData {
  email: string;
}

interface ResetPasswordConfirmData {
  token: string;
  uidb64: string;
  password: string;
  password2: string;
}

export const authService = {
  // Login with username and password, returns tokens and user data
  login: async (data: LoginData) => {
    try {
      const response = await api.post('/auth/token/', data);
      
      // Store tokens in localStorage
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        handleApiSuccess('Login successful');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      handleApiError(error, 'Login failed. Please check your credentials.');
      throw error;
    }
  },

  // Register a new user
  register: async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register/', data);
      
      // Store tokens in localStorage if received
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        handleApiSuccess('Registration successful! Please check your email to verify your account.');
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      handleApiError(error, 'Registration failed. Please check your information.');
      throw error;
    }
  },

  // Logout - remove tokens from storage
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    handleApiSuccess('Logged out successfully');
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      handleApiError(error, 'Failed to get current user.');
      throw error;
    }
  },

  // Change password for logged in user
  changePassword: async (data: ChangePasswordData) => {
    try {
      const response = await api.post('/auth/password/change/', data);
      handleApiSuccess('Password changed successfully.');
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      handleApiError(error, 'Failed to change password.');
      throw error;
    }
  },

  // Request password reset email
  requestPasswordReset: async (data: ResetPasswordRequestData) => {
    try {
      const response = await api.post('/auth/password/reset/', data);
      handleApiSuccess('Password reset email sent. Please check your inbox.');
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      handleApiError(error, 'Failed to send password reset email.');
      throw error;
    }
  },

  // Confirm password reset with token
  confirmPasswordReset: async (data: ResetPasswordConfirmData) => {
    try {
      const response = await api.post('/auth/password/reset/confirm/', data);
      handleApiSuccess('Password has been reset successfully.');
      return response.data;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      handleApiError(error, 'Failed to reset password.');
      throw error;
    }
  },

  // Verify if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get the stored user data
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },
  
  // Verify token validity
  verifyToken: async (token: string) => {
    try {
      const response = await api.post('/auth/token/verify/', { token });
      handleApiSuccess('Token is valid.');
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      handleApiError(error, 'Token is invalid.');
      throw error;
    }
  }
};

export default authService;