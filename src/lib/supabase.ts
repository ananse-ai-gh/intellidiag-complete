import { createClient } from '@supabase/supabase-js'

// Always use Supabase
const useSupabase = true

// Supabase configuration - using Netlify-provided variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Always create Supabase clients
let supabase: any = null
let createServerSupabaseClient: any = null

// Client-side Supabase client (for auth)
supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Server-side Supabase client (for admin operations)
createServerSupabaseClient = () => {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

export { supabase, createServerSupabaseClient }

// Database selection function - always returns Supabase client
export const getDatabase = () => {
    return createServerSupabaseClient()
}

// Database types for TypeScript
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'doctor' | 'radiologist' | 'patient'
                    specialization?: string
                    licensenumber?: string
                    isactive: boolean
                    lastlogin?: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role: 'admin' | 'doctor' | 'radiologist' | 'patient'
                    specialization?: string
                    licensenumber?: string
                    isactive?: boolean
                    lastlogin?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'doctor' | 'radiologist' | 'patient'
                    specialization?: string
                    licensenumber?: string
                    isactive?: boolean
                    lastlogin?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            patients: {
                Row: {
                    id: string
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    gender: 'male' | 'female' | 'other'
                    phone: string
                    email: string
                    address: string
                    medical_history: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    first_name: string
                    last_name: string
                    date_of_birth: string
                    gender: 'male' | 'female' | 'other'
                    phone: string
                    email: string
                    address: string
                    medical_history?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    first_name?: string
                    last_name?: string
                    date_of_birth?: string
                    gender?: 'male' | 'female' | 'other'
                    phone?: string
                    email?: string
                    address?: string
                    medical_history?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            scans: {
                Row: {
                    id: string
                    patient_id: string
                    scan_type: string
                    body_part: string
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
                    ai_status: 'pending' | 'processing' | 'completed' | 'failed'
                    file_path: string
                    file_name: string
                    file_size: number
                    mime_type: string
                    ai_analysis: any
                    confidence: number
                    findings: string
                    recommendations: string
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    scan_type: string
                    body_part: string
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    ai_status?: 'pending' | 'processing' | 'completed' | 'failed'
                    file_path: string
                    file_name: string
                    file_size: number
                    mime_type: string
                    ai_analysis?: any
                    confidence?: number
                    findings?: string
                    recommendations?: string
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    scan_type?: string
                    body_part?: string
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    ai_status?: 'pending' | 'processing' | 'completed' | 'failed'
                    file_path?: string
                    file_name?: string
                    file_size?: number
                    mime_type?: string
                    ai_analysis?: any
                    confidence?: number
                    findings?: string
                    recommendations?: string
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            analyses: {
                Row: {
                    id: string
                    scan_id: string
                    analysis_type: string
                    status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
                    result: any
                    confidence: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    scan_id: string
                    analysis_type: string
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    result?: any
                    confidence?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    scan_id?: string
                    analysis_type?: string
                    status?: 'pending' | 'processing' | 'completed' | 'failed'
                    result?: any
                    confidence?: number
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
            [_ in never]: never
        }
    }
}

// Export database type for use in other files
export type DatabaseType = Database