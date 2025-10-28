#!/usr/bin/env python3
"""
Comprehensive script to fix all chat-related issues
"""
import os
import sys
import subprocess
import json

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_and_fix_backend():
    """Check and fix backend issues"""
    print("🔧 Checking Backend Configuration...")
    
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    # Check if Django is installed
    success, stdout, stderr = run_command("python -c \"import django; print(django.get_version())\"", backend_dir)
    if success:
        print(f"✅ Django installed: {stdout.strip()}")
    else:
        print(f"❌ Django not found: {stderr}")
        return False
    
    # Check if channels is installed
    success, stdout, stderr = run_command("python -c \"import channels; print('Channels installed')\"", backend_dir)
    if success:
        print("✅ Django Channels installed")
    else:
        print("❌ Django Channels not installed")
        print("   Installing channels...")
        success, stdout, stderr = run_command("pip install channels", backend_dir)
        if not success:
            print(f"❌ Failed to install channels: {stderr}")
            return False
    
    # Check if websockets is installed
    success, stdout, stderr = run_command("python -c \"import websockets; print('WebSockets installed')\"", backend_dir)
    if success:
        print("✅ WebSockets library installed")
    else:
        print("❌ WebSockets library not installed")
        print("   Installing websockets...")
        success, stdout, stderr = run_command("pip install websockets", backend_dir)
        if not success:
            print(f"❌ Failed to install websockets: {stderr}")
            return False
    
    # Check database migrations
    success, stdout, stderr = run_command("python manage.py showmigrations chat", backend_dir)
    if success:
        print("✅ Chat migrations status:")
        for line in stdout.strip().split('\n'):
            if line.strip():
                print(f"   {line}")
    else:
        print(f"❌ Error checking migrations: {stderr}")
    
    # Run migrations
    print("🔄 Running migrations...")
    success, stdout, stderr = run_command("python manage.py migrate", backend_dir)
    if success:
        print("✅ Migrations completed")
    else:
        print(f"❌ Migration failed: {stderr}")
        return False
    
    return True

def check_and_fix_frontend():
    """Check and fix frontend issues"""
    print("\n🔧 Checking Frontend Configuration...")
    
    # Check if node_modules exists
    if os.path.exists('node_modules'):
        print("✅ Node modules installed")
    else:
        print("❌ Node modules not found")
        print("   Installing dependencies...")
        success, stdout, stderr = run_command("npm install")
        if not success:
            print(f"❌ Failed to install dependencies: {stderr}")
            return False
    
    # Check environment variables
    if os.path.exists('.env'):
        print("✅ Environment file exists")
        with open('.env', 'r') as f:
            env_content = f.read()
            if 'VITE_WS_BASE_URL' in env_content:
                print("✅ WebSocket URL configured")
            else:
                print("❌ WebSocket URL not configured")
                return False
    else:
        print("❌ Environment file not found")
        return False
    
    return True

def create_test_user():
    """Create a test user for chat testing"""
    print("\n🔧 Creating Test User...")
    
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    # Create test user script
    test_user_script = '''
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')
django.setup()

from django.contrib.auth.models import User

try:
    user, created = User.objects.get_or_create(
        username='chattest',
        defaults={
            'email': 'chattest@mediswift.com',
            'first_name': 'Chat',
            'last_name': 'Test'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✅ Created test user: {user.username}")
    else:
        print(f"✅ Test user already exists: {user.username}")
    
    print(f"   Username: {user.username}")
    print(f"   Password: testpass123")
    print(f"   Email: {user.email}")
    
except Exception as e:
    print(f"❌ Error creating test user: {e}")
'''
    
    with open(os.path.join(backend_dir, 'create_test_user.py'), 'w') as f:
        f.write(test_user_script)
    
    success, stdout, stderr = run_command("python create_test_user.py", backend_dir)
    if success:
        print(stdout)
        return True
    else:
        print(f"❌ Failed to create test user: {stderr}")
        return False

