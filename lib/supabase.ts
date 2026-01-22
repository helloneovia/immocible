import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour les utilisateurs
export type UserRole = 'acquereur' | 'agence'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  nom?: string
  prenom?: string
  nom_agence?: string
  created_at?: string
}
