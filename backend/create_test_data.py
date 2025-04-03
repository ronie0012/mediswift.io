import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediswift_backend.settings')
django.setup()

from django.contrib.auth.models import User
from healthcare.models import Specialization, Doctor

# Create specializations
specializations = [
    {'name': 'Cardiology', 'description': 'Deals with disorders of the heart and blood vessels'},
    {'name': 'Dermatology', 'description': 'Focuses on diseases of the skin, hair, and nails'},
    {'name': 'Neurology', 'description': 'Treats disorders of the nervous system'},
    {'name': 'Pediatrics', 'description': 'Provides medical care for infants, children, and adolescents'},
    {'name': 'Orthopedics', 'description': 'Focuses on the musculoskeletal system'},
]

# Create specialization instances
created_specializations = {}
for spec in specializations:
    specialization, created = Specialization.objects.get_or_create(
        name=spec['name'],
        defaults={'description': spec['description']}
    )
    created_specializations[spec['name']] = specialization
    if created:
        print(f"Created specialization: {specialization.name}")
    else:
        print(f"Specialization {specialization.name} already exists")

# Create doctors
doctors = [
    {
        'username': 'dr_smith',
        'email': 'dr.smith@mediswift.io',
        'password': 'password123',
        'first_name': 'John',
        'last_name': 'Smith',
        'specialization': 'Cardiology',
        'license_number': 'CAR12345',
        'years_of_experience': 15,
        'bio': 'Dr. Smith is a renowned cardiologist with extensive experience in treating heart diseases.'
    },
    {
        'username': 'dr_johnson',
        'email': 'dr.johnson@mediswift.io',
        'password': 'password123',
        'first_name': 'Emily',
        'last_name': 'Johnson',
        'specialization': 'Dermatology',
        'license_number': 'DER67890',
        'years_of_experience': 8,
        'bio': 'Dr. Johnson specializes in treating various skin conditions and cosmetic dermatology.'
    },
    {
        'username': 'dr_patel',
        'email': 'dr.patel@mediswift.io',
        'password': 'password123',
        'first_name': 'Ravi',
        'last_name': 'Patel',
        'specialization': 'Neurology',
        'license_number': 'NEU54321',
        'years_of_experience': 12,
        'bio': 'Dr. Patel is an expert in diagnosing and treating neurological disorders.'
    },
    {
        'username': 'dr_martinez',
        'email': 'dr.martinez@mediswift.io',
        'password': 'password123',
        'first_name': 'Sofia',
        'last_name': 'Martinez',
        'specialization': 'Pediatrics',
        'license_number': 'PED13579',
        'years_of_experience': 10,
        'bio': 'Dr. Martinez has a passion for providing comprehensive care for children of all ages.'
    },
    {
        'username': 'dr_wilson',
        'email': 'dr.wilson@mediswift.io',
        'password': 'password123',
        'first_name': 'David',
        'last_name': 'Wilson',
        'specialization': 'Orthopedics',
        'license_number': 'ORT24680',
        'years_of_experience': 17,
        'bio': 'Dr. Wilson specializes in joint replacement surgery and sports medicine.'
    }
]

# Create doctor instances
for doc in doctors:
    # Check if user already exists
    if not User.objects.filter(username=doc['username']).exists():
        # Create user
        user = User.objects.create_user(
            username=doc['username'],
            email=doc['email'],
            password=doc['password'],
            first_name=doc['first_name'],
            last_name=doc['last_name']
        )
        
        # Create doctor profile
        doctor = Doctor.objects.create(
            user=user,
            specialization=created_specializations[doc['specialization']],
            license_number=doc['license_number'],
            years_of_experience=doc['years_of_experience'],
            bio=doc['bio'],
            is_available=True
        )
        print(f"Created doctor: Dr. {user.first_name} {user.last_name}")
    else:
        print(f"Doctor with username {doc['username']} already exists")

print("Test data creation completed!") 