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
  dosage?: string;
  quantity_to_cart?: number;
  discountPrice?: number;
  sideEffects?: string;
  reviews?: any[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
  brandName?: string;
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
  availableSlots?: Record<string, string[]>;
  created_at: string;
  updated_at: string | null;
  phone?: string;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available?: boolean;
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
  id: string | number;
  doctor_id: string | number;
  user_id: string;
  date: string;
  time_slot: TimeSlot | any;
  status: string;
  created_at: string;
  symptoms?: string;
  notes?: string | null;
  doctor: {
    id: string | number;
    name: string;
    specialty: string;
    experience: string | number;
    rating: number;
    image: string;
    phone?: string;
  } | any;
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
  } | any;
}

export interface Order {
  id: string | number;
  created_at: string;
  updated_at?: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  delivery_address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    full_name?: string;
    address_line1?: string;
    address_line2?: string;
    postal_code?: string;
    phone?: string;
  } | any;
  items: OrderItem[] | any[];
  profiles?: {
    full_name: string;
    email: string;
  } | any;
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
