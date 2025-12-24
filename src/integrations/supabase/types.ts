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
      leads: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          customer_name: string
          phone: string
          email: string | null
          source: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
          // Extended fields
          address: string | null
          alternate_phone: string | null
          assigned_agent: string | null
          bhk_requirement: string | null
          budget_max: number | null
          budget_min: number | null
          carpet_area: string | null
          city: string | null
          company_name: string | null
          expected_possession_date: string | null
          facing: string | null
          floor_preference: string | null
          furnishing: string | null
          has_pets: boolean | null
          is_vegetarian: boolean | null
          lead_priority: string | null
          lead_type: string | null
          occupation: string | null
          parking_required: boolean | null
          possession_from: string | null
          preferred_locations: string[] | null
          property_category: string | null
          property_type: string | null
          purpose: string | null
          ready_to_move: boolean | null
          tenant_type: string | null
          visit_date: string | null
          visit_time: string | null
        }
        Insert: {
          id?: string
          user_id: string
          customer_id?: string | null
          customer_name: string
          phone: string
          email?: string | null
          source: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          // Extended fields
          address?: string | null
          alternate_phone?: string | null
          assigned_agent?: string | null
          bhk_requirement?: string | null
          budget_max?: number | null
          budget_min?: number | null
          carpet_area?: string | null
          city?: string | null
          company_name?: string | null
          expected_possession_date?: string | null
          facing?: string | null
          floor_preference?: string | null
          furnishing?: string | null
          has_pets?: boolean | null
          is_vegetarian?: boolean | null
          lead_priority?: string | null
          lead_type?: string | null
          occupation?: string | null
          parking_required?: boolean | null
          possession_from?: string | null
          preferred_locations?: string[] | null
          property_category?: string | null
          property_type?: string | null
          purpose?: string | null
          ready_to_move?: boolean | null
          tenant_type?: string | null
          visit_date?: string | null
          visit_time?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string | null
          customer_name?: string
          phone?: string
          email?: string | null
          source?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          // Extended fields
          address?: string | null
          alternate_phone?: string | null
          assigned_agent?: string | null
          bhk_requirement?: string | null
          budget_max?: number | null
          budget_min?: number | null
          carpet_area?: string | null
          city?: string | null
          company_name?: string | null
          expected_possession_date?: string | null
          facing?: string | null
          floor_preference?: string | null
          furnishing?: string | null
          has_pets?: boolean | null
          is_vegetarian?: boolean | null
          lead_priority?: string | null
          lead_type?: string | null
          occupation?: string | null
          parking_required?: boolean | null
          possession_from?: string | null
          preferred_locations?: string[] | null
          property_category?: string | null
          property_type?: string | null
          purpose?: string | null
          ready_to_move?: boolean | null
          tenant_type?: string | null
          visit_date?: string | null
          visit_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      // Other tables would be here
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          created_at: string
          updated_at: string
          whatsapp_number: string | null
          alternate_phone: string | null
          city: string | null
          occupation: string | null
          company_name: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone: string
          email?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
          whatsapp_number?: string | null
          alternate_phone?: string | null
          city?: string | null
          occupation?: string | null
          company_name?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
          whatsapp_number?: string | null
          alternate_phone?: string | null
          city?: string | null
          occupation?: string | null
          company_name?: string | null
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          id: string
          user_id: string
          lead_id: string | null
          customer_id: string | null
          customer_name: string
          phone: string
          scheduled_at: string
          notes: string | null
          completed: boolean
          created_at: string
          follow_up_type: string | null
          status: string | null
          auto_reminder: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          lead_id?: string | null
          customer_id?: string | null
          customer_name: string
          phone: string
          scheduled_at: string
          notes?: string | null
          completed?: boolean
          created_at?: string
          follow_up_type?: string | null
          status?: string | null
          auto_reminder?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          lead_id?: string | null
          customer_id?: string | null
          customer_name?: string
          phone?: string
          scheduled_at?: string
          notes?: string | null
          completed?: boolean
          created_at?: string
          follow_up_type?: string | null
          status?: string | null
          auto_reminder?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          customer_name: string
          items: Json
          subtotal: number
          tax: number
          discount: number
          total: number
          payment_status: string
          due_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          customer_id?: string | null
          customer_name: string
          items: Json
          subtotal?: number
          tax?: number
          discount?: number
          total?: number
          payment_status?: string
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string | null
          customer_name?: string
          items?: Json
          subtotal?: number
          tax?: number
          discount?: number
          total?: number
          payment_status?: string
          due_date?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          lead_id: string | null
          customer_id: string | null
          document_type: string
          document_name: string
          file_url: string
          file_path: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lead_id?: string | null
          customer_id?: string | null
          document_type: string
          document_name: string
          file_url: string
          file_path: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lead_id?: string | null
          customer_id?: string | null
          document_type?: string
          document_name?: string
          file_url?: string
          file_path?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          }
        ]
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