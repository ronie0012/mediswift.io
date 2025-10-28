#!/usr/bin/env python3
"""
Simple synchronous test script to verify chat models
"""
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')

import django
django.setup()

from django.contrib.auth.models import User
from chat.models import ChatMessage, ChatSession

def test_database_models():
    """Test that chat models work correctly"""
    print("🧪 Testing Chat Database Models...")
    
    try:
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
        
        # Test bot message
        bot_message = ChatMessage.objects.create(
            sender=user,
            message="Bot response test",
            is_bot_response=True
        )
        print(f"✅ Bot message model working: {bot_message.id}")
        
        # Test querying messages
        user_messages = ChatMessage.objects.filter(sender=user, is_bot_response=False)
        bot_messages = ChatMessage.objects.filter(sender=user, is_bot_response=True)
        
        print(f"✅ Found {user_messages.count()} user messages")
        print(f"✅ Found {bot_messages.count()} bot messages")
        
        # Clean up test data
        message.delete()
        bot_message.delete()
        if created:
            session.delete()
        
        print("✅ Database models are working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Database model error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_consumer_imports():
    """Test that the consumer can import all required modules"""
    print("\n🧪 Testing Consumer Imports...")
    
    try:
        from chat.consumers import ChatConsumer
        print("✅ ChatConsumer imported successfully")
        
        # Test that all required attributes exist
        consumer = ChatConsumer()
        print("✅ ChatConsumer instantiated successfully")
        
        # Check if the medicine knowledge is accessible
        from chat.consumers import MEDICINE_KNOWLEDGE, SYMPTOM_KEYWORDS
        print(f"✅ Medicine knowledge loaded: {len(MEDICINE_KNOWLEDGE)} conditions")
        print(f"✅ Symptom keywords loaded: {len(SYMPTOM_KEYWORDS)} symptom types")
        
        return True
        
    except Exception as e:
        print(f"❌ Consumer import error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_jwt_token_generation():
    """Test JWT token generation for WebSocket auth"""
    print("\n🧪 Testing JWT Token Generation...")
    
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        
        # Create test user
        user, created = User.objects.get_or_create(
            username='test_jwt_user',
            defaults={'email': 'testjwt@mediswift.com'}
        )
        
        # Generate token
        token = AccessToken.for_user(user)
        print(f"✅ JWT token generated successfully")
        print(f"   Token payload: user_id={token['user_id']}")
        
        # Test token validation
        validated_token = AccessToken(str(token))
        print(f"✅ JWT token validated successfully")
        print(f"   Validated user_id: {validated_token['user_id']}")
        
        return True
        
    except Exception as e:
        print(f"❌ JWT token error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("🚀 MediSwift Chat Functionality Test (Sync)")
    print("=" * 50)
    
    # Test database models
    db_test = test_database_models()
    
    # Test consumer imports
    import_test = test_consumer_imports()
    
    # Test JWT token generation
    jwt_test = test_jwt_token_generation()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Database Models: {'✅ PASS' if db_test else '❌ FAIL'}")
    print(f"   Consumer Imports: {'✅ PASS' if import_test else '❌ FAIL'}")
    print(f"   JWT Tokens: {'✅ PASS' if jwt_test else '❌ FAIL'}")
    
    if db_test and import_test and jwt_test:
        print("\n🎉 All backend tests passed! Chat backend is ready.")
        print("\n📋 Next steps:")
        print("   1. Make sure Django server is running: python manage.py runserver 0.0.0.0:8000")
        print("   2. Start the frontend: npm run dev")
        print("   3. Test the chat widget in the browser")
        return True
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        return False

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