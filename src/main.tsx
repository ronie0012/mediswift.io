import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

try {
  console.log('Attempting to render app with React 18...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found! Creating one...');
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    
    const root = createRoot(newRoot);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered in newly created root element');
  } else {
    console.log('Root element found, rendering...');
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully!');
  }
} catch (error) {
  console.error('Error rendering the application:', error);
}
