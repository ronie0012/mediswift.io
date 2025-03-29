-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- Create enum types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'pharmacy', 'ambulance_service');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE prescription_status AS ENUM ('active', 'filled', 'expired');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE ambulance_request_status AS ENUM ('pending', 'accepted', 'en_route', 'arrived', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "anon".jwt_secret TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Enable Row Level Security (RLS) on necessary tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,
    role user_role DEFAULT 'patient'::user_role,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create table for doctor profiles
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    years_of_experience INTEGER,
    education TEXT[],
    certifications TEXT[],
    hospital_affiliation TEXT,
    bio TEXT,
    consultation_fee DECIMAL(10, 2) DEFAULT 0,
    available_days INTEGER[], -- 0-6 for Sun-Sat
    available_hours JSONB, -- Format: {"start": "09:00", "end": "17:00"}
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for medical records
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT,
    symptoms TEXT[],
    treatment TEXT,
    notes TEXT,
    attachments TEXT[], -- Array of storage URLs
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status DEFAULT 'scheduled'::appointment_status,
    type TEXT NOT NULL, -- 'in-person', 'video', 'phone'
    reason TEXT,
    notes TEXT,
    payment_id UUID,
    payment_status payment_status DEFAULT 'pending'::payment_status,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    diagnosis TEXT,
    status prescription_status DEFAULT 'active'::prescription_status,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for prescription items
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    quantity INTEGER NOT NULL,
    refills INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for pharmacy inventory
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_name TEXT NOT NULL,
    generic_name TEXT,
    brand_name TEXT,
    category TEXT,
    description TEXT,
    dosage_form TEXT, -- tablet, capsule, liquid, etc.
    strength TEXT,
    manufacturer TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL,
    prescription_required BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(medication_name, dosage_form, strength)
);

-- Create table for medicine orders
CREATE TABLE IF NOT EXISTS public.medicine_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status order_status DEFAULT 'pending'::order_status,
    delivery_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    payment_id UUID,
    payment_status payment_status DEFAULT 'pending'::payment_status,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES medicine_orders(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES pharmacy_inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for ambulance services
CREATE TABLE IF NOT EXISTS public.ambulance_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL,
    postal_code TEXT,
    total_ambulances INTEGER DEFAULT 0,
    available_ambulances INTEGER DEFAULT 0,
    base_fare DECIMAL(10, 2) DEFAULT 0,
    price_per_km DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for ambulance requests
CREATE TABLE IF NOT EXISTS public.ambulance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES ambulance_services(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 7),
    pickup_longitude DECIMAL(10, 7),
    destination_latitude DECIMAL(10, 7),
    destination_longitude DECIMAL(10, 7),
    request_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status ambulance_request_status DEFAULT 'pending'::ambulance_request_status,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    patient_condition TEXT,
    special_requirements TEXT,
    payment_id UUID,
    payment_status payment_status DEFAULT 'pending'::payment_status,
    estimated_fare DECIMAL(10, 2),
    actual_fare DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for reviews and ratings
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    order_id UUID REFERENCES medicine_orders(id) ON DELETE SET NULL,
    ambulance_request_id UUID REFERENCES ambulance_requests(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (doctor_id IS NOT NULL AND appointment_id IS NOT NULL AND order_id IS NULL AND ambulance_request_id IS NULL) OR
        (doctor_id IS NULL AND appointment_id IS NULL AND order_id IS NOT NULL AND ambulance_request_id IS NULL) OR
        (doctor_id IS NULL AND appointment_id IS NULL AND order_id IS NULL AND ambulance_request_id IS NOT NULL)
    )
);

-- Create table for notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type TEXT NOT NULL,
    related_id UUID, -- Can be appointment_id, order_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    order_id UUID REFERENCES medicine_orders(id) ON DELETE SET NULL,
    ambulance_request_id UUID REFERENCES ambulance_requests(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending'::payment_status,
    transaction_id TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (appointment_id IS NOT NULL AND order_id IS NULL AND ambulance_request_id IS NULL) OR
        (appointment_id IS NULL AND order_id IS NOT NULL AND ambulance_request_id IS NULL) OR
        (appointment_id IS NULL AND order_id IS NULL AND ambulance_request_id IS NOT NULL)
    )
);

-- Add row level security (RLS) policies
-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Similarly add RLS policies for other tables
-- This is a basic setup and will need to be expanded for a complete solution

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 