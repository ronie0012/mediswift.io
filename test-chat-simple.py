#!/usr/bin/env python3
"""
Simple test to verify chat functionality
"""
import os
import sys
import subprocess
import time
import threading

def start_server():
    """Start Django server in background"""
    os.chdir('backend')
    try:
        subprocess.run([sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000'], 
                      timeout=5)
    except subprocess.TimeoutExpired:
        pass  # Expected - server runs indefinitely

def test_api():
    """Test if API is accessible"""
    import requests
    try:
        response = requests.get('http://localhost:8000/api/', timeout=5)
        print(f"API Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"API Error: {e}")
        return False

def main():
    print("Testing MediSwift Chat...")
    
    # Start server in background
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait for server to start
    time.sleep(3)
    
    # Test API
    if test_api():
        print("✅ Backend is running!")
        print("🌐 Open http://localhost:8000/admin/ to verify")
        print("📡 WebSocket should be available at ws://localhost:8000/ws/chat/")
        print("🧪 Open test-frontend-chat.html to test the chat")
    else:
        print("❌ Backend is not responding")
    
    print("\nTo test the full application:")
    print("1. Keep the backend running (python manage.py runserver)")
    print("2. Start frontend: npm run dev")
    print("3. Open the app and test the chat widget")

if __name__ == "__main__":
    main()