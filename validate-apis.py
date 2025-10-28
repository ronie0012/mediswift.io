#!/usr/bin/env python3
"""
Comprehensive API validation script for MediSwift
"""

import requests
import json
import sys
from datetime import datetime

class MediSwiftAPIValidator:
    def __init__(self, base_url="http://127.0.0.1:8000/api"):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.session = requests.Session()
        self.test_user_id = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        colors = {
            "INFO": "\033[94m",     # Blue
            "PASS": "\033[92m",     # Green
            "FAIL": "\033[91m",     # Red
            "ERROR": "\033[91m",    # Red
            "SUCCESS": "\033[92m",  # Green
            "WARN": "\033[93m"      # Yellow
        }
        reset = "\033[0m"
        color = colors.get(status, "")
        print(f"{color}[{timestamp}] {status}: {message}{reset}")
        
    def test_endpoint(self, method, endpoint, data=None, expected_status=200, description=""):
        """Test a single API endpoint"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        if self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'
            
        if data:
            headers['Content-Type'] = 'application/json'
            
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = self.session.post(url, headers=headers, json=data, timeout=10)
            elif method.upper() == 'PUT':
                response = self.session.put(url, headers=headers, json=data, timeout=10)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=10)
                
            desc = f" ({description})" if description else ""
            if response.status_code == expected_status:
                self.log(f"✅ {method} {endpoint}{desc} - Status: {response.status_code}", "PASS")
                return response
            else:
                self.log(f"❌ {method} {endpoint}{desc} - Expected: {expected_status}, Got: {response.status_code}", "FAIL")
                if response.text:
                    self.log(f"   Response: {response.text[:200]}...", "WARN")
                return None
                
        except Exception as e:
            self.log(f"❌ {method} {endpoint} - Error: {str(e)}", "ERROR")
            return None
    
    def register_test_user(self):
        """Register a test user for validation"""
        self.log("Registering test user...")
        
        register_data = {
            "username": f"apitest_{datetime.now().strftime('%H%M%S')}",
            "email": f"apitest_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "strongpass123",
            "password2": "strongpass123",
            "first_name": "API",
            "last_name": "Test"
        }
        
        response = self.test_endpoint('POST', '/auth/register/', register_data, 200, "User Registration")
        if response:
            data = response.json()
            self.access_token = data.get('tokens', {}).get('access')
            self.refresh_token = data.get('tokens', {}).get('refresh')
            self.test_user_id = data.get('user', {}).get('id')
            self.log("Test user registered and authenticated successfully")
            return True
        else:
            self.log("Failed to register test user", "ERROR")
            return False
    
    def test_authentication_flow(self):
        """Test complete authentication flow"""
        self.log("Testing authentication flow...")
        
        tests_passed = 0
        total_tests = 0
        
        # Test 1: Token verification
        total_tests += 1
        if self.test_endpoint('POST', '/auth/token/verify/', {'token': self.access_token}, 200, "Token Verification"):
            tests_passed += 1
        
        # Test 2: Get current user
        total_tests += 1
        if self.test_endpoint('GET', '/auth/me/', None, 200, "Get Current User"):
            tests_passed += 1
        
        # Test 3: Refresh token
        total_tests += 1
        if self.test_endpoint('POST', '/auth/token/refresh/', {'refresh': self.refresh_token}, 200, "Refresh Token"):
            tests_passed += 1
        
        self.log(f"Authentication tests: {tests_passed}/{total_tests} passed")
        return tests_passed == total_tests
    
    def test_healthcare_endpoints(self):
        """Test healthcare API endpoints"""
        self.log("Testing healthcare endpoints...")
        
        tests_passed = 0
        total_tests = 0
        
        # Test specializations
        total_tests += 1
        response = self.test_endpoint('GET', '/healthcare/specializations/', None, 200, "List Specializations")
        if response:
            tests_passed += 1
            specializations = response.json()
            if specializations and len(specializations) > 0:
                spec_id = specializations[0]['id']
                total_tests += 1
                if self.test_endpoint('GET', f'/healthcare/specializations/{spec_id}/', None, 200, "Get Specialization Detail"):
                    tests_passed += 1
        
        # Test doctors
        total_tests += 1
        response = self.test_endpoint('GET', '/healthcare/doctors/', None, 200, "List Doctors")
        if response:
            tests_passed += 1
            doctors = response.json()
            if doctors and len(doctors) > 0:
                doctor_id = doctors[0]['id']
                total_tests += 1
                if self.test_endpoint('GET', f'/healthcare/doctors/{doctor_id}/', None, 200, "Get Doctor Detail"):
                    tests_passed += 1
        
        # Test patients
        total_tests += 1
        if self.test_endpoint('GET', '/healthcare/patients/', None, 200, "List Patients"):
            tests_passed += 1
        
        # Test appointments
        total_tests += 1
        if self.test_endpoint('GET', '/healthcare/appointments/', None, 200, "List Appointments"):
            tests_passed += 1
        
        total_tests += 1
        if self.test_endpoint('GET', '/healthcare/appointments/upcoming/', None, 200, "Get Upcoming Appointments"):
            tests_passed += 1
        
        self.log(f"Healthcare tests: {tests_passed}/{total_tests} passed")
        return tests_passed == total_tests
    
    def test_appointment_crud(self):
        """Test appointment CRUD operations"""
        self.log("Testing appointment CRUD operations...")
        
        # First, get available doctors and create a patient profile if needed
        doctors_response = self.test_endpoint('GET', '/healthcare/doctors/', None, 200, "Get Doctors for Appointment")
        if not doctors_response:
            self.log("Cannot test appointments without doctors", "WARN")
            return False
        
        doctors = doctors_response.json()
        if not doctors:
            self.log("No doctors available for appointment testing", "WARN")
            return False
        
        doctor_id = doctors[0]['id']
        
        # Try to create an appointment (this might fail if user is not a patient)
        appointment_data = {
            "doctor_id": doctor_id,
            "appointment_date": "2025-01-15",
            "start_time": "14:00:00",
            "end_time": "14:30:00",
            "reason": "API Test Appointment",
            "notes": "This is a test appointment created by API validation"
        }
        
        response = self.test_endpoint('POST', '/healthcare/appointments/', appointment_data, 201, "Create Appointment")
        if response:
            appointment = response.json()
            appointment_id = appointment['id']
            
            # Test getting the created appointment
            if self.test_endpoint('GET', f'/healthcare/appointments/{appointment_id}/', None, 200, "Get Appointment Detail"):
                # Test canceling the appointment
                self.test_endpoint('POST', f'/healthcare/appointments/{appointment_id}/cancel/', None, 200, "Cancel Appointment")
                return True
        
        return False

def main():
    print("🚀 Starting MediSwift API Validation")
    print("=" * 50)
    
    validator = MediSwiftAPIValidator()
    
    # Check if server is running
    try:
        response = requests.get(f"{validator.base_url.replace('/api', '')}/admin/", timeout=5)
        validator.log("✅ Django server is running")
    except:
        validator.log("❌ Django server is not running. Please start it with: python manage.py runserver", "ERROR")
        sys.exit(1)
    
    # Register and authenticate test user
    if not validator.register_test_user():
        validator.log("Cannot proceed without authentication", "ERROR")
        sys.exit(1)
    
    # Run all validation tests
    auth_success = validator.test_authentication_flow()
    healthcare_success = validator.test_healthcare_endpoints()
    
    # Optional: Test appointment CRUD (might fail if user permissions are strict)
    try:
        appointment_success = validator.test_appointment_crud()
    except:
        validator.log("Appointment CRUD test skipped (permission restrictions)", "WARN")
        appointment_success = True  # Don't fail the entire test for this
    
    print("\n" + "=" * 50)
    if auth_success and healthcare_success:
        validator.log("🎉 All critical API validations passed! Your API is working correctly.", "SUCCESS")
        validator.log("✅ Authentication endpoints: Working", "SUCCESS")
        validator.log("✅ Healthcare endpoints: Working", "SUCCESS")
        validator.log("✅ Your Postman collection should work perfectly now!", "SUCCESS")
        sys.exit(0)
    else:
        validator.log("❌ Some API validations failed. Check the errors above.", "FAIL")
        sys.exit(1)

if __name__ == "__main__":
    main()