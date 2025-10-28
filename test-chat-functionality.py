#!/usr/bin/env python3
"""
Simple test script to verify chat functionality
"""
import asyncio
import websockets
import json
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')

import django
django.setup()

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken

async def test_chat_websocket():
    """Test WebSocket chat functionality"""
    print("🧪 Testing MediSwift Chat WebSocket...")
    
    # Create or get test user
    try:
        user, created = User.objects.get_or_create(
            username='test_chat_user',
            defaults={
                'email': 'test@mediswift.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            print(f"✅ Created test user: {user.username}")
        else:
            print(f"✅ Using existing test user: {user.username}")
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return False
    
    # Generate JWT token
    try:
        token = AccessToken.for_user(user)
        print(f"✅ Generated JWT token for user")
    except Exception as e:
        print(f"❌ Error generating JWT token: {e}")
        return False
    
    # Test WebSocket connection
    uri = f"ws://localhost:8000/ws/chat/?token={token}"
    print(f"🔌 Connecting to: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connection established")
            
            # Wait for welcome message
            try:
                welcome_msg = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                welcome_data = json.loads(welcome_msg)
                print(f"✅ Received welcome message: {welcome_data.get('message', '')[:50]}...")
            except asyncio.TimeoutError:
                print("⚠️  No welcome message received within 5 seconds")
            except Exception as e:
                print(f"❌ Error receiving welcome message: {e}")
            
            # Test sending a message
            test_message = "I have a headache"
            print(f"📤 Sending test message: '{test_message}'")
            
            await websocket.send(json.dumps({"message": test_message}))
            
            # Wait for echo and bot response
            messages_received = 0
            timeout_count = 0
            max_timeout = 3
            
            while messages_received < 2 and timeout_count < max_timeout:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    response_data = json.loads(response)
                    messages_received += 1
                    
                    if response_data.get('is_bot'):
                        print(f"🤖 Bot response: {response_data.get('message', '')[:100]}...")
                    else:
                        print(f"👤 User echo: {response_data.get('message', '')}")
                        
                except asyncio.TimeoutError:
                    timeout_count += 1
                    print(f"⚠️  Timeout waiting for message {messages_received + 1} (attempt {timeout_count}/{max_timeout})")
                except Exception as e:
                    print(f"❌ Error receiving message: {e}")
                    break
            
            if messages_received >= 1:
                print("✅ Chat functionality is working!")
                return True
            else:
                print("❌ Did not receive expected responses")
                return False
                
    except websockets.exceptions.ConnectionRefused:
        print("❌ Connection refused. Is the Django server running on port 8000?")
        print("   Start it with: cd backend && python manage.py runserver 0.0.0.0:8000")
        return False
    except Exception as e:
        print(f"❌ WebSocket connection error: {e}")
        return False

def test_database_models():
    """Test that chat models work correctly"""
    print("\n🧪 Testing Chat Database Models...")
    
    try:
        from chat.models import ChatMessage, ChatSession
        
        # Test creating a user
        user, created = User.objects.get_or_create(
            username='test_db_user',
            defaults={'email': 'testdb@mediswift.com'}
        )
        print(f"✅ User model working: {user.username}")
        
        # Test creating a chat session
        session, created = ChatSession.objects.get_or_create(
            user=user,
            is_active=True
        )
        print(f"✅ ChatSession model working: {session.id}")
        
        # Test creating a chat message
        message = ChatMessage.objects.create(
            sender=user,
            message="Test message",
            is_bot_response=False
        )
        print(f"✅ ChatMessage model working: {message.id}")
        
        # Clean up test data
        message.delete()
        if created:
            session.delete()
        
        print("✅ Database models are working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Database model error: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 MediSwift Chat Functionality Test")
    print("=" * 50)
    
    # Test database models first
    db_test = test_database_models()
    
    # Test WebSocket functionality
    ws_test = await test_chat_websocket()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Database Models: {'✅ PASS' if db_test else '❌ FAIL'}")
    print(f"   WebSocket Chat:  {'✅ PASS' if ws_test else '❌ FAIL'}")
    
    if db_test and ws_test:
        print("\n🎉 All tests passed! Chat functionality is working.")
        return True
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)