import api from './api';
import authService from './auth.service';
import healthcareService from './healthcare.service';
import mainService from './main.service';
import { handleApiError, handleApiSuccess } from './errorHandling';

/**
 * Utility to test API connectivity and authentication
 * This can be used during development to verify that the backend is working correctly
 */
export const apiTest = {
  /**
   * Test the health check endpoint
   * @returns True if the API is reachable
   */
  testHealth: async (): Promise<boolean> => {
    try {
      await mainService.healthCheck();
      console.log('✅ API Health check passed');
      handleApiSuccess('API server is online', true);
      return true;
    } catch (error) {
      console.error('❌ API Health check failed:', error);
      handleApiError(error, 'API server is offline', true);
      return false;
    }
  },

  /**
   * Test authentication by verifying the current token
   * @returns True if authenticated
   */
  testAuth: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('❌ No authentication token found');
        return false;
      }

      await authService.verifyToken(token);
      console.log('✅ Authentication token is valid');
      return true;
    } catch (error) {
      console.error('❌ Authentication test failed:', error);
      return false;
    }
  },

  /**
   * Test healthcare API endpoints
   * @returns True if healthcare API is working
   */
  testHealthcareAPI: async (): Promise<boolean> => {
    try {
      // Try to fetch specializations as a simple test
      await healthcareService.getSpecializations();
      console.log('✅ Healthcare API test passed');
      return true;
    } catch (error) {
      console.error('❌ Healthcare API test failed:', error);
      return false;
    }
  },

  /**
   * Run all API tests
   * @returns Object with test results
   */
  runAllTests: async (): Promise<{
    health: boolean;
    auth: boolean;
    healthcare: boolean;
  }> => {
    const health = await apiTest.testHealth();
    const auth = await apiTest.testAuth();
    const healthcare = await apiTest.testHealthcareAPI();

    console.log('==== API Test Results ====');
    console.log(`Health Check: ${health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Authentication: ${auth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Healthcare API: ${healthcare ? '✅ PASS' : '❌ FAIL'}`);
    console.log('=========================');

    return { health, auth, healthcare };
  }
};

export default apiTest;
