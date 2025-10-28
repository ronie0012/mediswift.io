#!/usr/bin/env python3
"""
MediSwift Chatbot Fix Script
This script diagnoses and fixes common chatbot issues
"""
import os
import sys
import subprocess
import json
import time

def check_python_packages():
    """Check if required Python packages are installed"""
    print("🔍 Checking Python packages...")
    
    required_packages = [
        'django',
        'channels',
        'djangorestframework',
        'djangorestframework_simplejwt',
        'django-cors-headers'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing_packages, check=True)
            print("✅ Packages installed successfully")
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages")
            return False
    
    return True

def check_django_setup():
    """Check Django configuration"""
    print("\n🔍 Checking Django setup...")
    
    backend_dir = os.path.join(os.getcwd(), 'backend')
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found")
        return False
    
    os.chdir(backend_dir)
    
    # Check if manage.py exists
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found")
        return False
    
    print("  ✅ manage.py found")
    
    # Run Django checks
    try:
        result = subprocess.run([sys.executable, 'manage.py', 'check'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("  ✅ Django configuration is valid")
        else:
            print(f"  ⚠️  Django warnings: {result.stdout}")
    except Exception as e:
        print(f"  ❌ Django check failed: {e}")
        return False
    
    return True

def run_migrations():
    """Run Django migrations"""
    print("\n🔍 Running Django migrations...")
    
    try:
        result = subprocess.run([sys.executable, 'manage.py', 'migrate'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("  ✅ Migrations completed successfully")
        else:
            print(f"  ❌ Migration failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"  ❌ Migration error: {e}")
        return False
    
    return True

def test_chat_models():
    """Test chat models"""
    print("\n🔍 Testing chat models...")
    
    try:
        result = subprocess.run([sys.executable, 'manage.py', 'test_chat'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("  ✅ Chat models working correctly")
            return True
        else:
            print(f"  ❌ Chat model test failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"  ❌ Chat model test error: {e}")
        return False

def check_frontend_setup():
    """Check frontend configuration"""
    print("\n🔍 Checking frontend setup...")
    
    # Go back to root directory
    os.chdir('..')
    
    # Check if package.json exists
    if not os.path.exists('package.json'):
        print("❌ package.json not found")
        return False
    
    print("  ✅ package.json found")
    
    # Check if node_modules exists
    if not os.path.exists('node_modules'):
        print("  ⚠️  node_modules not found, running npm install...")
        try:
            subprocess.run(['npm', 'install'], check=True)
            print("  ✅ npm install completed")
        except subprocess.CalledProcessError:
            print("  ❌ npm install failed")
            return False
    else:
        print("  ✅ node_modules found")
    
    # Check environment variables
    if os.path.exists('.env'):
        print("  ✅ .env file found")
        with open('.env', 'r') as f:
            env_content = f.read()
            if 'VITE_WS_BASE_URL' in env_content:
                print("  ✅ WebSocket URL configured")
            else:
                print("  ⚠️  WebSocket URL not configured")
    else:
        print("  ⚠️  .env file not found")
    
    return True

def create_startup_scripts():
    """Create helpful startup scripts"""
    print("\n🔧 Creating startup scripts...")
    
    # Backend startup script
    backend_script = """#!/bin/bash
echo "🚀 Starting MediSwift Backend with WebSocket support..."
cd backend
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
"""
    
    with open('start-backend.sh', 'w') as f:
        f.write(backend_script)
    
    # Frontend startup script  
    frontend_script = """#!/bin/bash
echo "🚀 Starting MediSwift Frontend..."
npm run dev
"""
    
    with open('start-frontend.sh', 'w') as f:
        f.write(frontend_script)
    
    print("  ✅ Created start-backend.sh and start-frontend.sh")
    
    return True

def main():
    """Main fix function"""
    print("🔧 MediSwift Chatbot Fix Script")
    print("=" * 50)
    
    success = True
    
    # Check Python packages
    if not check_python_packages():
        success = False
    
    # Check Django setup
    if not check_django_setup():
        success = False
    
    # Run migrations
    if not run_migrations():
        success = False
    
    # Test chat models
    if not test_chat_models():
        success = False
    
    # Check frontend setup
    if not check_frontend_setup():
        success = False
    
    # Create startup scripts
    if not create_startup_scripts():
        success = False
    
    print("\n" + "=" * 50)
    
    if success:
        print("✅ All checks passed! Chatbot should be working now.")
        print("\n📋 Next steps:")
        print("1. Start the backend: cd backend && python manage.py runserver")
        print("2. Start the frontend: npm run dev")
        print("3. Open the app and test the chat widget")
        print("4. For testing: open test-frontend-chat.html in your browser")
    else:
        print("❌ Some issues were found. Please review the errors above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)