// Simple script to test API connectivity
import http from 'node:http';

console.log('Testing backend API connectivity...');

// Test the Django backend
http.get('http://127.0.0.1:8000/api/healthcare/', (res) => {
  const { statusCode } = res;
  
  console.log(`Backend status code: ${statusCode}`);
  
  if (statusCode === 200) {
    console.log('✅ Backend API is running');
  } else {
    console.log('❌ Backend API returned non-200 status code');
  }
  
  res.on('data', (chunk) => {
    console.log('Response data:', chunk.toString());
  });
}).on('error', (err) => {
  console.error('❌ Backend API connection error:', err.message);
});
