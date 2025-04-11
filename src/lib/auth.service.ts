import api from './api';
import { z } from 'zod';

// Define the user schema to match the Django backend
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional()
});

type User = z.infer<typeof userSchema>;

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

interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}

const authService = {
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/token/', credentials);
    
    // The Django REST framework JWT response structure might be different
    // Handle both possible structures
    let user, access, refresh;
    
    if (response.data.user && response.data.access) {
      // Structure: { access, refresh, user }
      ({ access, refresh, user } = response.data);
    } else if (response.data.user && response.data.tokens) {
      // Structure: { user, tokens: { access, refresh } }
      user = response.data.user;
      access = response.data.tokens.access;
      refresh = response.data.tokens.refresh;
    } else {
      // Fallback for simple token response without user data
      access = response.data.access;
      refresh = response.data.refresh;
      
      // Fetch user data separately if not included in login response
      const userResponse = await api.get('/auth/me/');
      user = userResponse.data;
    }
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    // Only store user if we have it
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return {
      user,
      tokens: {
        access,
        refresh
      }
    };
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', data);
    
    const { user, tokens } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      user,
      tokens
    };
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return userSchema.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
  
  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await api.post('/auth/token/verify/', { token });
      return true;
    } catch (error) {
      return false;
    }
  },
  
  refreshToken: async (): Promise<string | null> => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return null;
    
    try {
      const response = await api.post('/auth/token/refresh/', { refresh });
      
      // Make sure we have an access token in the response
      if (response.data && response.data.access) {
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        return access;
      } else {
        console.error('Invalid refresh token response:', response.data);
        throw new Error('Invalid refresh token response');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear all auth data on token refresh failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return null;
    }
  },
  
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  }
};

export default authService;
