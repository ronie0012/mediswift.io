#!/usr/bin/env python3
import requests
import json
import time

def test_full_flow():
    base_url = "http://localhost:8000/api"
    
    print("🧪 Testing Full Authentication Flow...")
    
    # Test 1: Login
    print("\n1. Testing login...")
    try:
        login_data = {
            "username": "chattest",
            "password": "testpass123"
        }
        response = requests.post(f"{base_url}/auth/token/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data.get('access')
            user_data = data.get('user')
            print("✅ Login successful")
            print(f"   User: {user_data.get('username', 'N/A')}")
            print(f"   Email: {user_data.get('email', 'N/A')}")
            print(f"   First Name: {user_data.get('first_name', 'N/A')}")
            print(f"   Last Name: {user_data.get('last_name', 'N/A')}")
            
            # Test 2: Get profile
            print("\n2. Testing profile retrieval...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/auth/me/", headers=headers)
            if response.status_code == 200:
                profile_data = response.json()
                print("✅ Profile retrieved successfully")
                print(f"   Profile data: {json.dumps(profile_data, indent=2)}")
                
                # Test 3: Update profile
                print("\n3. Testing profile update...")
                update_data = {
                    "first_name": "Updated",
                    "last_name": "Name"
                }
                response = requests.patch(f"{base_url}/auth/me/", json=update_data, headers=headers)
                if response.status_code == 200:
                    updated_data = response.json()
                    print("✅ Profile updated successfully")
                    print(f"   Updated data: {json.dumps(updated_data, indent=2)}")
                    
                    # Test 4: Verify update
                    print("\n4. Verifying profile update...")
                    response = requests.get(f"{base_url}/auth/me/", headers=headers)
                    if response.status_code == 200:
                        final_data = response.json()
                        print("✅ Profile verification successful")
                        print(f"   Final data: {json.dumps(final_data, indent=2)}")
                        
                        if final_data.get('first_name') == 'Updated' and final_data.get('last_name') == 'Name':
                            print("✅ Profile update verified!")
                            return True
                        else:
                            print("❌ Profile update not reflected")
                    else:
                        print(f"❌ Profile verification failed: {response.status_code}")
                else:
                    print(f"❌ Profile update failed: {response.status_code}")
                    print(f"   Response: {response.text}")
            else:
                print(f"❌ Profile retrieval failed: {response.status_code}")
                print(f"   Response: {response.text}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error during test: {e}")
    
    return False

def test_cors():
    print("\n🌐 Testing CORS...")
    try:
        # Test preflight request
        response = requests.options(
            "http://localhost:8000/api/auth/me/",
            headers={
                "Origin": "http://localhost:8080",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        )
        print(f"   CORS preflight status: {response.status_code}")
        print(f"   CORS headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ CORS configured correctly")
        else:
            print("⚠️ CORS might have issues")
            
    except Exception as e:
        print(f"❌ CORS test error: {e}")

if __name__ == "__main__":
    success = test_full_flow()
    test_cors()
    
    if success:
        print("\n🎉 All tests passed! The backend is working correctly.")
        print("   If the frontend still shows network errors, the issue is likely:")
        print("   1. Frontend server not running")
        print("   2. Environment variables not loaded correctly")
        print("   3. Browser cache issues")
    else:
        print("\n❌ Some tests failed. Check the backend configuration.")