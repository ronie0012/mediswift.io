#!/usr/bin/env python3
"""
Final comprehensive test for MediSwift chat functionality
"""
import sys
import os
import requests
import json
import time

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')

import django
django.setup()

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken

def test_backend_api():
    """Test backend API endpoints"""
    print("1. Testing Backend API...")
    
    try:
        # Test health endpoint
        response = requests.get('http://localhost:8000/api/health/', timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend API is responding")
        else:
            print(f"   ❌ Backend API error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to backend. Is Django server running on port 8000?")
        return False
    except Exception as e:
        print(f"   ❌ Backend API test failed: {e}")
        return False
    
    return True

def test_authentication():
    """Test authentication system"""
    print("2. Testing Authentication...")
    
    try:
        # Test login endpoint
        login_data = {
            'username': 'chattest',
            'password': 'testpass123'
        }
        
        response = requests.post('http://localhost:8000/api/auth/token/', json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'access' in data:
                print("   ✅ Authentication working - JWT token received")
                return data['access']
            else:
                print("   ❌ No access token in response")
                return None
        else:
            print(f"   ❌ Authentication failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"   ❌ Authentication test failed: {e}")
        return None

def test_database_models():
    """Test chat database models"""
    print("3. Testing Database Models...")
    
    try:
        from chat.models import ChatMessage, ChatSession
        
        # Get test user
        user = User.objects.get(username='chattest')
        
        # Test session creation
        session, created = ChatSession.objects.get_or_create(
            user=user,
            is_active=True
        )
        print("   ✅ ChatSession model working")
        
        # Test message creation
        message = ChatMessage.objects.create(
            sender=user,
            message="Test message for final test",
            is_bot_response=False
        )
        print("   ✅ ChatMessage model working")
        
        # Clean up
        message.delete()
        
        return True
        
    except Exception as e:
        print(f"   ❌ Database model test failed: {e}")
        return False

def test_frontend_connection():
    """Test frontend server"""
    print("4. Testing Frontend Server...")
    
    try:
        response = requests.get('http://localhost:8080/', timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend server is responding")
            return True
        else:
            print(f"   ❌ Frontend server error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Cannot connect to frontend. Is npm run dev running on port 8080?")
        return False
    except Exception as e:
        print(f"   ❌ Frontend test failed: {e}")
        return False

def test_websocket_basic():
    """Test basic WebSocket connection"""
    print("5. Testing WebSocket Connection...")
    
    try:
        import websockets
        import asyncio
        
        async def test_ws():
            try:
                uri = "ws://localhost:8000/ws/chat/"
                async with websockets.connect(uri) as websocket:
                    print("   ✅ WebSocket connection established")
                    
                    # Wait for welcome message
                    welcome = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(welcome)
                    if data.get('type') == 'welcome':
                        print("   ✅ Welcome message received")
                        return True
                    else:
                        print(f"   ❌ Unexpected message: {data}")
                        return False
                        
            except Exception as e:
                print(f"   ❌ WebSocket test failed: {e}")
                return False
        
        result = asyncio.run(test_ws())
        return result
        
    except ImportError:
        print("   ❌ websockets library not installed")
        return False
    except Exception as e:
        print(f"   ❌ WebSocket test error: {e}")
        return False

def generate_final_report(results):
    """Generate final test report"""
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name:<25} {status}")
        if not passed:
            all_passed = False
    
    print("="*60)
    
    if all_passed:
        print("🎉 ALL TESTS PASSED! Chat functionality is fully working.")
        print("\n📋 How to use the chat:")
        print("   1. Open http://localhost:8080 in your browser")
        print("   2. Login with: chattest / testpass123")
        print("   3. Click the chat icon (💬) in bottom right")
        print("   4. Try messages like:")
        print("      - 'I have a headache'")
        print("      - 'What is Paracetamol?'")
        print("      - 'I have fever'")
        print("\n🤖 Expected bot responses:")
        print("   - Medicine recommendations with dosages and prices")
        print("   - Health advice and precautions")
        print("   - Information about specific medications")
        
    else:
        print("⚠️  SOME TESTS FAILED - Chat may not work properly")
        print("\n🔧 Troubleshooting:")
        
        if not results.get('Backend API', True):
            print("   - Start Django server: cd backend && python manage.py runserver 0.0.0.0:8000")
        
        if not results.get('Frontend Server', True):
            print("   - Start frontend: npm run dev")
        
        if not results.get('Authentication', True):
            print("   - Check if test user exists: chattest / testpass123")
        
        if not results.get('WebSocket', True):
            print("   - Check Django channels configuration")
            print("   - Verify WebSocket URL in .env file")
    
    return all_passed

def main():
    """Main test function"""
    print("🚀 MediSwift Chat - Final Comprehensive Test")
    print("="*60)
    
    results = {}
    
    # Run all tests
    results['Backend API'] = test_backend_api()
    time.sleep(1)
    
    auth_token = test_authentication()
    results['Authentication'] = auth_token is not None
    time.sleep(1)
    
    results['Database Models'] = test_database_models()
    time.sleep(1)
    
    results['Frontend Server'] = test_frontend_connection()
    time.sleep(1)
    
    results['WebSocket'] = test_websocket_basic()
    
    # Generate final report
    success = generate_final_report(results)
    
    return success

if __name__ == "__main__":
    try:
        result = main()
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)