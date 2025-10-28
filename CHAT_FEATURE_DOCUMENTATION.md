# MediSwift Chat Feature Documentation

## Overview
This document describes the implementation of the real-time chat bot feature for the MediSwift healthcare platform. The feature allows users to communicate with an AI-powered assistant through WebSockets for instant messaging capabilities.

## Architecture

### Backend (Django)
- **Technology**: Django Channels for WebSocket support
- **Components**:
  - `chat` app with models for ChatMessage and ChatSession
  - WebSocket consumers for handling real-time communication
  - REST API endpoints for chat history retrieval
  - Authentication integration with JWT tokens

### Frontend (React/Vite)
- **Technology**: React with TypeScript and Vite
- **Components**:
  - ChatWidget component with UI for messaging
  - Chat service for WebSocket communication
  - Integration with existing authentication system

## Key Features

1. **Real-time Messaging**: Instant communication between users and the AI assistant
2. **Authentication**: Secure access only for authenticated users
3. **Message History**: Persistence and retrieval of chat history
4. **AI Responses**: Context-aware responses from the virtual assistant
5. **Responsive UI**: Mobile-friendly chat interface
6. **Error Handling**: Graceful handling of connection and communication errors

## Implementation Details

### Backend Implementation

#### Models
- `ChatMessage`: Stores individual chat messages with sender, content, and timestamp
- `ChatSession`: Tracks user chat sessions

#### Consumers
- `ChatConsumer`: Handles WebSocket connections, message processing, and AI response generation
- Implements authentication checks
- Manages message broadcasting to connected clients

#### Views
- `chat_history`: Returns chat history for authenticated users
- `clear_chat_history`: Clears chat history for a user

#### Routing
- WebSocket routing at `/ws/chat/`
- HTTP API routing at `/api/chat/`

### Frontend Implementation

#### Components
- `ChatWidget`: Floating chat interface with message display and input
- Features:
  - Toggle visibility
  - Message bubbles with sender identification
  - Typing indicators
  - Auto-scroll to latest messages

#### Services
- `chat.service.ts`: Handles WebSocket connection and communication
- `auth.service.ts`: Provides authentication token for secure connections

## Security Considerations

1. **Authentication Required**: Only authenticated users can access the chat
2. **Secure Connections**: WebSocket connections use secure protocols
3. **Token Validation**: JWT tokens are validated for each connection
4. **Input Validation**: Messages are sanitized to prevent injection attacks

## Deployment Considerations

1. **ASGI Server**: Requires an ASGI-compatible server (Daphne, Uvicorn) for WebSocket support
2. **Channel Layers**: For production, use Redis or other scalable channel layer backends
3. **Load Balancing**: Consider WebSocket connection affinity when load balancing

## Future Enhancements

1. **AI Integration**: Connect to real AI services like OpenAI or Hugging Face
2. **Rich Media**: Support for images, files, and other media types
3. **Chat Moderation**: Implement content filtering and moderation
4. **Multi-user Support**: Enable conversations between multiple users
5. **Chat Analytics**: Track and analyze chat usage patterns
6. **Customization**: Allow users to customize chat experience

## Testing

The implementation includes:
- Unit tests for chat models
- Integration tests for WebSocket connections
- UI tests for chat component functionality

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws/chat/` - Main chat WebSocket endpoint

### HTTP
- `GET /api/chat/history/` - Retrieve chat history
- `POST /api/chat/clear/` - Clear chat history

## Environment Variables

- `VITE_WS_BASE_URL` - Base URL for WebSocket connections (default: ws://localhost:8000)

## Dependencies

### Backend
- Django Channels
- channels-redis (for production)
- daphne or uvicorn (ASGI server)

### Frontend
- ws (for testing)

## Usage

1. Start the Django backend with an ASGI server
2. Start the Vite frontend development server
3. Log in to the application
4. Click the chat icon in the bottom right corner to open the chat interface
5. Type messages and receive AI-powered responses in real-time