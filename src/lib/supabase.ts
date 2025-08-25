import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          name: string
          max_players: number
          max_teams: number
          points_per_team: number
          status: 'draft' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>
      }
      teams: {
        Row: {
          id: string
          tournament_id: string
          name: string
          owner_name: string
          logo_url: string | null
          remaining_points: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      players: {
        Row: {
          id: string
          tournament_id: string
          name: string
          position: string
          base_price: number
          image_url: string | null
          is_icon: boolean
          status: 'available' | 'sold' | 'unsold'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      team_players: {
        Row: {
          id: string
          team_id: string
          player_id: string
          purchase_price: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_players']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['team_players']['Insert']>
      }
    }
  }
}