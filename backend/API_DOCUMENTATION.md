# MediSwift API Documentation

## Authentication Endpoints

### JWT Token Endpoints

#### Obtain Token
- **URL**: `/api/auth/token/`
- **Method**: `POST`
- **Description**: Login endpoint to get JWT tokens for authentication
- **Request Body**:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```
- **Success Response**:
```json
{
  "access": "access_token_string",
  "refresh": "refresh_token_string",
  "user": {
    "id": 1,
    "username": "your_username",
    "email": "your_email@example.com",
    "first_name": "Your",
    "last_name": "Name"
  }
}
```

#### Refresh Token
- **URL**: `/api/auth/token/refresh/`
- **Method**: `POST`
- **Description**: Get a new access token using refresh token
- **Request Body**:
```json
{
  "refresh": "your_refresh_token"
}
```
- **Success Response**:
```json
{
  "access": "new_access_token_string"
}
```

#### Verify Token
- **URL**: `/api/auth/token/verify/`
- **Method**: `POST`
- **Description**: Verify if a token is valid
- **Request Body**:
```json
{
  "token": "your_token"
}
```
- **Success Response**: `200 OK` with empty body if valid

### User Registration and Management

#### Register User
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "username": "new_username",
  "email": "email@example.com",
  "password": "strong_password",
  "password2": "strong_password",
  "first_name": "First",
  "last_name": "Last"
}
```
- **Success Response**:
```json
{
  "user": {
    "id": 1,
    "username": "new_username",
    "email": "email@example.com",
    "first_name": "First",
    "last_name": "Last"
  },
  "message": "User created successfully",
  "tokens": {
    "refresh": "refresh_token_string",
    "access": "access_token_string"
  }
}
```

#### Change Password
- **URL**: `/api/auth/change-password/`
- **Method**: `PUT`
- **Description**: Change the password for authenticated user
- **Authentication**: Required (Bearer Token)
- **Request Body**:
```json
{
  "old_password": "current_password",
  "new_password": "new_strong_password",
  "new_password2": "new_strong_password"
}
```
- **Success Response**:
```json
{
  "message": "Password updated successfully",
  "tokens": {
    "refresh": "refresh_token_string",
    "access": "access_token_string"
  }
}
```

#### Request Password Reset
- **URL**: `/api/auth/password-reset/`
- **Method**: `POST`
- **Description**: Request a password reset email
- **Request Body**:
```json
{
  "email": "your_email@example.com"
}
```
- **Success Response**:
```json
{
  "message": "Password reset email has been sent."
}
```

#### Confirm Password Reset
- **URL**: `/api/auth/password-reset-confirm/`
- **Method**: `POST`
- **Description**: Reset password using token from email
- **Request Body**:
```json
{
  "token": "token_from_email",
  "uidb64": "user_id_base64_from_email",
  "password": "new_strong_password",
  "password2": "new_strong_password"
}
```
- **Success Response**:
```json
{
  "message": "Password reset successful"
}
```

#### Get User Details
- **URL**: `/api/auth/me/`
- **Method**: `GET`
- **Description**: Get details of the authenticated user
- **Authentication**: Required (Bearer Token)
- **Success Response**:
```json
{
  "id": 1,
  "username": "your_username",
  "email": "your_email@example.com",
  "first_name": "Your",
  "last_name": "Name"
}
```

## Authentication Usage Examples

### Login Flow

1. User registers or logs in to obtain JWT tokens:
   ```
   POST /api/auth/token/
   {
     "username": "username",
     "password": "password"
   }
   ```

2. Server responds with tokens:
   ```
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "user": {
       "id": 1,
       "username": "username",
       "email": "user@example.com",
       "first_name": "First",
       "last_name": "Last"
     }
   }
   ```

