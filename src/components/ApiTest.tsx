import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import apiTest from '../lib/apiTest';
import { toast } from 'sonner';

const ApiTestComponent = () => {
  const [results, setResults] = useState<{
    health: boolean | null;
    auth: boolean | null;
    healthcare: boolean | null;
  }>({
    health: null,
    auth: null,
    healthcare: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const testResults = await apiTest.runAllTests();
      setResults(testResults);
      
      if (testResults.health && testResults.auth && testResults.healthcare) {
        toast.success('All API tests passed!');
      } else {
        toast.error('Some API tests failed. Check the results for details.');
      }
    } catch (error) {
      console.error('Error running API tests:', error);
      toast.error('Error running API tests');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>
          Test the connection to the backend API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm font-medium">Health Check:</div>
            <div>
              {results.health === null ? (
                <span className="text-gray-500">Not tested</span>
              ) : results.health ? (
                <span className="text-green-500">✅ Passed</span>
              ) : (
                <span className="text-red-500">❌ Failed</span>
              )}
            </div>
            
            <div className="text-sm font-medium">Authentication:</div>
            <div>
              {results.auth === null ? (
                <span className="text-gray-500">Not tested</span>
              ) : results.auth ? (
                <span className="text-green-500">✅ Passed</span>
              ) : (
                <span className="text-red-500">❌ Failed</span>
              )}
            </div>
            
            <div className="text-sm font-medium">Healthcare API:</div>
            <div>
              {results.healthcare === null ? (
                <span className="text-gray-500">Not tested</span>
              ) : results.healthcare ? (
                <span className="text-green-500">✅ Passed</span>
              ) : (
                <span className="text-red-500">❌ Failed</span>
              )}
            </div>
          </div>
          
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Tests...' : 'Run API Tests'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTestComponent;
