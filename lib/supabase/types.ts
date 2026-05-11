/**
 * Supabase Database type definitions.
 * Run `supabase gen types typescript --local > lib/supabase/types.ts` to regenerate.
 */
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
      reviews: {
        Row: {
          id: string
          product_id: string
          product_title: string
          reviewer_name: string
          reviewer_email: string
          rating: number
          comment: string
          status: 'pending' | 'approved' | 'rejected'
          images: string[]
          ip_address: string | null
          origin: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          product_title: string
          reviewer_name: string
          reviewer_email: string
          rating: number
          comment: string
          status?: 'pending' | 'approved' | 'rejected'
          images?: string[]
          ip_address?: string | null
          origin?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          product_title?: string
          reviewer_name?: string
          reviewer_email?: string
          rating?: number
          comment?: string
          status?: 'pending' | 'approved' | 'rejected'
          images?: string[]
          ip_address?: string | null
          origin?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          id: string
          identifier: string
          count: number
          window_start: string
          created_at: string
        }
        Insert: {
          id?: string
          identifier: string
          count: number
          window_start: string
          created_at?: string
        }
        Update: {
          id?: string
          identifier?: string
          count?: number
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      review_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewStatus = Database['public']['Enums']['review_status']
