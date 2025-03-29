-- Seed data for the MediSwift database

-- Insert admin user
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
VALUES (
    'e9c1d9e2-5f7d-4b3b-9b0c-7c7e9c9d4e6a',
    'admin@mediswift.io',
    NOW(),
    '{"first_name": "Admin", "last_name": "User"}'
)
ON CONFLICT (id) DO NOTHING;

-- Update admin profile
UPDATE public.profiles
SET 
    role = 'admin',
    is_verified = TRUE,
    phone = '+1234567890',
    date_of_birth = '1990-01-01',
    gender = 'Other',
    address = '123 Admin Street',
    city = 'San Francisco',
    state = 'CA',
    country = 'USA',
    postal_code = '94105'
WHERE id = 'e9c1d9e2-5f7d-4b3b-9b0c-7c7e9c9d4e6a';

-- Insert doctor users
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
VALUES 
    ('d1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h', 'dr.smith@mediswift.io', NOW(), '{"first_name": "John", "last_name": "Smith"}'),
    ('h7g6f5e4-d3c2-b1a0-9b8c-7d6e5f4g3h2i', 'dr.patel@mediswift.io', NOW(), '{"first_name": "Priya", "last_name": "Patel"}'),
    ('i9h8g7f6-e5d4-c3b2-a1b2-c3d4e5f6g7h8', 'dr.rodriguez@mediswift.io', NOW(), '{"first_name": "Carlos", "last_name": "Rodriguez"}')
ON CONFLICT (id) DO NOTHING;

-- Update doctor profiles
UPDATE public.profiles
SET 
    role = 'doctor',
    is_verified = TRUE,
    is_active = TRUE,
    phone = '+1987654321',
    date_of_birth = '1985-03-15',
    gender = 'Male',
    address = '456 Medical Drive',
    city = 'New York',
    state = 'NY',
    country = 'USA',
    postal_code = '10001'
WHERE id = 'd1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h';

UPDATE public.profiles
SET 
    role = 'doctor',
    is_verified = TRUE,
    is_active = TRUE,
    phone = '+1876543210',
    date_of_birth = '1982-07-22',
    gender = 'Female',
    address = '789 Health Avenue',
    city = 'Chicago',
    state = 'IL',
    country = 'USA',
    postal_code = '60601'
WHERE id = 'h7g6f5e4-d3c2-b1a0-9b8c-7d6e5f4g3h2i';

UPDATE public.profiles
SET 
    role = 'doctor',
    is_verified = TRUE,
    is_active = TRUE,
    phone = '+1765432109',
    date_of_birth = '1978-11-30',
    gender = 'Male',
    address = '321 Wellness Blvd',
    city = 'Los Angeles',
    state = 'CA',
    country = 'USA',
    postal_code = '90001'
WHERE id = 'i9h8g7f6-e5d4-c3b2-a1b2-c3d4e5f6g7h8';

-- Insert doctor details
INSERT INTO public.doctors (
    id, 
    specialty, 
    license_number, 
    years_of_experience, 
    education, 
    certifications, 
    hospital_affiliation, 
    bio, 
    consultation_fee, 
    available_days, 
    available_hours, 
    is_verified, 
    is_available
)
VALUES
    (
        'd1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h',
        'Cardiology',
        'MD12345',
        15,
        ARRAY['M.D. from Harvard Medical School', 'Residency at Mayo Clinic'],
        ARRAY['American Board of Internal Medicine', 'American College of Cardiology'],
        'New York-Presbyterian Hospital',
        'Dr. Smith is a board-certified cardiologist with over 15 years of experience in diagnosing and treating heart conditions.',
        150.00,
        ARRAY[1, 2, 3, 4, 5], -- Monday to Friday
        '{"start": "09:00", "end": "17:00"}',
        TRUE,
        TRUE
    ),
    (
        'h7g6f5e4-d3c2-b1a0-9b8c-7d6e5f4g3h2i',
        'Pediatrics',
        'MD67890',
        12,
        ARRAY['M.D. from Johns Hopkins University', 'Pediatric Residency at Children''s Hospital of Philadelphia'],
        ARRAY['American Board of Pediatrics', 'American Academy of Pediatrics'],
        'Northwestern Memorial Hospital',
        'Dr. Patel is a compassionate pediatrician dedicated to providing comprehensive care for children from birth through adolescence.',
        120.00,
        ARRAY[1, 2, 3, 4], -- Monday to Thursday
        '{"start": "10:00", "end": "18:00"}',
        TRUE,
        TRUE
    ),
    (
        'i9h8g7f6-e5d4-c3b2-a1b2-c3d4e5f6g7h8',
        'Orthopedics',
        'MD54321',
        20,
        ARRAY['M.D. from Stanford University', 'Orthopedic Surgery Residency at UCLA Medical Center'],
        ARRAY['American Board of Orthopedic Surgery', 'American Academy of Orthopedic Surgeons'],
        'Cedars-Sinai Medical Center',
        'Dr. Rodriguez specializes in sports medicine and joint replacement surgery with 20 years of experience treating professional athletes.',
        180.00,
        ARRAY[2, 3, 5], -- Tuesday, Wednesday, Friday
        '{"start": "08:00", "end": "16:00"}',
        TRUE,
        TRUE
    );

