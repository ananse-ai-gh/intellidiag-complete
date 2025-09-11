import { createClient } from '@supabase/supabase-js'
import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

// Environment-based database selection
const isProduction = process.env.NODE_ENV === 'production'
const useSupabase = process.env.USE_SUPABASE === 'true' || isProduction

// Supabase configuration - using Netlify-provided variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create Supabase client if we have valid credentials
let supabase: any = null
let createServerSupabaseClient: any = null

if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'placeholder-key') {
    supabase = createClient(supabaseUrl, supabaseAnonKey)

    createServerSupabaseClient = () => {
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
        return createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
    }
} else {
    // Create mock clients for build time
    supabase = {
        from: () => ({ select: () => ({ eq: () => ({ data: [], error: null }) }) }),
        auth: { signIn: () => Promise.resolve({ data: null, error: null }) }
    }

    createServerSupabaseClient = () => ({
        from: () => ({ select: () => ({ eq: () => ({ data: [], error: null }) }) }),
        auth: { signIn: () => Promise.resolve({ data: null, error: null }) }
    })
}

export { supabase, createServerSupabaseClient }

// SQLite configuration for development
let sqliteDb: sqlite3.Database | null = null

const initSQLite = () => {
    if (sqliteDb) return sqliteDb

    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }

    const dbPath = path.join(dataDir, 'intellidiag.db')

    sqliteDb = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err.message)
        } else {
            console.log('Connected to SQLite database at:', dbPath)
            sqliteDb?.run('PRAGMA foreign_keys = ON')
        }
    })

    return sqliteDb
}

// Database selection function
export const getDatabase = () => {
    if (useSupabase) {
        return createServerSupabaseClient()
    } else {
        return initSQLite()
    }
}

// Database types for TypeScript
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    first_name: string
                    last_name: string
                    role: 'admin' | 'doctor' | 'radiologist' | 'patient'
                    password?: string
                    isActive?: boolean
                    lastLogin?: string
                    specialization?: string
                    licenseNumber?: string
                    profileImage?: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    first_name: string
                    last_name: string
                    role: 'admin' | 'doctor' | 'radiologist' | 'patient'
                    password?: string
                    isActive?: boolean
                    lastLogin?: string
                    specialization?: string
                    licenseNumber?: string
                    profileImage?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    first_name?: string
                    last_name?: string
                    role?: 'admin' | 'doctor' | 'radiologist' | 'patient'
                    password?: string
                    isActive?: boolean
                    lastLogin?: string
                    specialization?: string
                    licenseNumber?: string
                    profileImage?: string
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