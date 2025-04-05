import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ApiTest = () => {
  const [apiResponse, setApiResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Collect environment variables
    setEnvVars({
      'VITE_API_URL': import.meta.env.VITE_API_URL || 'Not set',
      'VITE_APP_URL': import.meta.env.VITE_APP_URL || 'Not set',
      'VITE_APP_ENV': import.meta.env.VITE_APP_ENV || 'Not set',
      'BASE_URL': import.meta.env.BASE_URL || 'Not set'
    });
  }, []);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to make a simple API call
      const response = await api.get('/auth/test/', { timeout: 5000 });
      setApiResponse(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      console.error('API Test Error:', err);
      setError(
        err.response 
          ? `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : `Network Error: ${err.message}`
      );
      
      // Try a direct fetch to the backend
      try {
        const directResponse = await fetch(`${import.meta.env.VITE_API_URL.replace('/api', '')}/api/auth/test/`);
        const data = await directResponse.json();
        setApiResponse(`Direct fetch worked: ${JSON.stringify(data, null, 2)}`);
      } catch (directErr: any) {
        setError((prev) => `${prev}\n\nDirect fetch also failed: ${directErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-8">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>Test the connection to the backend API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-medium">Environment Variables:</h3>
          <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
        
        {error && (
          <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded text-red-900 text-sm">
            <h3 className="font-bold mb-1">Error:</h3>
            <pre className="whitespace-pre-wrap text-xs">{error}</pre>
          </div>
        )}
        
        {apiResponse && (
          <div className="p-3 mb-4 bg-green-100 border border-green-300 rounded text-green-900">
            <h3 className="font-bold mb-1">Response:</h3>
            <pre className="whitespace-pre-wrap text-xs">{apiResponse}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={testApi} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiTest;
