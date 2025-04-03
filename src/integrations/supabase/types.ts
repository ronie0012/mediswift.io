export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          consultation_type: string
          created_at: string
          date: string
          doctor_id: number
          id: number
          patient_id: string
          status: string
          symptoms: string
          time: string
        }
        Insert: {
          consultation_type: string
          created_at?: string
          date: string
          doctor_id: number
          id?: number
          patient_id: string
          status?: string
          symptoms: string
          time: string
        }
        Update: {
          consultation_type?: string
          created_at?: string
          date?: string
          doctor_id?: number
          id?: number
          patient_id?: string
          status?: string
          symptoms?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          created_at: string
          date: string
          doctor_id: number
          id: number
          time_slots: string[]
        }
        Insert: {
          created_at?: string
          date: string
          doctor_id: number
          id?: number
          time_slots: string[]
        }
        Update: {
          created_at?: string
          date?: string
          doctor_id?: number
          id?: number
          time_slots?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          consultation_fee: number
          created_at: string
          experience_years: number
          hospital: string
          id: number
          name: string
          profile_image: string
          qualification: string
          rating: number
          specialty: string
        }
        Insert: {
          consultation_fee: number
          created_at?: string
          experience_years: number
          hospital: string
          id?: number
          name: string
          profile_image?: string
          qualification: string
          rating?: number
          specialty: string
        }
        Update: {
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          hospital?: string
          id?: number
          name?: string
          profile_image?: string
          qualification?: string
          rating?: number
          specialty?: string
        }
        Relationships: []
      }
      medicine_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          parent_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          parent_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "medicine_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "medicine_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_inventory: {
        Row: {
          batch_number: string
          created_at: string
          expiry_date: string
          id: string
          location: string | null
          medicine_id: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          expiry_date: string
          id?: string
          location?: string | null
          medicine_id: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          expiry_date?: string
          id?: string
          location?: string | null
          medicine_id?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_inventory_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string
          discount_price: number | null
          id: number
          image_url: string
          in_stock: boolean
          name: string
          price: number
          quantity: string
          requires_prescription: boolean
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          description: string
          discount_price?: number | null
          id?: number
          image_url?: string
          in_stock?: boolean
          name: string
          price: number
          quantity: string
          requires_prescription?: boolean
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string
          discount_price?: number | null
          id?: number
          image_url?: string
          in_stock?: boolean
          name?: string
          price?: number
          quantity?: string
          requires_prescription?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          medicine_id: number
          order_id: number
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: number
          medicine_id: number
          order_id: number
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: number
          medicine_id?: number
          order_id?: number
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string
          id: number
          payment_method: string
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          id?: number
          payment_method: string
          status?: string
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          id?: number
          payment_method?: string
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          created_at: string
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          medicine_id: number
          prescription_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          medicine_id: number
          prescription_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          medicine_id?: number
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          diagnosis: string | null
          doctor_id: number
          expires_at: string
          id: string
          is_active: boolean | null
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          doctor_id: number
          expires_at: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          doctor_id?: number
          expires_at?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