3. For subsequent API requests, include the access token in the Authorization header:
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   ```

4. When the access token expires (after 30 minutes), use the refresh token to get a new access token:
   ```
   POST /api/auth/token/refresh/
   {
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
   }
   ```

5. Server responds with a new access token:
   ```
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
   }
   ```

### Password Reset Flow

1. User requests password reset by providing email:
   ```
   POST /api/auth/password-reset/
   {
     "email": "user@example.com"
   }
   ```

2. Server sends email with password reset link containing token and uidb64

3. User follows link and submits new password:
   ```
   POST /api/auth/password-reset-confirm/
   {
     "token": "agsd6f76asdf67sad6f7",
     "uidb64": "MTI",
     "password": "new_strong_password",
     "password2": "new_strong_password"
   }
   ```

4. Server confirms password reset and user can log in with new password 

## Healthcare Endpoints

### Specializations

#### List All Specializations
- **URL**: `/api/healthcare/specializations/`
- **Method**: `GET`
- **Description**: Get a list of all medical specializations
- **Authentication**: Required
- **Success Response**:
```json
[
  {
    "id": 1,
    "name": "Cardiology",
    "description": "Deals with heart disorders",
    "created_at": "2023-04-02T12:00:00Z"
  },
  {
    "id": 2,
    "name": "Neurology",
    "description": "Deals with disorders of the nervous system",
    "created_at": "2023-04-02T12:15:00Z"
  }
]
```

#### Get Specialization Detail
- **URL**: `/api/healthcare/specializations/{id}/`
- **Method**: `GET`
- **Description**: Get details of a specific specialization
- **Authentication**: Required
- **Success Response**:
```json
{
  "id": 1,
  "name": "Cardiology",
  "description": "Deals with heart disorders",
  "created_at": "2023-04-02T12:00:00Z"
}
```

### Doctors

#### List All Doctors
- **URL**: `/api/healthcare/doctors/`
- **Method**: `GET`
- **Description**: Get a list of all doctors
- **Authentication**: Required
- **Success Response**:
```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "doctor1",
      "email": "doctor1@example.com",
      "first_name": "John",
      "last_name": "Smith"
    },
    "specialization": {
      "id": 1,
      "name": "Cardiology",
      "description": "Deals with heart disorders",
      "created_at": "2023-04-02T12:00:00Z"
    },
    "license_number": "MED12345",
    "years_of_experience": 10,
    "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
    "is_available": true,
    "created_at": "2023-04-02T12:30:00Z",
    "updated_at": "2023-04-02T12:30:00Z"
  }
]
```

#### Get Doctor Detail
- **URL**: `/api/healthcare/doctors/{id}/`
- **Method**: `GET`
- **Description**: Get details of a specific doctor
- **Authentication**: Required
- **Success Response**:
```json
{
  "id": 1,
  "user": {
    "id": 2,
    "username": "doctor1",
    "email": "doctor1@example.com",
    "first_name": "John",
    "last_name": "Smith"
  },
  "specialization": {
    "id": 1,
    "name": "Cardiology",
    "description": "Deals with heart disorders",
    "created_at": "2023-04-02T12:00:00Z"
  },
  "license_number": "MED12345",
  "years_of_experience": 10,
  "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
  "is_available": true,
  "created_at": "2023-04-02T12:30:00Z",
  "updated_at": "2023-04-02T12:30:00Z"
}
```

#### Get Doctor Profile For Current User
- **URL**: `/api/healthcare/doctors/me/`
- **Method**: `GET`
- **Description**: Get doctor profile for the currently authenticated user
- **Authentication**: Required
- **Success Response**:
```json
{
  "id": 1,
  "user": {
    "id": 2,
    "username": "doctor1",
    "email": "doctor1@example.com",
    "first_name": "John",
    "last_name": "Smith"
  },
  "specialization": {
    "id": 1,
    "name": "Cardiology",
    "description": "Deals with heart disorders",
    "created_at": "2023-04-02T12:00:00Z"
  },
  "license_number": "MED12345",
  "years_of_experience": 10,
  "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
  "is_available": true,
  "created_at": "2023-04-02T12:30:00Z",
  "updated_at": "2023-04-02T12:30:00Z"
}
```

#### Get Doctor's Appointments
- **URL**: `/api/healthcare/doctors/{id}/appointments/`
- **Method**: `GET`
- **Description**: Get all appointments for a specific doctor
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by appointment status (scheduled, confirmed, completed, cancelled, no_show)
  - `date_from`: Filter by date (format: YYYY-MM-DD)
  - `date_to`: Filter by date (format: YYYY-MM-DD)
- **Success Response**:
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 1,
      "user": {
        "id": 2,
        "username": "doctor1",
        "email": "doctor1@example.com",
        "first_name": "John",
        "last_name": "Smith"
      },
      "specialization": {
        "id": 1,
        "name": "Cardiology",
        "description": "Deals with heart disorders",
        "created_at": "2023-04-02T12:00:00Z"
      },
      "license_number": "MED12345",
      "years_of_experience": 10,
      "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
      "is_available": true,
      "created_at": "2023-04-02T12:30:00Z",
      "updated_at": "2023-04-02T12:30:00Z"
    },
    "patient": {
      "id": 1,
      "user": {
        "id": 3,
        "username": "patient1",
        "email": "patient1@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "date_of_birth": "1990-05-15",
      "gender": "F",
      "phone_number": "1234567890",
      "address": "123 Main St, City",
      "emergency_contact_name": "John Doe",
      "emergency_contact_number": "0987654321",
      "blood_group": "AB+",
      "allergies": "None",
      "medical_conditions": "None",
      "created_at": "2023-04-02T12:45:00Z",
      "updated_at": "2023-04-02T12:45:00Z"
    },
    "appointment_date": "2023-04-10",
    "start_time": "10:00:00",
    "end_time": "10:30:00",
    "status": "scheduled",
    "reason": "Routine checkup",
    "notes": "",
    "created_at": "2023-04-02T13:00:00Z",
    "updated_at": "2023-04-02T13:00:00Z"
  }
]
```

