export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          role: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service'
          is_verified: boolean
          is_active: boolean
        }
        Insert: {
          id: string
          updated_at?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          role?: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service'
          is_verified?: boolean
          is_active?: boolean
        }
        Update: {
          id?: string
          updated_at?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          role?: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service'
          is_verified?: boolean
          is_active?: boolean
        }
      }
      doctors: {
        Row: {
          id: string
          specialty: string
          license_number: string
          years_of_experience: number | null
          education: string[] | null
          certifications: string[] | null
          hospital_affiliation: string | null
          bio: string | null
          consultation_fee: number
          available_days: number[]
          available_hours: Json
          average_rating: number
          total_reviews: number
          is_verified: boolean
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          specialty: string
          license_number: string
          years_of_experience?: number | null
          education?: string[] | null
          certifications?: string[] | null
          hospital_affiliation?: string | null
          bio?: string | null
          consultation_fee?: number
          available_days?: number[]
          available_hours?: Json
          average_rating?: number
          total_reviews?: number
          is_verified?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          specialty?: string
          license_number?: string
          years_of_experience?: number | null
          education?: string[] | null
          certifications?: string[] | null
          hospital_affiliation?: string | null
          bio?: string | null
          consultation_fee?: number
          available_days?: number[]
          available_hours?: Json
          average_rating?: number
          total_reviews?: number
          is_verified?: boolean
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string | null
          record_date: string
          diagnosis: string | null
          symptoms: string[] | null
          treatment: string | null
          notes: string | null
          attachments: string[] | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id?: string | null
          record_date?: string
          diagnosis?: string | null
          symptoms?: string[] | null
          treatment?: string | null
          notes?: string | null
          attachments?: string[] | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string | null
          record_date?: string
          diagnosis?: string | null
          symptoms?: string[] | null
          treatment?: string | null
          notes?: string | null
          attachments?: string[] | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          type: string
          reason: string | null
          notes: string | null
          payment_id: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          amount_paid: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          start_time: string
          end_time: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          type: string
          reason?: string | null
          notes?: string | null
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          amount_paid?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          type?: string
          reason?: string | null
          notes?: string | null
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          amount_paid?: number
          created_at?: string
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_id: string | null
          issue_date: string
          expiry_date: string | null
          diagnosis: string | null
          status: 'active' | 'filled' | 'expired'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_id?: string | null
          issue_date?: string
          expiry_date?: string | null
          diagnosis?: string | null
          status?: 'active' | 'filled' | 'expired'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_id?: string | null
          issue_date?: string
          expiry_date?: string | null
          diagnosis?: string | null
          status?: 'active' | 'filled' | 'expired'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      prescription_items: {
        Row: {
          id: string
          prescription_id: string
          medication_name: string
          dosage: string
          frequency: string
          duration: string
          instructions: string | null
          quantity: number
          refills: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prescription_id: string
          medication_name: string
          dosage: string
          frequency: string
          duration: string
          instructions?: string | null
          quantity: number
          refills?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prescription_id?: string
          medication_name?: string
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string | null
          quantity?: number
          refills?: number
          created_at?: string
          updated_at?: string
        }
      }
      pharmacy_inventory: {
        Row: {
          id: string
          medication_name: string
          generic_name: string | null
          brand_name: string | null
          category: string | null
          description: string | null
          dosage_form: string | null
          strength: string | null
          manufacturer: string | null
          stock_quantity: number
          unit_price: number
          prescription_required: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          medication_name: string
          generic_name?: string | null
          brand_name?: string | null
          category?: string | null
          description?: string | null
          dosage_form?: string | null
          strength?: string | null
          manufacturer?: string | null
          stock_quantity: number
          unit_price: number
          prescription_required?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          medication_name?: string
          generic_name?: string | null
          brand_name?: string | null
          category?: string | null
          description?: string | null
          dosage_form?: string | null
          strength?: string | null
          manufacturer?: string | null
          stock_quantity?: number
          unit_price?: number
          prescription_required?: boolean
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medicine_orders: {
        Row: {
          id: string
          patient_id: string
          prescription_id: string | null
          order_date: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          delivery_address: string
          phone: string
          payment_id: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          prescription_id?: string | null
          order_date?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          delivery_address: string
          phone: string
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          prescription_id?: string | null
          order_date?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          delivery_address?: string
          phone?: string
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          medication_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          medication_id: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          medication_id?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
          updated_at?: string
        }
      }
      ambulance_services: {
        Row: {
          id: string
          name: string
          contact_number: string
          email: string | null
          address: string | null
          city: string
          state: string
          country: string
          postal_code: string | null
          total_ambulances: number
          available_ambulances: number
          base_fare: number
          price_per_km: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_number: string
          email?: string | null
          address?: string | null
          city: string
          state: string
          country: string
          postal_code?: string | null
          total_ambulances?: number
          available_ambulances?: number
          base_fare?: number
          price_per_km?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_number?: string
          email?: string | null
          address?: string | null
          city?: string
          state?: string
          country?: string
          postal_code?: string | null
          total_ambulances?: number
          available_ambulances?: number
          base_fare?: number
          price_per_km?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ambulance_requests: {
        Row: {
          id: string
          patient_id: string
          service_id: string
          pickup_location: string
          destination: string
          pickup_latitude: number | null
          pickup_longitude: number | null
          destination_latitude: number | null
          destination_longitude: number | null
          request_time: string
          status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled'
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          patient_condition: string | null
          special_requirements: string | null
          payment_id: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          estimated_fare: number | null
          actual_fare: number | null
          distance_km: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          service_id: string
          pickup_location: string
          destination: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          destination_latitude?: number | null
          destination_longitude?: number | null
          request_time?: string
          status?: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled'
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          patient_condition?: string | null
          special_requirements?: string | null
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          estimated_fare?: number | null
          actual_fare?: number | null
          distance_km?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          service_id?: string
          pickup_location?: string
          destination?: string
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          destination_latitude?: number | null
          destination_longitude?: number | null
          request_time?: string
          status?: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled'
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          patient_condition?: string | null
          special_requirements?: string | null
          payment_id?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          estimated_fare?: number | null
          actual_fare?: number | null
          distance_km?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          doctor_id: string | null
          appointment_id: string | null
          order_id: string | null
          ambulance_request_id: string | null
          rating: number
          review_text: string | null
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          doctor_id?: string | null
          appointment_id?: string | null
          order_id?: string | null
          ambulance_request_id?: string | null
          rating: number
          review_text?: string | null
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          doctor_id?: string | null
          appointment_id?: string | null
          order_id?: string | null
          ambulance_request_id?: string | null
          rating?: number
          review_text?: string | null
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          notification_type: string
          related_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          is_read?: boolean
          notification_type: string
          related_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          is_read?: boolean
          notification_type?: string
          related_id?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          appointment_id: string | null
          order_id: string | null
          ambulance_request_id: string | null
          amount: number
          currency: string
          payment_method: string
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id: string | null
          payment_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          appointment_id?: string | null
          order_id?: string | null
          ambulance_request_id?: string | null
          amount: number
          currency?: string
          payment_method: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id?: string | null
          payment_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          appointment_id?: string | null
          order_id?: string | null
          ambulance_request_id?: string | null
          amount?: number
          currency?: string
          payment_method?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded'
          transaction_id?: string | null
          payment_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'patient' | 'doctor' | 'admin' | 'pharmacy' | 'ambulance_service'
      appointment_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
      prescription_status: 'active' | 'filled' | 'expired'
      order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      ambulance_request_status: 'pending' | 'accepted' | 'en_route' | 'arrived' | 'completed' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
  }
} 