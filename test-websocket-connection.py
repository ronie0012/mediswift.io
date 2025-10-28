#!/usr/bin/env python3
import asyncio
import websockets
import json
import requests

async def test_websocket_connection():
    print("🧪 Testing WebSocket Connection...")
    
    # First, get an authentication token
    print("\n1. Getting authentication token...")
    try:
        login_response = requests.post('http://localhost:8000/api/auth/token/', json={
            'username': 'chattest',
            'password': 'testpass123'
        })
        
        if login_response.status_code == 200:
            token = login_response.json()['access']
            print("✅ Authentication successful")
            
            # Test WebSocket connection
            print("\n2. Testing WebSocket connection...")
            ws_url = f"ws://localhost:8000/ws/chat/?token={token}"
            print(f"Connecting to: {ws_url}")
            
            try:
                async with websockets.connect(ws_url) as websocket:
                    print("✅ WebSocket connection established")
                    
                    # Wait for welcome message
                    print("\n3. Waiting for welcome message...")
                    welcome_message = await websocket.recv()
                    welcome_data = json.loads(welcome_message)
                    print(f"✅ Received welcome: {welcome_data}")
                    
                    # Send a test message
                    print("\n4. Sending test message...")
                    test_message = {"message": "I have a headache"}
                    await websocket.send(json.dumps(test_message))
                    print("✅ Message sent")
                    
                    # Wait for response
                    print("\n5. Waiting for bot response...")
                    response_message = await websocket.recv()
                    response_data = json.loads(response_message)
                    print(f"✅ Received response: {response_data['message'][:100]}...")
                    
                    print("\n🎉 WebSocket test completed successfully!")
                    return True
                    
            except websockets.exceptions.ConnectionClosed as e:
                print(f"❌ WebSocket connection closed: {e}")
                return False
            except Exception as e:
                print(f"❌ WebSocket error: {e}")
                return False
                
        else:
            print(f"❌ Authentication failed: {login_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error during authentication: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_websocket_connection())
    if result:
        print("\n✅ All tests passed! WebSocket chat is working correctly.")
    else:
        print("\n❌ Tests failed. Check the server configuration.")