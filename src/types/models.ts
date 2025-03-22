
import { Json } from './supabase';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    full_name?: string;
  };
}

export interface Medicine {
  id: number;
  name: string;
  brand: string;
  price: number;
  discount_price: number;
  rating: number;
  category: string;
  quantity: string;
  image: string;
  description: string | null;
  usage: string | null;
  side_effects: string | null;
  contraindications: string | null;
  stock: number | null;
  prescription_required?: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  brandName?: string; // Added for compatibility with existing code
  stock?: number;
  prescription_required?: boolean;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  review_count: number;
  consultation_fee: number;
  available_today: boolean;
  available_for_video: boolean;
  available_for_in_clinic: boolean;
  next_available: string;
  image: string;
  hospital: string;
  location: string;
  education: string;
  languages: string[];
  available_slots: Record<string, string[]>;
  created_at: string;
  updated_at: string | null;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

export interface AppointmentWithDetails {
  id: number;
  doctor_id: number;
  user_id: string;
  date: string;
  time: string;
  status: string;
  symptoms: string;
  patientName: string;
  patientAge: string;
  patientPhone: string;
  consultationType: string;
  doctorName: string;
  created_at: string;
  notes: string | null;
  time_slot: TimeSlot;
  doctor: {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
    phone: string;
  };
}

export interface Appointment {
  id: number;
  doctor_id: number;
  user_id: string;
  date: string;
  time_slot: TimeSlot;
  status: string;
  created_at: string;
  symptoms: string;
  notes: string | null;
  doctor: {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
    phone: string;
  };
}

export interface OrderItem {
  id: number;
  medicine_id: number;
  order_id: number;
  quantity: number;
  price: number;
  medicine: {
    name: string;
    image: string;
    description?: string;
    prescription_required?: boolean;
  };
}

export interface Order {
  id: number;
  created_at: string;
  updated_at?: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  profiles?: {
    full_name: string;
    email: string;
  };
  items_count?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DeliveryInfo {
  address: Address;
  instructions?: string;
}
