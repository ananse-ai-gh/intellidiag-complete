import { supabase, createServerSupabaseClient, Database } from './supabase'

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

class SupabaseDatabaseService {
    public client = createServerSupabaseClient()

    // User operations
    async createUser(userData: UserInsert): Promise<User> {
        const { data, error } = await this.client
            .from('users')
            .insert(userData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getUserById(id: string): Promise<User | null> {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // No rows returned
            throw error
        }
        return data
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data
    }

    async updateUser(id: string, updates: UserUpdate): Promise<User> {
        const { data, error } = await this.client
            .from('users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllUsers(): Promise<User[]> {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Patient operations
    async createPatient(patientData: PatientInsert): Promise<Patient> {
        const { data, error } = await this.client
            .from('patients')
            .insert(patientData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getPatientById(id: string): Promise<Patient | null> {
        const { data, error } = await this.client
            .from('patients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data
    }

    async updatePatient(id: string, updates: PatientUpdate): Promise<Patient> {
        const { data, error } = await this.client
            .from('patients')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllPatients(): Promise<Patient[]> {
        const { data, error } = await this.client
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    async deletePatient(id: string): Promise<void> {
        const { error } = await this.client
            .from('patients')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Scan operations
    async createScan(scanData: ScanInsert): Promise<Scan> {
        const { data, error } = await this.client
            .from('scans')
            .insert(scanData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getScanById(id: string): Promise<Scan | null> {
        const { data, error } = await this.client
            .from('scans')
            .select(`
        *,
        patients!inner(*)
      `)
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data
    }

    async updateScan(id: string, updates: ScanUpdate): Promise<Scan> {
        const { data, error } = await this.client
            .from('scans')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllScans(): Promise<Scan[]> {
        const { data, error } = await this.client
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
        const { data, error } = await this.client
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

    async deleteScan(id: string): Promise<void> {
        const { error } = await this.client
            .from('scans')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Analysis operations
    async createAnalysis(analysisData: AnalysisInsert): Promise<Analysis> {
        const { data, error } = await this.client
            .from('analyses')
            .insert(analysisData)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAnalysisById(id: string): Promise<Analysis | null> {
        const { data, error } = await this.client
            .from('analyses')
            .select(`
        *,
        scans!inner(*)
      `)
            .eq('id', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            throw error
        }
        return data
    }

    async updateAnalysis(id: string, updates: AnalysisUpdate): Promise<Analysis> {
        const { data, error } = await this.client
            .from('analyses')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    async getAllAnalyses(): Promise<Analysis[]> {
        const { data, error } = await this.client
            .from('analyses')
            .select(`
        *,
        scans!inner(*)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    async getAnalysesByScanId(scanId: string): Promise<Analysis[]> {
        const { data, error } = await this.client
            .from('analyses')
            .select(`
        *,
        scans!inner(*)
      `)
            .eq('scan_id', scanId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Dashboard statistics
    async getDashboardStats() {
        const [usersResult, patientsResult, scansResult, analysesResult] = await Promise.all([
            this.client.from('users').select('id', { count: 'exact' }),
            this.client.from('patients').select('id', { count: 'exact' }),
            this.client.from('scans').select('id', { count: 'exact' }),
            this.client.from('analyses').select('id', { count: 'exact' })
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
            const { error } = await this.client
                .from('users')
                .select('id')
                .limit(1)

            return !error
        } catch {
            return false
        }
    }
}

// Export singleton instance
export const supabaseDb = new SupabaseDatabaseService()

// Legacy compatibility functions for existing code
export const getRow = async (table: string, id: string) => {
    switch (table) {
        case 'users':
            return await supabaseDb.getUserById(id)
        case 'patients':
            return await supabaseDb.getPatientById(id)
        case 'scans':
            return await supabaseDb.getScanById(id)
        case 'analyses':
            return await supabaseDb.getAnalysisById(id)
        default:
            throw new Error(`Unknown table: ${table}`)
    }
}

export const getAll = async (query: string, params: any[] = []) => {
    // For Supabase, we'll need to implement specific query logic
    // This is a placeholder for complex queries that might need raw SQL
    throw new Error('Raw SQL queries not supported with Supabase. Use the specific methods instead.')
}

export const runQuery = async (query: string, params: any[] = []) => {
    // For Supabase, we'll need to implement specific query logic
    // This is a placeholder for complex queries that might need raw SQL
    throw new Error('Raw SQL queries not supported with Supabase. Use the specific methods instead.')
}

export const initDatabase = async () => {
    // Supabase database initialization is handled by migrations
    // This function is kept for compatibility
    return true
}
