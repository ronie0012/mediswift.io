import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, MessageCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/lib/chat.service';

interface Message {
  message: string;
  sender: string;
  is_bot: boolean;
  timestamp?: string;
}

// Function to format medicine-related responses
const formatMedicineResponse = (message: string) => {
  // Check if this looks like a medicine response with bullet points
  if (message.includes('Commonly used medicines include:')) {
    const sections = message.split('\n\n');
    
    return (
      <div className="text-sm space-y-4 w-full">
        {sections.map((section, index) => {
          // Handle medicine list section
          if (section.includes('Commonly used medicines include:')) {
            const lines = section.split('\n');
            const title = lines[0];
            const medicines = lines.slice(1).filter(line => line.trim());
            
            return (
              <div key={index} className="w-full">
                <p className="font-semibold text-blue-600 mb-3 text-sm">{title}</p>
                <div className="space-y-2 w-full">
                  {medicines.map((med, medIndex) => {
                    // Extract medicine info (name, use, dosage, price)
                    const cleanMed = med.replace(/^\d+\.\s*/, '').trim();
                    if (cleanMed) {
                      return (
                        <div key={medIndex} className="bg-blue-50 p-3 rounded-md border-l-3 border-blue-300 w-full">
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{cleanMed}</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          }
          
          // Handle regular paragraphs
          if (section.trim()) {
            return (
              <p key={index} className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full">
                {section.trim()}
              </p>
            );
          }
          
          return null;
        })}
      </div>
    );
  }
  
  // For other messages, format with proper line breaks and styling
  return (
    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full">
      {message}
    </div>
  );
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track reconnection attempts
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  
  // Function to handle reconnection with exponential backoff
  const attemptReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
      setConnectionStatus('connecting');
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 16000);
      
      console.log(`Reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts} in ${backoffTime}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isOpen) {
          console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          setReconnectAttempts(prev => prev + 1);
          chatService.connect();
        }
      }, backoffTime);
    } else {
      console.error('Maximum reconnection attempts reached');
      setConnectionStatus('disconnected');
      setMessages(prev => [...prev, {
        message: 'Connection failed. The chat server may be unavailable. Please try refreshing the page.',
        sender: 'System',
        is_bot: true
      }]);
    }
  };

  // Manual reconnect function
  const handleManualReconnect = () => {
    console.log('Manual reconnect triggered');
    setReconnectAttempts(0);
    setConnectionStatus('connecting');
    setMessages(prev => [...prev, {
      message: 'Attempting to reconnect...',
      sender: 'System',
      is_bot: true
    }]);
    
    // Clear any existing timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Disconnect and reconnect
    chatService.disconnect();
    setTimeout(() => {
      chatService.connect();
    }, 1000);
  };

  // Connect to WebSocket when chat opens
  useEffect(() => {
    if (isOpen && user) {
      // Clear previous messages when reopening
      setMessages([]);
      setConnectionStatus('connecting');
      setReconnectAttempts(0);
      
      // Clear any existing timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      // Connect to WebSocket
      try {
        chatService.connect();
        
        // Set up message handler
        chatService.onMessage((data) => {
          setConnectionStatus('connected');
          setReconnectAttempts(0); // Reset reconnect attempts on successful message
          
          if (data.type === 'welcome') {
            // Only add welcome message
            setMessages(prev => [...prev, {
              message: data.message,
              sender: data.sender || 'AI Assistant',
              is_bot: true
            }]);
          } else if (data.type === 'message') {
            // Only add bot messages, skip user echo
            if (data.is_bot) {
              setMessages(prev => [...prev, {
                message: data.message,
                sender: data.sender || 'AI Assistant',
                is_bot: true
              }]);
              // Stop loading when we receive bot response
              setIsLoading(false);
            }
          } else if (data.type === 'error') {
            setMessages(prev => [...prev, {
              message: data.message,
              sender: 'System',
              is_bot: true
            }]);
            setIsLoading(false);
          }
        });

        // Set up connection open handler
        chatService.onOpen(() => {
          console.log('WebSocket connection established');
          setConnectionStatus('connected');
          setReconnectAttempts(0); // Reset reconnect attempts on successful connection
          
          // Clear any pending reconnect attempts
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        });

        // Set up error handler
        chatService.onError((error) => {
          console.error('Chat error:', error);
          setConnectionStatus('disconnected');
          setIsLoading(false);
          
          // Only show error message on first attempt
          if (reconnectAttempts === 0) {
            setMessages(prev => [...prev, {
              message: 'Connection error. Attempting to reconnect...',
              sender: 'System',
              is_bot: true
            }]);
          }
          
          // Attempt to reconnect with backoff
          attemptReconnect();
        });
        
        // Set up close handler
        chatService.onClose(() => {
          console.log('WebSocket connection closed');
          setConnectionStatus('disconnected');
          
          // Attempt to reconnect with backoff if not manually closed
          if (isOpen) {
            attemptReconnect();
          }
        });
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
        setConnectionStatus('disconnected');
        setMessages([{
          message: 'Failed to connect to chat server. Please try again later.',
          sender: 'System',
          is_bot: true
        }]);
      }
    }

    return () => {
      // Clean up on unmount or when chat is closed
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      chatService.disconnect();
      setConnectionStatus('disconnected');
    };
  }, [isOpen, user]);

  const handleSend = () => {
    if (inputValue.trim() === '' || !user || isLoading) return;
    
    // Don't send if not connected
    if (connectionStatus !== 'connected') {
      setMessages(prev => [...prev, {
        message: 'Cannot send message: not connected to server. Please wait for reconnection.',
        sender: 'System',
        is_bot: true
      }]);
      return;
    }

    const messageToSend = inputValue.trim();
    
    // Add user message to chat immediately
    setMessages(prev => [...prev, {
      message: messageToSend,
      sender: user?.username || 'You',
      is_bot: false
    }]);
    
    setInputValue('');
    setIsLoading(true);

    // Send message through WebSocket
    try {
      chatService.sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        message: 'Failed to send message. Please try again.',
        sender: 'System',
        is_bot: true
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[420px] h-[600px] flex flex-col shadow-lg z-50">
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            {connectionStatus === 'connected' && (
              <span className="h-2 w-2 rounded-full bg-green-500" title="Connected"></span>
            )}
            {connectionStatus === 'connecting' && (
              <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Connecting..."></span>
            )}
            {connectionStatus === 'disconnected' && (
              <span className="h-2 w-2 rounded-full bg-red-500" title="Disconnected"></span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        {connectionStatus === 'disconnected' && (
          <div className="bg-red-50 p-2 text-xs text-red-600 flex items-center justify-between border-b">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Disconnected {reconnectAttempts >= maxReconnectAttempts ? '- Connection failed' : '- Attempting to reconnect...'} {reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts ? `(${reconnectAttempts}/${maxReconnectAttempts})` : ''}</span>
            </div>
            {reconnectAttempts >= maxReconnectAttempts && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
                onClick={handleManualReconnect}
              >
                Retry
              </Button>
            )}
          </div>
        )}
        {connectionStatus === 'connecting' && (
          <div className="bg-yellow-50 p-2 text-xs text-yellow-600 flex items-center gap-1 border-b">
            <AlertCircle className="h-3 w-3 animate-pulse" />
            <span>Connecting to chat server... {reconnectAttempts > 0 ? `(Attempt ${reconnectAttempts}/${maxReconnectAttempts})` : ''}</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
          {messages.length === 0 && !isLoading && connectionStatus === 'connected' && (
            <div className="text-center text-gray-500 text-sm p-6">
              <div className="mb-3">
                <MessageCircle className="h-8 w-8 mx-auto text-gray-300" />
              </div>
              <p className="font-medium mb-2">Welcome to MediSwift AI Assistant!</p>
              <p className="text-xs leading-relaxed">
                Ask me about medicines for headache, fever, cold, or other health concerns.
              </p>
              <div className="mt-4 space-y-1">
                <p className="text-xs text-gray-400">Try asking:</p>
                <p className="text-xs text-blue-500">"I have a headache"</p>
                <p className="text-xs text-blue-500">"What is Paracetamol?"</p>
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={`${msg.sender}-${index}-${msg.message.substring(0, 20)}`} className={`mb-4 flex ${msg.is_bot ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-4 rounded-lg max-w-[90%] word-wrap break-words ${
                msg.is_bot 
                  ? 'bg-gray-50 border border-gray-200 shadow-sm' 
                  : 'bg-blue-500 text-white shadow-md'
              }`}>
                {msg.is_bot ? (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-600">AI Assistant</span>
                    </div>
                    <div className="w-full">
                      {formatMedicineResponse(msg.message)}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium break-words whitespace-pre-wrap w-full leading-relaxed">{msg.message}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm max-w-[90%]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-600">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about medicines for headache, fever, cold..."
              className="flex-1"
              disabled={isLoading || connectionStatus !== 'connected'}
            />
            <Button 
              onClick={handleSend} 
              size="sm" 
              disabled={isLoading || inputValue.trim() === '' || connectionStatus !== 'connected'}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWidget;