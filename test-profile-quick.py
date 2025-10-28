#!/usr/bin/env python3
import requests
import json

def test_profile_api():
    base_url = "http://localhost:8000/api"
    
    print("🧪 Testing Profile API...")
    
    # Test 1: Check if the endpoint exists (should return 401 without auth)
    print("\n1. Testing endpoint availability...")
    try:
        response = requests.get(f"{base_url}/auth/me/")
        if response.status_code == 401:
            print("✅ Endpoint exists and requires authentication")
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Try to login with test user
    print("\n2. Testing login...")
    try:
        login_data = {
            "username": "chattest",
            "password": "testpass123"
        }
        response = requests.post(f"{base_url}/auth/token/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            print("✅ Login successful")
            
            # Test 3: Get profile with token
            print("\n3. Testing profile retrieval...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/auth/me/", headers=headers)
            if response.status_code == 200:
                profile_data = response.json()
                print("✅ Profile retrieved successfully")
                print(f"User: {profile_data.get('username', 'N/A')}")
                print(f"Email: {profile_data.get('email', 'N/A')}")
                return True
            else:
                print(f"❌ Profile retrieval failed: {response.status_code}")
                print(f"Response: {response.text}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during login/profile test: {e}")
    
    return False

if __name__ == "__main__":
    test_profile_api()