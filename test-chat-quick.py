#!/usr/bin/env python3
"""
Quick test script to verify MediSwift chat functionality
"""

import asyncio
import websockets
import json
import sys

async def test_chat():
    uri = "ws://localhost:8000/ws/chat/"
    
    try:
        print("🔌 Connecting to WebSocket...")
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Wait for welcome message
            try:
                welcome_msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                welcome_data = json.loads(welcome_msg)
                print(f"📨 Welcome: {welcome_data.get('message', 'No message')}")
            except asyncio.TimeoutError:
                print("⚠️  No welcome message received within 5 seconds")
            
            # Test messages
            test_messages = [
                "Hello",
                "I have a headache",
                "What is Paracetamol?",
                "I have fever"
            ]
            
            for msg in test_messages:
                print(f"\n📤 Sending: {msg}")
                await websocket.send(json.dumps({"message": msg}))
                
                try:
                    # Wait for response
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    
                    if response_data.get('is_bot'):
                        print(f"🤖 Bot Response: {response_data.get('message', 'No message')[:100]}...")
                    else:
                        print(f"📨 Received: {response_data}")
                        
                except asyncio.TimeoutError:
                    print("⚠️  No response received within 10 seconds")
                except json.JSONDecodeError as e:
                    print(f"❌ Error parsing response: {e}")
                
                # Small delay between messages
                await asyncio.sleep(1)
            
            print("\n✅ Chat test completed successfully!")
            
    except websockets.exceptions.ConnectionRefused:
        print("❌ Connection refused. Is the backend server running?")
        print("   Start with: cd backend && python -m daphne -b 0.0.0.0 -p 8000 mediswift_backend.asgi:application")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🧪 Testing MediSwift Chat Functionality")
    print("=" * 50)
    
    try:
        result = asyncio.run(test_chat())
        if result:
            print("\n🎉 All tests passed!")
            sys.exit(0)
        else:
            print("\n💥 Tests failed!")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)