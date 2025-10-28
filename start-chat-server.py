#!/usr/bin/env python3
"""
Start the Django development server with ASGI support for WebSockets
"""
import os
import sys
import subprocess

def start_server():
    """Start the Django development server with ASGI"""
    
    # Change to backend directory
    backend_dir = os.path.join(os.getcwd(), 'backend')
    
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    try:
        print("🚀 Starting Django development server with ASGI support...")
        print("📡 WebSocket endpoint will be available at: ws://localhost:8000/ws/chat/")
        print("🌐 HTTP API will be available at: http://localhost:8000/api/")
        print("\nPress Ctrl+C to stop the server\n")
        
        # Start the server using daphne (ASGI server)
        cmd = [sys.executable, 'manage.py', 'runserver', '0.0.0.0:8000']
        subprocess.run(cmd, check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = start_server()
    sys.exit(0 if success else 1)