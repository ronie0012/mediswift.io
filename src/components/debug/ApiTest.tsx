import { useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';

const ApiTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      // Test 1: Check if API endpoint is reachable
      const response = await api.get('/auth/me/');
      setTestResult('❌ Unexpected success - should require authentication');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setTestResult('✅ API connection successful - got expected 401 (unauthorized)');
        toast.success('API connection is working!');
      } else {
        setTestResult(`❌ API connection failed: ${error.message}`);
        console.error('API test error:', error);
        toast.error('API connection failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing login...');
    
    try {
      const response = await api.post('/auth/token/', {
        username: 'chattest',
        password: 'testpass123'
      });
      
      if (response.data.access) {
        setTestResult('✅ Login successful!');
        toast.success('Login test passed!');
        
        // Store token temporarily for profile test
        localStorage.setItem('test_token', response.data.access);
      } else {
        setTestResult('❌ Login failed - no access token received');
      }
    } catch (error: any) {
      setTestResult(`❌ Login failed: ${error.message}`);
      console.error('Login test error:', error);
      toast.error('Login test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testProfile = async () => {
    const token = localStorage.getItem('test_token');
    if (!token) {
      setTestResult('❌ No test token found - run login test first');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing profile endpoint...');
    
    try {
      // Temporarily set the token
      const originalToken = localStorage.getItem('access_token');
      localStorage.setItem('access_token', token);
      
      const response = await api.get('/auth/me/');
      
      // Restore original token
      if (originalToken) {
        localStorage.setItem('access_token', originalToken);
      } else {
        localStorage.removeItem('access_token');
      }
      
      setTestResult(`✅ Profile test successful! User: ${response.data.username}`);
      toast.success('Profile test passed!');
    } catch (error: any) {
      setTestResult(`❌ Profile test failed: ${error.message}`);
      console.error('Profile test error:', error);
      toast.error('Profile test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <div className="space-x-2 mb-4">
        <Button 
          onClick={testApiConnection} 
          disabled={isLoading}
          size="sm"
        >
          Test Connection
        </Button>
        <Button 
          onClick={testLogin} 
          disabled={isLoading}
          size="sm"
        >
          Test Login
        </Button>
        <Button 
          onClick={testProfile} 
          disabled={isLoading}
          size="sm"
        >
          Test Profile
        </Button>
      </div>
      
      {testResult && (
        <div className="p-3 bg-white border rounded text-sm">
          <pre>{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;