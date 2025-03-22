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
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          phone: string | null
          created_at: string
          updated_at: string | null
          address: Json | null
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          phone?: string | null
          created_at?: string
          updated_at?: string | null
          address?: Json | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          phone?: string | null
          created_at?: string
          updated_at?: string | null
          address?: Json | null
        }
      }
      medicines: {
        Row: {
          id: number
          name: string
          brand: string
          price: number
          discount_price: number
          rating: number
          category: string
          quantity: string
          image: string
          description: string | null
          usage: string | null
          side_effects: string | null
          contraindications: string | null
          stock: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          brand: string
          price: number
          discount_price: number
          rating: number
          category: string
          quantity: string
          image: string
          description?: string | null
          usage?: string | null
          side_effects?: string | null
          contraindications?: string | null
          stock?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          brand?: string
          price?: number
          discount_price?: number
          rating?: number
          category?: string
          quantity?: string
          image?: string
          description?: string | null
          usage?: string | null
          side_effects?: string | null
          contraindications?: string | null
          stock?: number | null
          created_at?: string
          updated_at?: string | null
        }
      }
      doctors: {
        Row: {
          id: number
          name: string
          specialty: string
          experience: string
          rating: number
          review_count: number
          consultation_fee: number
          available_today: boolean
          available_for_video: boolean
          available_for_in_clinic: boolean
          next_available: string
          image: string
          hospital: string
          location: string
          education: string
          languages: string[]
          available_slots: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          specialty: string
          experience: string
          rating: number
          review_count: number
          consultation_fee: number
          available_today: boolean
          available_for_video: boolean
          available_for_in_clinic: boolean
          next_available: string
          image: string
          hospital: string
          location: string
          education: string
          languages: string[]
          available_slots: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          specialty?: string
          experience?: string
          rating?: number
          review_count?: number
          consultation_fee?: number
          available_today?: boolean
          available_for_video?: boolean
          available_for_in_clinic?: boolean
          next_available?: string
          image?: string
          hospital?: string
          location?: string
          education?: string
          languages?: string[]
          available_slots?: Json
          created_at?: string
          updated_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: number
          user_id: string
          doctor_id: number
          appointment_date: string
          appointment_time: string
          status: string
          type: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          doctor_id: number
          appointment_date: string
          appointment_time: string
          status: string
          type: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          doctor_id?: number
          appointment_date?: string
          appointment_time?: string
          status?: string
          type?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: number
          user_id: string
          total_amount: number
          status: string
          delivery_address: Json
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          total_amount: number
          status: string
          delivery_address: Json
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          total_amount?: number
          status?: string
          delivery_address?: Json
          created_at?: string
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          medicine_id: number
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          medicine_id: number
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          medicine_id?: number
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: number
          user_id: string
          medicine_id: number | null
          doctor_id: number | null
          rating: number
          comment: string
          date: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          medicine_id?: number | null
          doctor_id?: number | null
          rating: number
          comment: string
          date: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          medicine_id?: number | null
          doctor_id?: number | null
          rating?: number
          comment?: string
          date?: string
          created_at?: string
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
      [_ in never]: never
    }
  }
} 