// Simple debug function to check if serverless functions are working
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: "Debug function is working correctly",
      path: event.path,
      method: event.httpMethod,
      headers: event.headers,
      queryParams: event.queryStringParameters,
      functionDirectory: process.env.LAMBDA_TASK_ROOT || 'unknown',
      netlifyDeployContext: process.env.CONTEXT || 'unknown',
      nodeVersion: process.version,
      pythonPath: process.env.PYTHONPATH || 'unknown'
    })
  };
}; 