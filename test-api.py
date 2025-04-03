import requests
import json

# Get authentication token
def get_token():
    login_url = "http://localhost:8000/api/auth/token/"
    credentials = {
        "username": "dr_smith",  # Using a doctor account we created
        "password": "password123"  # Using the password from our test data script
    }
    
    response = requests.post(login_url, json=credentials)
    if response.status_code == 200:
        print("Authentication successful")
        return response.json()["access"]
    else:
        print(f"Authentication failed: {response.status_code}")
        print(response.text)
        return None

# Get doctors
def get_doctors(token):
    doctors_url = "http://localhost:8000/api/healthcare/doctors/"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    response = requests.get(doctors_url, headers=headers)
    if response.status_code == 200:
        print("Doctors API call successful")
        return response.json()
    else:
        print(f"Doctors API call failed: {response.status_code}")
        print(response.text)
        return None

# Main function
def main():
    token = get_token()
    if token:
        doctors = get_doctors(token)
        if doctors:
            print(f"Number of doctors: {len(doctors)}")
            print("Doctors list:")
            for doctor in doctors:
                print(f"- Dr. {doctor['user']['first_name']} {doctor['user']['last_name']} ({doctor['specialization']['name']})")

if __name__ == "__main__":
    main() 