def test_websocket_connection():
    """Test WebSocket connection"""
    print("\n🔧 Testing WebSocket Connection...")
    
    test_script = '''
import asyncio
import websockets
import json
import sys

async def test_connection():
    try:
        uri = "ws://localhost:8000/ws/chat/"
        print(f"Connecting to {uri}...")
        
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connection established")
            
            # Wait for welcome message
            try:
                welcome = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(welcome)
                print(f"✅ Welcome message: {data.get('message', '')[:50]}...")
                
                # Send test message
                test_msg = {"message": "Hello, I have a headache"}
                await websocket.send(json.dumps(test_msg))
                print("✅ Test message sent")
                
                # Wait for responses
                for i in range(2):  # Expect echo + bot response
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    data = json.loads(response)
                    msg_type = "Bot" if data.get('is_bot') else "User"
                    print(f"✅ {msg_type} response received: {data.get('message', '')[:50]}...")
                
                print("✅ WebSocket test completed successfully!")
                return True
                
            except asyncio.TimeoutError:
                print("❌ Timeout waiting for messages")
                return False
                
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    sys.exit(0 if result else 1)
'''
    
    with open('test_websocket_connection.py', 'w') as f:
        f.write(test_script)
    
    success, stdout, stderr = run_command("python test_websocket_connection.py")
    if success:
        print(stdout)
        return True
    else:
        print(f"❌ WebSocket test failed: {stderr}")
        return False

def generate_usage_instructions():
    """Generate usage instructions"""
    instructions = """
# 🩺 MediSwift Chat - Usage Instructions

## Backend Setup
1. **Start Django Server:**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

## Frontend Setup
1. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at: http://localhost:8080

## Testing the Chat

### Method 1: Full Application
1. Open http://localhost:8080 in your browser
2. Login with test credentials:
   - Username: `chattest`
   - Password: `testpass123`
3. Click the chat icon (💬) in the bottom right corner
4. Try these test messages:
   - "I have a headache"
   - "What is Paracetamol?"
   - "I have fever"
   - "Do I need antibiotics?"

### Method 2: Standalone WebSocket Test
1. Open `test-websocket-simple.html` in your browser
2. Click "Connect" button
3. Use the test buttons or type messages manually

### Expected Chat Behavior
- **Welcome Message:** "Welcome to MediSwift AI Assistant! How can I help you with your healthcare needs today?"
- **Medicine Queries:** Bot provides detailed information about medicines, dosages, and prices
- **Symptom Queries:** Bot suggests appropriate medicines for symptoms like headache, fever, cold, etc.

## Troubleshooting

### Chat Widget Not Appearing
- Check browser console for JavaScript errors
- Ensure user is logged in
- Verify both servers are running

### No Bot Response
- Check Django server logs for WebSocket errors
- Verify WebSocket URL in .env: `VITE_WS_BASE_URL=ws://localhost:8000`
- Test with standalone HTML file

### Connection Errors
- Ensure Django server is running on port 8000
- Check firewall settings
- Try connecting without authentication first

## Production Deployment
- Use proper ASGI server (Daphne, Uvicorn)
- Configure WebSocket proxy in nginx
- Set up proper authentication
- Use Redis for channel layers
- Enable HTTPS for secure WebSocket connections

## Support
If issues persist:
1. Check Django server logs
2. Use browser developer tools
3. Test with the standalone HTML interface
4. Run the diagnostic scripts provided
"""
    
    with open('CHAT_USAGE_INSTRUCTIONS.md', 'w') as f:
        f.write(instructions)
    
    print("✅ Usage instructions created: CHAT_USAGE_INSTRUCTIONS.md")

def main():
    """Main function to run all fixes"""
    print("🚀 MediSwift Chat - Comprehensive Fix Script")
    print("=" * 60)
    
    # Check and fix backend
    backend_ok = check_and_fix_backend()
    
    # Check and fix frontend
    frontend_ok = check_and_fix_frontend()
    
    # Create test user
    test_user_ok = create_test_user()
    
    # Generate instructions
    generate_usage_instructions()
    
    print("\n" + "=" * 60)
    print("📊 Fix Results:")
    print(f"   Backend Setup: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"   Frontend Setup: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    print(f"   Test User: {'✅ PASS' if test_user_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok and test_user_ok:
        print("\n🎉 All fixes completed successfully!")
        print("\n📋 Next Steps:")
        print("   1. Start Django server: cd backend && python manage.py runserver 0.0.0.0:8000")
        print("   2. Start frontend: npm run dev")
        print("   3. Test chat at: http://localhost:8080")
        print("   4. Login with: chattest / testpass123")
        print("   5. Click chat icon and test messaging")
        print("\n📖 See CHAT_USAGE_INSTRUCTIONS.md for detailed instructions")
        return True
    else:
        print("\n⚠️  Some fixes failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    try:
        result = main()
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n⏹️  Fix script interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)