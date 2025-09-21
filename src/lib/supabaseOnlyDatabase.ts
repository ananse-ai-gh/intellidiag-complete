import { createServerSupabaseClient, Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type Patient = Database['public']['Tables']['patients']['Row']
type Scan = Database['public']['Tables']['scans']['Row']
type Analysis = Database['public']['Tables']['analyses']['Row']

type UserInsert = Database['public']['Tables']['users']['Insert']
type PatientInsert = Database['public']['Tables']['patients']['Insert']
type ScanInsert = Database['public']['Tables']['scans']['Insert']
type AnalysisInsert = Database['public']['Tables']['analyses']['Insert']

type UserUpdate = Database['public']['Tables']['users']['Update']
type PatientUpdate = Database['public']['Tables']['patients']['Update']
type ScanUpdate = Database['public']['Tables']['scans']['Update']
type AnalysisUpdate = Database['public']['Tables']['analyses']['Update']

class SupabaseOnlyDatabaseService {
    private supabaseClient = createServerSupabaseClient()

    // User operations
    async getUserById(id: string): Promise<User | null> {
        const { data, error } = await this.supabaseClient
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching user:', error)
            return null
        }
        return data
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const { data, error } = await this.supabaseClient
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

        if (error) {
            console.error('Error fetching user by email:', error)
            return null
        }
        return data
    }

    async createUser(userData: UserInsert): Promise<User> {
        const { data, error } = await this.supabaseClient
            .from('users')
            .insert(userData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateUser(id: string, updates: UserUpdate): Promise<User> {
        const { data, error } = await this.supabaseClient
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllUsers(): Promise<User[]> {
        const { data, error } = await this.supabaseClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Patient operations
    async getPatientById(id: string): Promise<Patient | null> {
        const { data, error } = await this.supabaseClient
            .from('patients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching patient:', error)
            return null
        }
        return data
    }

    async createPatient(patientData: PatientInsert): Promise<Patient> {
        const { data, error } = await this.supabaseClient
            .from('patients')
            .insert(patientData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updatePatient(id: string, updates: PatientUpdate): Promise<Patient> {
        const { data, error } = await this.supabaseClient
            .from('patients')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllPatients(): Promise<Patient[]> {
        const { data, error } = await this.supabaseClient
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Scan operations
    async getScanById(id: string): Promise<Scan | null> {
        const { data, error } = await this.supabaseClient
            .from('scans')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching scan:', error)
            return null
        }
        return data
    }

    async createScan(scanData: ScanInsert): Promise<Scan> {
        const { data, error } = await this.supabaseClient
            .from('scans')
            .insert(scanData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateScan(id: string, updates: ScanUpdate): Promise<Scan> {
        const { data, error } = await this.supabaseClient
            .from('scans')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllScans(): Promise<Scan[]> {
        const { data, error } = await this.supabaseClient
            .from('scans')
            .select(`
                *,
                patients!inner(*)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    async getScansByPatientId(patientId: string): Promise<Scan[]> {
        const { data, error } = await this.supabaseClient
            .from('scans')
            .select(`
                *,
                patients!inner(*)
            `)
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Analysis operations
    async getAnalysisById(id: string): Promise<Analysis | null> {
        const { data, error } = await this.supabaseClient
            .from('analyses')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching analysis:', error)
            return null
        }
        return data
    }

    async createAnalysis(analysisData: AnalysisInsert): Promise<Analysis> {
        const { data, error } = await this.supabaseClient
            .from('analyses')
            .insert(analysisData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async updateAnalysis(id: string, updates: AnalysisUpdate): Promise<Analysis> {
        const { data, error } = await this.supabaseClient
            .from('analyses')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllAnalyses(): Promise<Analysis[]> {
        const { data, error } = await this.supabaseClient
            .from('analyses')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    async getAnalysesByScanId(scanId: string): Promise<Analysis[]> {
        const { data, error } = await this.supabaseClient
            .from('analyses')
            .select('*')
            .eq('scan_id', scanId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Dashboard statistics
    async getDashboardStats() {
        const [usersResult, patientsResult, scansResult, analysesResult] = await Promise.all([
            this.supabaseClient.from('users').select('id', { count: 'exact' }),
            this.supabaseClient.from('patients').select('id', { count: 'exact' }),
            this.supabaseClient.from('scans').select('id', { count: 'exact' }),
            this.supabaseClient.from('analyses').select('id', { count: 'exact' })
        ])

        return {
            totalUsers: usersResult.count || 0,
            totalPatients: patientsResult.count || 0,
            totalScans: scansResult.count || 0,
            totalAnalyses: analysesResult.count || 0
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            const { error } = await this.supabaseClient
                .from('users')
                .select('id')
                .limit(1)

            return !error
        } catch (error) {
            console.error('Health check failed:', error)
            return false
        }
    }
}

// Export singleton instance
export const db = new SupabaseOnlyDatabaseService()

// Legacy compatibility functions
export const getRow = async (table: string, id: string) => {
    switch (table) {
        case 'users':
            return await db.getUserById(id)
        case 'patients':
            return await db.getPatientById(id)
        case 'scans':
            return await db.getScanById(id)
        case 'analyses':
            return await db.getAnalysisById(id)
        default:
            throw new Error(`Unknown table: ${table}`)
    }
}

export const getAll = async (table: string) => {
    switch (table) {
        case 'users':
            return await db.getAllUsers()
        case 'patients':
            return await db.getAllPatients()
        case 'scans':
            return await db.getAllScans()
        case 'analyses':
            return await db.getAllAnalyses()
        default:
            throw new Error(`Unknown table: ${table}`)
    }
}

export const runQuery = async (query: string, params: any[] = []) => {
    // For Supabase, we'll use RPC functions or direct SQL
    // This is a placeholder - implement based on your needs
    throw new Error('runQuery not implemented for Supabase-only mode')
}

export const initDatabase = async () => {
    // Database initialization is handled by Supabase
    return true
}

// Export database type for use in other files
export type DatabaseType = Database
