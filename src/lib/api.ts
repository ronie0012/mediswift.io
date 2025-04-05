import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create an instance of axios with a base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to refresh token if needed
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, reject and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Use the correct endpoint for token refresh
        const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        // Check if we have a valid response with access token
        if (response.data && response.data.access) {
          localStorage.setItem('access_token', response.data.access);
          // Update the Authorization header for the retry request
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } else {
          // Invalid response format, clear auth data and redirect
          console.error('Invalid token refresh response:', response.data);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(new Error('Invalid token refresh response'));
        }
      } catch (refreshError) {
        // Refresh token failed, clear storage and redirect to login
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // For network errors or other issues
    if (!error.response) {
      console.error('Network Error:', error.message);
      toast.error('Network error. Please check your connection.');
    } else if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
