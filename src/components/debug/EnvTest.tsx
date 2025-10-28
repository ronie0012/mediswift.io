import { useState } from 'react';
import { Button } from '@/components/ui/button';

const EnvTest = () => {
  const [showEnv, setShowEnv] = useState(false);

  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_API_VERSION: import.meta.env.VITE_API_VERSION,
    VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4">Environment Variables Test</h3>
      
      <Button 
        onClick={() => setShowEnv(!showEnv)} 
        size="sm"
        variant="outline"
      >
        {showEnv ? 'Hide' : 'Show'} Environment Variables
      </Button>
      
      {showEnv && (
        <div className="mt-4 p-3 bg-white border rounded text-sm">
          <pre>{JSON.stringify(envVars, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default EnvTest;