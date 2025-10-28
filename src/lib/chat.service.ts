// Chat service for handling WebSocket connections
import { getAuthToken } from "./auth.service";

// Get WebSocket URL based on environment
const getWebSocketUrl = () => {
  // In production, use the environment variable or fallback
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_WS_BASE_URL || 'wss://mediswift-backend.vercel.app';
  }
  // In development, use localhost
  return import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';
};

const WS_BASE_URL = getWebSocketUrl();

export class ChatService {
  private ws: WebSocket | null = null;
  private messageCallback: ((message: any) => void) | null = null;
  private errorCallback: ((error: any) => void) | null = null;
  private closeCallback: (() => void) | null = null;
  private openCallback: (() => void) | null = null;

  connect() {
    try {
      // Get authentication token
      const token = getAuthToken();
      
      // Create WebSocket connection with or without token
      let wsUrl = `${WS_BASE_URL}/ws/chat/`;
      if (token) {
        wsUrl += `?token=${token}`;
      }
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      // Set up event handlers
      this.ws.onopen = () => {
        console.log('✅ Connected to chat WebSocket successfully');
        if (this.openCallback) {
          this.openCallback();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          console.log('📨 Received WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          if (this.messageCallback) {
            this.messageCallback(data);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        if (this.errorCallback) {
          this.errorCallback(error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        if (this.closeCallback) {
          this.closeCallback();
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      if (this.errorCallback) {
        this.errorCallback(error);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const data = JSON.stringify({ message });
      console.log('📤 Sending message:', data);
      this.ws.send(data);
    } else {
      const status = this.ws ? this.ws.readyState : 'null';
      console.error('❌ WebSocket not ready. State:', status);
      throw new Error(`WebSocket is not connected. State: ${status}`);
    }
  }

  onMessage(callback: (message: any) => void) {
    this.messageCallback = callback;
  }

  onError(callback: (error: any) => void) {
    this.errorCallback = callback;
  }

  onClose(callback: () => void) {
    this.closeCallback = callback;
  }

  onOpen(callback: () => void) {
    this.openCallback = callback;
  }
}

// Export a singleton instance
export const chatService = new ChatService();

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).chatService = chatService;
}