### Patients

#### List All Patients
- **URL**: `/api/healthcare/patients/`
- **Method**: `GET`
- **Description**: Get a list of all patients (restricted based on user role)
- **Authentication**: Required
- **Success Response**:
```json
[
  {
    "id": 1,
    "user": {
      "id": 3,
      "username": "patient1",
      "email": "patient1@example.com",
      "first_name": "Jane",
      "last_name": "Doe"
    },
    "date_of_birth": "1990-05-15",
    "gender": "F",
    "phone_number": "1234567890",
    "address": "123 Main St, City",
    "emergency_contact_name": "John Doe",
    "emergency_contact_number": "0987654321",
    "blood_group": "AB+",
    "allergies": "None",
    "medical_conditions": "None",
    "created_at": "2023-04-02T12:45:00Z",
    "updated_at": "2023-04-02T12:45:00Z"
  }
]
```

#### Get Patient Detail
- **URL**: `/api/healthcare/patients/{id}/`
- **Method**: `GET`
- **Description**: Get details of a specific patient
- **Authentication**: Required
- **Success Response**:
```json
{
  "id": 1,
  "user": {
    "id": 3,
    "username": "patient1",
    "email": "patient1@example.com",
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "date_of_birth": "1990-05-15",
  "gender": "F",
  "phone_number": "1234567890",
  "address": "123 Main St, City",
  "emergency_contact_name": "John Doe",
  "emergency_contact_number": "0987654321",
  "blood_group": "AB+",
  "allergies": "None",
  "medical_conditions": "None",
  "created_at": "2023-04-02T12:45:00Z",
  "updated_at": "2023-04-02T12:45:00Z"
}
```

#### Get Patient Profile For Current User
- **URL**: `/api/healthcare/patients/me/`
- **Method**: `GET`
- **Description**: Get patient profile for the currently authenticated user
- **Authentication**: Required
- **Success Response**:
```json
{
  "id": 1,
  "user": {
    "id": 3,
    "username": "patient1",
    "email": "patient1@example.com",
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "date_of_birth": "1990-05-15",
  "gender": "F",
  "phone_number": "1234567890",
  "address": "123 Main St, City",
  "emergency_contact_name": "John Doe",
  "emergency_contact_number": "0987654321",
  "blood_group": "AB+",
  "allergies": "None",
  "medical_conditions": "None",
  "created_at": "2023-04-02T12:45:00Z",
  "updated_at": "2023-04-02T12:45:00Z"
}
```

#### Get Patient's Appointments
- **URL**: `/api/healthcare/patients/{id}/appointments/`
- **Method**: `GET`
- **Description**: Get all appointments for a specific patient
- **Authentication**: Required
- **Query Parameters**:
  - `status`: Filter by appointment status (scheduled, confirmed, completed, cancelled, no_show)
  - `date_from`: Filter by date (format: YYYY-MM-DD)
  - `date_to`: Filter by date (format: YYYY-MM-DD)
