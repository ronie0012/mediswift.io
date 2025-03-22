-- Create tables for MediSwift application

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table that extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  discount_price NUMERIC(10, 2) NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 0,
  category TEXT NOT NULL,
  quantity TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT,
  usage TEXT,
  side_effects TEXT,
  contraindications TEXT,
  stock INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience TEXT NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  consultation_fee NUMERIC(10, 2) NOT NULL,
  available_today BOOLEAN DEFAULT false,
  available_for_video BOOLEAN DEFAULT false,
  available_for_in_clinic BOOLEAN DEFAULT false,
  next_available TEXT,
  image TEXT NOT NULL,
  hospital TEXT NOT NULL,
  location TEXT NOT NULL,
  education TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  available_slots JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id INTEGER NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  type TEXT NOT NULL CHECK (type IN ('video', 'in_clinic')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_address JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medicine_id INTEGER REFERENCES public.medicines(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES public.doctors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT review_target_check CHECK (
    (medicine_id IS NOT NULL AND doctor_id IS NULL) OR
    (medicine_id IS NULL AND doctor_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX idx_medicines_category ON public.medicines(category);
CREATE INDEX idx_doctors_specialty ON public.doctors(specialty);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_reviews_medicine_id ON public.reviews(medicine_id);
CREATE INDEX idx_reviews_doctor_id ON public.reviews(doctor_id);

-- Row Level Security Policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Medicines table policies
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medicines are viewable by everyone"
  ON public.medicines FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert/update/delete medicines"
  ON public.medicines FOR ALL
  USING (auth.jwt() ? (auth.jwt()->>'role')::text = 'admin' : false);

-- Doctors table policies
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors are viewable by everyone"
  ON public.doctors FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert/update/delete doctors"
  ON public.doctors FOR ALL
  USING (auth.jwt() ? (auth.jwt()->>'role')::text = 'admin' : false);

-- Appointments table policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  USING (auth.jwt() ? (auth.jwt()->>'role')::text = 'admin' : false);

-- Orders table policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (auth.jwt() ? (auth.jwt()->>'role')::text = 'admin' : false);

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (auth.jwt() ? (auth.jwt()->>'role')::text = 'admin' : false);

-- Order items table policies
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (auth.jwt() ? (auth.jwt()->>'role')::text = 'admin' : false);

-- Reviews table policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create order and order items in a transaction
CREATE OR REPLACE FUNCTION create_order_transaction(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_status TEXT,
  p_delivery_address JSONB,
  p_items JSONB
) RETURNS public.orders AS $$
DECLARE
  v_order public.orders;
  v_item JSONB;
BEGIN
  -- Insert the order
  INSERT INTO public.orders (user_id, total_amount, status, delivery_address, created_at)
  VALUES (p_user_id, p_total_amount, p_status, p_delivery_address, NOW())
  RETURNING * INTO v_order;
  
  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (order_id, medicine_id, quantity, price, created_at)
    VALUES (
      v_order.id,
      (v_item->>'medicine_id')::INTEGER,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::NUMERIC,
      NOW()
    );
  END LOOP;
  
  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 