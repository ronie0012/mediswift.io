#!/usr/bin/env python3
"""
Direct WebSocket test to debug connection issues
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/chat/"
    print(f"Testing WebSocket connection to: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Wait for welcome message
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"✅ Received message: {message}")
                
                # Send a test message
                test_msg = {"message": "Hello"}
                await websocket.send(json.dumps(test_msg))
                print("✅ Sent test message")
                
                # Wait for response
                response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                print(f"✅ Received response: {response}")
                
            except asyncio.TimeoutError:
                print("⚠️ Timeout waiting for messages")
                
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"❌ Invalid status code: {e}")
        print(f"   Status: {e.status_code}")
        print(f"   Headers: {e.response_headers}")
    except websockets.exceptions.ConnectionRefused:
        print("❌ Connection refused - server not running?")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        print(f"   Type: {type(e)}")

if __name__ == "__main__":
    asyncio.run(test_websocket())