-- Insert patient users
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
VALUES 
    ('p1a2t3i4-e5n6t7-a1b2-c3d4-p1a2t3i4e5n6t7', 'patient1@example.com', NOW(), '{"first_name": "Michael", "last_name": "Johnson"}'),
    ('p2a3t4i5-e6n7t8-b2c3-d4e5-p2a3t4i5e6n7t8', 'patient2@example.com', NOW(), '{"first_name": "Sarah", "last_name": "Williams"}')
ON CONFLICT (id) DO NOTHING;

-- Update patient profiles
UPDATE public.profiles
SET 
    role = 'patient',
    is_verified = TRUE,
    is_active = TRUE,
    phone = '+1122334455',
    date_of_birth = '1990-05-12',
    gender = 'Male',
    address = '123 Patient Street',
    city = 'Dallas',
    state = 'TX',
    country = 'USA',
    postal_code = '75201'
WHERE id = 'p1a2t3i4-e5n6t7-a1b2-c3d4-p1a2t3i4e5n6t7';

UPDATE public.profiles
SET 
    role = 'patient',
    is_verified = TRUE,
    is_active = TRUE,
    phone = '+1567890123',
    date_of_birth = '1995-09-28',
    gender = 'Female',
    address = '456 Patient Avenue',
    city = 'Miami',
    state = 'FL',
    country = 'USA',
    postal_code = '33101'
WHERE id = 'p2a3t4i5-e6n7t8-b2c3-d4e5-p2a3t4i5e6n7t8';

-- Insert medical records
INSERT INTO public.medical_records (
    id,
    patient_id,
    doctor_id,
    record_date,
    diagnosis,
    symptoms,
    treatment,
    notes,
    is_private
)
VALUES
    (
        'mr1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'p1a2t3i4-e5n6t7-a1b2-c3d4-p1a2t3i4e5n6t7',
        'd1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h',
        '2023-03-15',
        'Hypertension',
        ARRAY['Headache', 'Dizziness', 'Shortness of breath'],
        'Prescribed lisinopril 10mg daily, recommended diet modifications and regular exercise.',
        'Patient needs to return for follow-up in 3 months.',
        TRUE
    ),
    (
        'mr2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
        'p2a3t4i5-e6n7t8-b2c3-d4e5-p2a3t4i5e6n7t8',
        'h7g6f5e4-d3c2-b1a0-9b8c-7d6e5f4g3h2i',
        '2023-04-22',
        'Seasonal allergies',
        ARRAY['Runny nose', 'Sneezing', 'Itchy eyes'],
        'Recommended over-the-counter antihistamine and nasal spray.',
        'Symptoms seem to be worse during spring season.',
        TRUE
    );

