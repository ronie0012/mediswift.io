
import api from './api';
import { toast } from 'sonner';

const apiTest = {
  // Test the health check endpoint
  testHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/health/');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
  
  // Test authentication endpoint
  testAuth: async (): Promise<boolean> => {
    try {
      // Test if we can access an authenticated endpoint
      // This will trigger the token refresh if the token is expired
      const response = await api.get('/auth/me/');
      return response.status === 200;
    } catch (error) {
      console.error('Auth test failed:', error);
      return false;
    }
  },
  
  // Test healthcare API endpoints
  testHealthcareAPI: async (): Promise<boolean> => {
    try {
      // Try to get specializations as a simple test
      const response = await api.get('/healthcare/specializations/');
      return response.status === 200;
    } catch (error) {
      console.error('Healthcare API test failed:', error);
      return false;
    }
  },
  
  // Run all tests
  runAllTests: async (): Promise<{
    health: boolean;
    auth: boolean;
    healthcare: boolean;
  }> => {
    const health = await apiTest.testHealth();
    const auth = await apiTest.testAuth();
    const healthcare = await apiTest.testHealthcareAPI();
    
    return {
      health,
      auth,
      healthcare
    };
  }
};

export default apiTest;
