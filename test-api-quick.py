#!/usr/bin/env python3
"""
Quick API test to identify issues
"""

import requests
import json
import time

def test_api():
    base_url = "http://127.0.0.1:8000"
    
    print("🔍 Testing MediSwift API endpoints...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/admin/", timeout=5)
        print(f"✅ Server is running - Admin page status: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return False
    
    # Test 2: Check API root
    try:
        response = requests.get(f"{base_url}/api/", timeout=5)
        print(f"📍 API root status: {response.status_code}")
        if response.status_code != 200:
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ API root error: {e}")
    
    # Test 3: Check auth endpoints
    auth_endpoints = [
        "/api/auth/",
        "/api/auth/token/",
        "/api/auth/register/"
    ]
    
    for endpoint in auth_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"🔐 {endpoint} - Status: {response.status_code}")
            if response.status_code not in [200, 405]:  # 405 = Method Not Allowed is OK for GET on POST endpoints
                print(f"   Response: {response.text[:200]}")
        except Exception as e:
            print(f"❌ {endpoint} error: {e}")
    
    # Test 4: Try to register a test user
    try:
        register_data = {
            "username": "testuser123",
            "email": "test123@example.com",
            "password": "strongpass123",
            "password2": "strongpass123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/register/",
            json=register_data,
            timeout=10
        )
        print(f"👤 Registration test - Status: {response.status_code}")
        if response.status_code == 201:
            print("✅ Registration successful!")
            data = response.json()
            if 'tokens' in data:
                access_token = data['tokens']['access']
                print("✅ Tokens received")
                
                # Test 5: Try authenticated endpoint
                headers = {'Authorization': f'Bearer {access_token}'}
                auth_response = requests.get(
                    f"{base_url}/api/auth/me/",
                    headers=headers,
                    timeout=5
                )
                print(f"🔑 Authenticated request - Status: {auth_response.status_code}")
                
        else:
            print(f"   Registration response: {response.text[:300]}")
            
    except Exception as e:
        print(f"❌ Registration test error: {e}")
    
    # Test 6: Check healthcare endpoints
    healthcare_endpoints = [
        "/api/healthcare/",
        "/api/healthcare/specializations/",
        "/api/healthcare/doctors/",
    ]
    
    for endpoint in healthcare_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"🏥 {endpoint} - Status: {response.status_code}")
            if response.status_code == 401:
                print("   (401 Unauthorized - expected without token)")
            elif response.status_code not in [200, 401]:
                print(f"   Response: {response.text[:200]}")
        except Exception as e:
            print(f"❌ {endpoint} error: {e}")
    
    print("\n🎯 API Test Summary:")
    print("- If you see 401 errors for healthcare endpoints, that's normal (authentication required)")
    print("- If registration works, your API is functional")
    print("- Check the Django server console for any error messages")

if __name__ == "__main__":
    test_api()