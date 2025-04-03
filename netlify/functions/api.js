// Netlify serverless function to handle API requests
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Function to check if Python path exists
function getPythonPath() {
  // Try to find Python executable in different places
  const possiblePaths = [
    '/usr/bin/python3',
    '/usr/local/bin/python3',
    '/opt/python/bin/python3',
    'python3',
    'python'
  ];
  
  for (const pythonPath of possiblePaths) {
    try {
      if (pythonPath.startsWith('/')) {
        // For absolute paths, check if file exists
        if (fs.existsSync(pythonPath)) {
          return pythonPath;
        }
      } else {
        // For commands, assume they might be available
        return pythonPath;
      }
    } catch (error) {
      console.error(`Error checking Python path ${pythonPath}:`, error);
    }
  }
  
  // Default fallback
  return 'python';
}

// Main handler function
exports.handler = async function(event, context) {
  // Setup Python environment
  const pythonPath = getPythonPath();
  const scriptPath = path.join(__dirname, 'wsgi-app.py');
  
  try {
    // Prepare environment variables
    const env = { ...process.env };
    
    // Add Django-specific variables 
    env.NETLIFY = 'true';
    env.LAMBDA_FUNCTION = 'true';
    env.HTTP_METHOD = event.httpMethod;
    env.HTTP_PATH = event.path;
    env.QUERY_STRING = event.queryStringParameters 
      ? Object.entries(event.queryStringParameters)
          .map(([key, value]) => `${key}=${value}`)
          .join('&') 
      : '';
    
    // Call Python script
    return new Promise((resolve, reject) => {
      // Create spawn options
      const options = {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      };
      
      // Spawn Python process
      const python = spawn(pythonPath, [scriptPath], options);
      
      let dataString = '';
      let errorString = '';
      
      // Collect stdout data
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      // Collect stderr data
      python.stderr.on('data', (data) => {
        errorString += data.toString();
      });
      
      // Handle process completion
      python.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error: ${errorString}`);
          
          resolve({
            statusCode: 500,
            body: JSON.stringify({ 
              error: 'Internal Server Error', 
              details: errorString 
            })
          });
          return;
        }
        
        try {
          // Parse the response from the Python script
          const responseObj = JSON.parse(dataString);
          
          resolve({
            statusCode: responseObj.statusCode || 200,
            headers: {
              'Content-Type': 'application/json',
              ...responseObj.headers
            },
            body: responseObj.body
          });
        } catch (error) {
          console.error('Error parsing Python response:', error);
          resolve({
            statusCode: 500,
            body: JSON.stringify({ 
              error: 'Error parsing response', 
              details: error.message 
            })
          });
        }
      });
      
      // Handle process errors
      python.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject({
          statusCode: 500,
          body: JSON.stringify({ 
            error: 'Failed to start Python process', 
            details: error.message 
          })
        });
      });
      
      // If there is a request body, write it to stdin
      if (event.body) {
        python.stdin.write(event.body);
      }
      
      // Always end stdin to avoid hanging
      python.stdin.end();
    });
    
  } catch (error) {
    console.error('Error in serverless function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message 
      })
    };
  }
}; 