-- Insert pharmacy inventory items
INSERT INTO public.pharmacy_inventory (
    id,
    medication_name,
    generic_name,
    brand_name,
    category,
    description,
    dosage_form,
    strength,
    manufacturer,
    stock_quantity,
    unit_price,
    prescription_required,
    image_url
)
VALUES
    (
        'med1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'Lisinopril',
        'Lisinopril',
        'Prinivil, Zestril',
        'Antihypertensive',
        'Used to treat high blood pressure and heart failure.',
        'tablet',
        '10mg',
        'Generic Pharmaceutical',
        100,
        15.99,
        TRUE,
        'https://example.com/medications/lisinopril.jpg'
    ),
    (
        'med2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
        'Loratadine',
        'Loratadine',
        'Claritin',
        'Antihistamine',
        'Used to treat allergies and hay fever symptoms.',
        'tablet',
        '10mg',
        'Bayer',
        150,
        8.99,
        FALSE,
        'https://example.com/medications/loratadine.jpg'
    ),
    (
        'med3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8',
        'Amoxicillin',
        'Amoxicillin',
        'Amoxil',
        'Antibiotic',
        'Used to treat bacterial infections.',
        'capsule',
        '500mg',
        'Pfizer',
        80,
        12.50,
        TRUE,
        'https://example.com/medications/amoxicillin.jpg'
    ),
    (
        'med4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9',
        'Ibuprofen',
        'Ibuprofen',
        'Advil, Motrin',
        'NSAID',
        'Used to relieve pain, reduce inflammation, and lower fever.',
        'tablet',
        '200mg',
        'Johnson & Johnson',
        200,
        6.99,
        FALSE,
        'https://example.com/medications/ibuprofen.jpg'
    );

-- Insert ambulance services
INSERT INTO public.ambulance_services (
    id,
    name,
    contact_number,
    email,
    address,
    city,
    state,
    country,
    postal_code,
    total_ambulances,
    available_ambulances,
    base_fare,
    price_per_km,
    is_active
)
VALUES
    (
        'amb1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'MediSwift Emergency Response',
        '+18001234567',
        'emergency@mediswift.io',
        '100 Emergency Lane',
        'New York',
        'NY',
        'USA',
        '10001',
        10,
        8,
        50.00,
        2.50,
        TRUE
    ),
    (
        'amb2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
        'Rapid Medical Transport',
        '+18009876543',
        'dispatch@rapidmedical.com',
        '200 Response Drive',
        'Los Angeles',
        'CA',
        'USA',
        '90001',
        15,
        12,
        45.00,
        2.25,
        TRUE
    );

-- Insert one sample appointment
INSERT INTO public.appointments (
    id,
    patient_id,
    doctor_id,
    appointment_date,
    start_time,
    end_time,
    status,
    type,
    reason,
    notes
)
VALUES
    (
        'apt1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'p1a2t3i4-e5n6t7-a1b2-c3d4-p1a2t3i4e5n6t7',
        'd1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h',
        '2023-06-15',
        '10:00:00',
        '10:30:00',
        'scheduled',
        'video',
        'Follow-up for blood pressure',
        'Patient needs to have recent blood pressure readings available'
    );

-- Create notifications for users
INSERT INTO public.notifications (
    id,
    user_id,
    title,
    message,
    notification_type,
    related_id
)
VALUES
    (
        'not1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'p1a2t3i4-e5n6t7-a1b2-c3d4-p1a2t3i4e5n6t7',
        'Appointment Reminder',
        'You have an appointment with Dr. Smith tomorrow at 10:00 AM.',
        'appointment',
        'apt1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6'
    ),
    (
        'not2b3c4d5-e6f7-g8h9-i0j1-k2l3m4n5o6p7',
        'd1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h',
        'New Appointment',
        'You have a new appointment scheduled with Michael Johnson on June 15, 2023 at 10:00 AM.',
        'appointment',
        'apt1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6'
    );

-- Insert one sample prescription
INSERT INTO public.prescriptions (
    id,
    patient_id,
    doctor_id,
    appointment_id,
    issue_date,
    expiry_date,
    diagnosis,
    status,
    notes
)
VALUES
    (
        'prs1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'p1a2t3i4-e5n6t7-a1b2-c3d4-p1a2t3i4e5n6t7',
        'd1c2d3e4-5f6d-7b8c-9b0a-1c2d3e4f5g6h',
        'apt1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        '2023-06-15',
        '2023-12-15',
        'Hypertension',
        'active',
        'Continue monitoring blood pressure'
    );

-- Insert prescription items
INSERT INTO public.prescription_items (
    id,
    prescription_id,
    medication_name,
    dosage,
    frequency,
    duration,
    instructions,
    quantity,
    refills
)
VALUES
    (
        'pitem1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'prs1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        'Lisinopril',
        '10mg',
        'Once daily',
        '6 months',
        'Take in the morning with water.',
        30,
        5
    ); 