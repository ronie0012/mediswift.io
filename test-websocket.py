#!/usr/bin/env python3
"""
Simple WebSocket test script to check if the chat endpoint is working
"""
import asyncio
import websockets
import json
import sys

async def test_websocket():
    uri = "ws://localhost:8000/ws/chat/"
    
    try:
        print(f"Connecting to {uri}...")
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            
            # Send a test message
            test_message = {"message": "Hello, this is a test"}
            await websocket.send(json.dumps(test_message))
            print(f"Sent: {test_message}")
            
            # Wait for response
            response = await websocket.recv()
            print(f"Received: {response}")
            
    except Exception as e:
        print(f"Connection failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Testing WebSocket connection...")
    success = asyncio.run(test_websocket())
    
    if success:
        print("✅ WebSocket test passed!")
    else:
        print("❌ WebSocket test failed!")
        sys.exit(1)