- **Success Response**:
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 1,
      "user": {
        "id": 2,
        "username": "doctor1",
        "email": "doctor1@example.com",
        "first_name": "John",
        "last_name": "Smith"
      },
      "specialization": {
        "id": 1,
        "name": "Cardiology",
        "description": "Deals with heart disorders",
        "created_at": "2023-04-02T12:00:00Z"
      },
      "license_number": "MED12345",
      "years_of_experience": 10,
      "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
      "is_available": true,
      "created_at": "2023-04-02T12:30:00Z",
      "updated_at": "2023-04-02T12:30:00Z"
    },
    "patient": {
      "id": 1,
      "user": {
        "id": 3,
        "username": "patient1",
        "email": "patient1@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "date_of_birth": "1990-05-15",
      "gender": "F",
      "phone_number": "1234567890",
      "address": "123 Main St, City",
      "emergency_contact_name": "John Doe",
      "emergency_contact_number": "0987654321",
      "blood_group": "AB+",
      "allergies": "None",
      "medical_conditions": "None",
      "created_at": "2023-04-02T12:45:00Z",
      "updated_at": "2023-04-02T12:45:00Z"
    },
    "appointment_date": "2023-04-10",
    "start_time": "10:00:00",
    "end_time": "10:30:00",
    "status": "scheduled",
    "reason": "Routine checkup",
    "notes": "",
    "created_at": "2023-04-02T13:00:00Z",
    "updated_at": "2023-04-02T13:00:00Z"
  }
]
```

#### Get Patient's Medical Records
- **URL**: `/api/healthcare/patients/{id}/medical_records/`
- **Method**: `GET`
- **Description**: Get all medical records for a specific patient
- **Authentication**: Required
- **Success Response**:
```json
[
  {
    "id": 1,
    "patient": {
      "id": 1,
      "user": {
        "id": 3,
        "username": "patient1",
        "email": "patient1@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "date_of_birth": "1990-05-15",
      "gender": "F",
      "phone_number": "1234567890",
      "address": "123 Main St, City",
      "emergency_contact_name": "John Doe",
      "emergency_contact_number": "0987654321",
      "blood_group": "AB+",
      "allergies": "None",
      "medical_conditions": "None",
      "created_at": "2023-04-02T12:45:00Z",
      "updated_at": "2023-04-02T12:45:00Z"
    },
    "doctor": {
      "id": 1,
      "user": {
        "id": 2,
        "username": "doctor1",
        "email": "doctor1@example.com",
        "first_name": "John",
        "last_name": "Smith"
      },
      "specialization": {
        "id": 1,
        "name": "Cardiology",
        "description": "Deals with heart disorders",
        "created_at": "2023-04-02T12:00:00Z"
      },
      "license_number": "MED12345",
      "years_of_experience": 10,
      "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
      "is_available": true,
      "created_at": "2023-04-02T12:30:00Z",
      "updated_at": "2023-04-02T12:30:00Z"
    },
    "appointment": {
      "id": 1,
      "doctor": {
        "id": 1,
        "user": {
          "id": 2,
          "username": "doctor1",
          "email": "doctor1@example.com",
          "first_name": "John",
          "last_name": "Smith"
        },
        "specialization": {
          "id": 1,
          "name": "Cardiology",
          "description": "Deals with heart disorders",
          "created_at": "2023-04-02T12:00:00Z"
        },
        "license_number": "MED12345",
        "years_of_experience": 10,
        "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
        "is_available": true,
        "created_at": "2023-04-02T12:30:00Z",
        "updated_at": "2023-04-02T12:30:00Z"
      },
      "patient": {
        "id": 1,
        "user": {
          "id": 3,
          "username": "patient1",
          "email": "patient1@example.com",
          "first_name": "Jane",
          "last_name": "Doe"
        },
        "date_of_birth": "1990-05-15",
        "gender": "F",
        "phone_number": "1234567890",
        "address": "123 Main St, City",
        "emergency_contact_name": "John Doe",
        "emergency_contact_number": "0987654321",
        "blood_group": "AB+",
        "allergies": "None",
        "medical_conditions": "None",
        "created_at": "2023-04-02T12:45:00Z",
        "updated_at": "2023-04-02T12:45:00Z"
      },
      "appointment_date": "2023-04-10",
      "start_time": "10:00:00",
      "end_time": "10:30:00",
      "status": "completed",
      "reason": "Routine checkup",
      "notes": "",
      "created_at": "2023-04-02T13:00:00Z",
      "updated_at": "2023-04-10T10:35:00Z"
    },
    "visit_date": "2023-04-10",
    "symptoms": "Chest pain, shortness of breath",
    "diagnosis": "Stress-induced chest pain, no cardiac issues detected",
    "treatment": "Stress management techniques, follow-up in 3 months",
    "prescription": "No medications prescribed at this time",
    "notes": "Patient should monitor symptoms and return if they worsen",
    "follow_up_date": "2023-07-10",
    "created_at": "2023-04-10T10:45:00Z",
    "updated_at": "2023-04-10T10:45:00Z",
    "prescriptions": []
  }
]
```

### Appointments

#### List All Appointments
- **URL**: `/api/healthcare/appointments/`
- **Method**: `GET`
- **Description**: Get a list of all appointments (restricted based on user role)
- **Authentication**: Required
- **Success Response**:
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 1,
      "user": {
        "id": 2,
        "username": "doctor1",
        "email": "doctor1@example.com",
        "first_name": "John",
        "last_name": "Smith"
      },
      "specialization": {
        "id": 1,
        "name": "Cardiology",
        "description": "Deals with heart disorders",
        "created_at": "2023-04-02T12:00:00Z"
      },
      "license_number": "MED12345",
      "years_of_experience": 10,
      "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
      "is_available": true,
      "created_at": "2023-04-02T12:30:00Z",
      "updated_at": "2023-04-02T12:30:00Z"
    },
    "patient": {
      "id": 1,
      "user": {
        "id": 3,
        "username": "patient1",
        "email": "patient1@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "date_of_birth": "1990-05-15",
      "gender": "F",
      "phone_number": "1234567890",
      "address": "123 Main St, City",
      "emergency_contact_name": "John Doe",
      "emergency_contact_number": "0987654321",
      "blood_group": "AB+",
      "allergies": "None",
      "medical_conditions": "None",
      "created_at": "2023-04-02T12:45:00Z",
      "updated_at": "2023-04-02T12:45:00Z"
    },
    "appointment_date": "2023-04-10",
    "start_time": "10:00:00",
    "end_time": "10:30:00",
    "status": "scheduled",
    "reason": "Routine checkup",
    "notes": "",
    "created_at": "2023-04-02T13:00:00Z",
    "updated_at": "2023-04-02T13:00:00Z"
  }
]
```

#### Create New Appointment
- **URL**: `/api/healthcare/appointments/`
- **Method**: `POST`
- **Description**: Create a new appointment
- **Authentication**: Required
- **Request Body**:
```json
{
  "doctor_id": 1,
  "patient_id": 1,
  "appointment_date": "2023-04-15",
  "start_time": "14:00:00",
  "end_time": "14:30:00",
  "reason": "Follow-up appointment",
  "notes": "Patient requested late afternoon appointment"
}
```
- **Success Response**:
```json
{
  "id": 2,
  "doctor": {
    "id": 1,
    "user": {
      "id": 2,
      "username": "doctor1",
      "email": "doctor1@example.com",
      "first_name": "John",
      "last_name": "Smith"
    },
    "specialization": {
      "id": 1,
      "name": "Cardiology",
      "description": "Deals with heart disorders",
      "created_at": "2023-04-02T12:00:00Z"
    },
    "license_number": "MED12345",
    "years_of_experience": 10,
    "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
    "is_available": true,
    "created_at": "2023-04-02T12:30:00Z",
    "updated_at": "2023-04-02T12:30:00Z"
  },
  "patient": {
    "id": 1,
    "user": {
      "id": 3,
      "username": "patient1",
      "email": "patient1@example.com",
      "first_name": "Jane",
      "last_name": "Doe"
    },
    "date_of_birth": "1990-05-15",
    "gender": "F",
    "phone_number": "1234567890",
    "address": "123 Main St, City",
    "emergency_contact_name": "John Doe",
    "emergency_contact_number": "0987654321",
    "blood_group": "AB+",
    "allergies": "None",
    "medical_conditions": "None",
    "created_at": "2023-04-02T12:45:00Z",
    "updated_at": "2023-04-02T12:45:00Z"
  },
  "appointment_date": "2023-04-15",
  "start_time": "14:00:00",
  "end_time": "14:30:00",
  "status": "scheduled",
  "reason": "Follow-up appointment",
  "notes": "Patient requested late afternoon appointment",
  "created_at": "2023-04-03T09:00:00Z",
  "updated_at": "2023-04-03T09:00:00Z"
}
```

#### Get Upcoming Appointments
- **URL**: `/api/healthcare/appointments/upcoming/`
- **Method**: `GET`
- **Description**: Get all upcoming appointments for the authenticated user
- **Authentication**: Required
- **Success Response**:
```json
[
  {
    "id": 1,
    "doctor": {
      "id": 1,
      "user": {
        "id": 2,
        "username": "doctor1",
        "email": "doctor1@example.com",
        "first_name": "John",
        "last_name": "Smith"
      },
      "specialization": {
        "id": 1,
        "name": "Cardiology",
        "description": "Deals with heart disorders",
        "created_at": "2023-04-02T12:00:00Z"
      },
      "license_number": "MED12345",
      "years_of_experience": 10,
      "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
      "is_available": true,
      "created_at": "2023-04-02T12:30:00Z",
      "updated_at": "2023-04-02T12:30:00Z"
    },
    "patient": {
      "id": 1,
      "user": {
        "id": 3,
        "username": "patient1",
        "email": "patient1@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "date_of_birth": "1990-05-15",
      "gender": "F",
      "phone_number": "1234567890",
      "address": "123 Main St, City",
      "emergency_contact_name": "John Doe",
      "emergency_contact_number": "0987654321",
      "blood_group": "AB+",
      "allergies": "None",
      "medical_conditions": "None",
      "created_at": "2023-04-02T12:45:00Z",
      "updated_at": "2023-04-02T12:45:00Z"
    },
    "appointment_date": "2023-04-10",
    "start_time": "10:00:00",
    "end_time": "10:30:00",
    "status": "scheduled",
    "reason": "Routine checkup",
    "notes": "",
    "created_at": "2023-04-02T13:00:00Z",
    "updated_at": "2023-04-02T13:00:00Z"
  }
]
```

#### Cancel Appointment
- **URL**: `/api/healthcare/appointments/{id}/cancel/`
- **Method**: `POST`
- **Description**: Cancel an existing appointment
- **Authentication**: Required
- **Success Response**:
```json
{
  "id": 1,
  "doctor": {
    "id": 1,
    "user": {
      "id": 2,
      "username": "doctor1",
      "email": "doctor1@example.com",
      "first_name": "John",
      "last_name": "Smith"
    },
    "specialization": {
      "id": 1,
      "name": "Cardiology",
      "description": "Deals with heart disorders",
      "created_at": "2023-04-02T12:00:00Z"
    },
    "license_number": "MED12345",
    "years_of_experience": 10,
    "bio": "Dr. Smith is a cardiologist with 10 years of experience.",
    "is_available": true,
    "created_at": "2023-04-02T12:30:00Z",
    "updated_at": "2023-04-02T12:30:00Z"
  },
  "patient": {
    "id": 1,
    "user": {
      "id": 3,
      "username": "patient1",
      "email": "patient1@example.com",
      "first_name": "Jane",
      "last_name": "Doe"
    },
    "date_of_birth": "1990-05-15",
    "gender": "F",
    "phone_number": "1234567890",
    "address": "123 Main St, City",
    "emergency_contact_name": "John Doe",
    "emergency_contact_number": "0987654321",
    "blood_group": "AB+",
    "allergies": "None",
    "medical_conditions": "None",
    "created_at": "2023-04-02T12:45:00Z",
    "updated_at": "2023-04-02T12:45:00Z"
  },
  "appointment_date": "2023-04-10",
  "start_time": "10:00:00",
  "end_time": "10:30:00",
  "status": "cancelled",
  "reason": "Routine checkup",
  "notes": "",
  "created_at": "2023-04-02T13:00:00Z",
  "updated_at": "2023-04-03T10:00:00Z"
}
``` 