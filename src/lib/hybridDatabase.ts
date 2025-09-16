import { supabase, createServerSupabaseClient, Database } from './supabase'
import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

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

// Environment-based database selection
const isProduction = process.env.NODE_ENV === 'production'
const useSupabase = process.env.USE_SUPABASE === 'true' || isProduction

class HybridDatabaseService {
    private supabaseClient: any = null
    private sqliteDb: sqlite3.Database | null = null
    private initialized = false

    constructor() {
        // Don't initialize anything in constructor to avoid build-time issues
    }

    private ensureInitialized() {
        if (this.initialized) return

        // Skip initialization during build time
        if (process.env.NODE_ENV === 'production' && !process.env.USE_SUPABASE) {
            return
        }

        if (useSupabase) {
            this.supabaseClient = createServerSupabaseClient()
        } else {
            this.initSQLite()
        }
        this.initialized = true
    }

    private initSQLite() {
        const dataDir = path.join(process.cwd(), 'data')
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true })
        }

        const dbPath = path.join(dataDir, 'intellidiag.db')

        this.sqliteDb = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening SQLite database:', err.message)
            } else {
                console.log('Connected to SQLite database at:', dbPath)
                this.sqliteDb?.run('PRAGMA foreign_keys = ON')
            }
        })
    }

    // User operations
    async createUser(userData: UserInsert): Promise<User> {
        this.ensureInitialized()

        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('users')
                .insert(userData)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).substr(2, 9)
                const now = new Date().toISOString()
                this.sqliteDb!.run(
                    `INSERT INTO users (id, email, firstName, lastName, role, password, specialization, licenseNumber, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, userData.email, userData.first_name, userData.last_name, userData.role, userData.password, userData.specialization, userData.licenseNumber, true, now, now],
                    function (err) {
                        if (err) reject(err)
                        else resolve({
                            id,
                            email: userData.email,
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            role: userData.role,
                            password: userData.password,
                            specialization: userData.specialization,
                            licenseNumber: userData.licenseNumber,
                            isActive: true,
                            created_at: now,
                            updated_at: now
                        } as User)
                    }
                )
            })
        }
    }

    async getUserById(id: string): Promise<User | null> {
        this.ensureInitialized()

        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('users')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw error
            }
            return data
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT * FROM users WHERE id = ?',
                    [id],
                    (err, row: any) => {
                        if (err) reject(err)
                        else if (row) {
                            resolve({
                                id: row.id,
                                email: row.email,
                                first_name: row.firstName,
                                last_name: row.lastName,
                                role: row.role,
                                password: row.password,
                                isActive: row.isActive,
                                lastLogin: row.lastLogin,
                                specialization: row.specialization,
                                licenseNumber: row.licenseNumber,
                                profileImage: row.profileImage,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as User)
                        } else {
                            resolve(null)
                        }
                    }
                )
            })
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        this.ensureInitialized()

        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('users')
                .select('*')
                .eq('email', email)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw error
            }
            return data
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT * FROM users WHERE email = ?',
                    [email],
                    (err, row: any) => {
                        if (err) reject(err)
                        else if (row) {
                            resolve({
                                id: row.id,
                                email: row.email,
                                first_name: row.firstName,
                                last_name: row.lastName,
                                role: row.role,
                                password: row.password,
                                isActive: row.isActive,
                                lastLogin: row.lastLogin,
                                specialization: row.specialization,
                                licenseNumber: row.licenseNumber,
                                profileImage: row.profileImage,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as User)
                        } else {
                            resolve(null)
                        }
                    }
                )
            })
        }
    }

    async updateUser(id: string, updates: UserUpdate): Promise<User> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('users')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const now = new Date().toISOString()
                const fields = []
                const values = []

                if (updates.email) { fields.push('email = ?'); values.push(updates.email) }
                if (updates.first_name) { fields.push('firstName = ?'); values.push(updates.first_name) }
                if (updates.last_name) { fields.push('lastName = ?'); values.push(updates.last_name) }
                if (updates.role) { fields.push('role = ?'); values.push(updates.role) }
                if (updates.password) { fields.push('password = ?'); values.push(updates.password) }
                if (updates.isActive !== undefined) { fields.push('isActive = ?'); values.push(updates.isActive) }
                if (updates.lastLogin) { fields.push('lastLogin = ?'); values.push(updates.lastLogin) }

                fields.push('updatedAt = ?')
                values.push(now)
                values.push(id)

                this.sqliteDb!.run(
                    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                    values,
                    function (err) {
                        if (err) reject(err)
                        else {
                            // Return updated user
                            resolve({
                                id,
                                email: updates.email || '',
                                first_name: updates.first_name || '',
                                last_name: updates.last_name || '',
                                role: updates.role || 'patient',
                                password: updates.password,
                                isActive: updates.isActive,
                                lastLogin: updates.lastLogin,
                                created_at: '',
                                updated_at: now
                            } as User)
                        }
                    }
                )
            })
        }
    }

    async getAllUsers(): Promise<User[]> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.all(
                    'SELECT * FROM users ORDER BY createdAt DESC',
                    [],
                    (err, rows: any[]) => {
                        if (err) reject(err)
                        else {
                            const users = rows.map((row: any) => ({
                                id: row.id,
                                email: row.email,
                                first_name: row.firstName,
                                last_name: row.lastName,
                                role: row.role,
                                password: row.password,
                                isActive: row.isActive,
                                lastLogin: row.lastLogin,
                                specialization: row.specialization,
                                licenseNumber: row.licenseNumber,
                                profileImage: row.profileImage,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as User))
                            resolve(users)
                        }
                    }
                )
            })
        }
    }

    // Patient operations
    async createPatient(patientData: PatientInsert): Promise<Patient> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('patients')
                .insert(patientData)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).substr(2, 9)
                const now = new Date().toISOString()
                this.sqliteDb!.run(
                    `INSERT INTO patients (id, firstName, lastName, dateOfBirth, gender, contactNumber, email, street, city, state, zipCode, country, isActive, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, patientData.first_name, patientData.last_name, patientData.date_of_birth, patientData.gender, patientData.phone, patientData.email, patientData.address, '', '', '', '', true, now, now],
                    function (err) {
                        if (err) reject(err)
                        else resolve({
                            id,
                            first_name: patientData.first_name,
                            last_name: patientData.last_name,
                            date_of_birth: patientData.date_of_birth,
                            gender: patientData.gender,
                            phone: patientData.phone,
                            email: patientData.email,
                            address: patientData.address,
                            medical_history: patientData.medical_history || '',
                            created_at: now,
                            updated_at: now
                        } as Patient)
                    }
                )
            })
        }
    }

    async getPatientById(id: string): Promise<Patient | null> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('patients')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') return null
                throw error
            }
            return data
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT * FROM patients WHERE id = ?',
                    [id],
                    (err, row: any) => {
                        if (err) reject(err)
                        else if (row) {
                            resolve({
                                id: row.id,
                                first_name: row.firstName,
                                last_name: row.lastName,
                                date_of_birth: row.dateOfBirth,
                                gender: row.gender,
                                phone: row.contactNumber,
                                email: row.email,
                                address: row.street,
                                medical_history: '',
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Patient)
                        } else {
                            resolve(null)
                        }
                    }
                )
            })
        }
    }

    async updatePatient(id: string, updates: PatientUpdate): Promise<Patient> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('patients')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const now = new Date().toISOString()
                const fields = []
                const values = []

                if (updates.first_name) { fields.push('firstName = ?'); values.push(updates.first_name) }
                if (updates.last_name) { fields.push('lastName = ?'); values.push(updates.last_name) }
                if (updates.date_of_birth) { fields.push('dateOfBirth = ?'); values.push(updates.date_of_birth) }
                if (updates.gender) { fields.push('gender = ?'); values.push(updates.gender) }
                if (updates.phone) { fields.push('contactNumber = ?'); values.push(updates.phone) }
                if (updates.email) { fields.push('email = ?'); values.push(updates.email) }
                if (updates.address) { fields.push('street = ?'); values.push(updates.address) }

                fields.push('updatedAt = ?')
                values.push(now)
                values.push(id)

                this.sqliteDb!.run(
                    `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
                    values,
                    function (err) {
                        if (err) reject(err)
                        else {
                            resolve({
                                id,
                                first_name: updates.first_name || '',
                                last_name: updates.last_name || '',
                                date_of_birth: updates.date_of_birth || '',
                                gender: updates.gender || 'other',
                                phone: updates.phone || '',
                                email: updates.email || '',
                                address: updates.address || '',
                                medical_history: updates.medical_history || '',
                                created_at: '',
                                updated_at: now
                            } as Patient)
                        }
                    }
                )
            })
        }
    }

    async getAllPatients(): Promise<Patient[]> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.all(
                    'SELECT * FROM patients ORDER BY createdAt DESC',
                    [],
                    (err, rows: any[]) => {
                        if (err) reject(err)
                        else {
                            const patients = rows.map((row: any) => ({
                                id: row.id,
                                first_name: row.firstName,
                                last_name: row.lastName,
                                date_of_birth: row.dateOfBirth,
                                gender: row.gender,
                                phone: row.contactNumber,
                                email: row.email,
                                address: row.street,
                                medical_history: '',
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Patient))
                            resolve(patients)
                        }
                    }
                )
            })
        }
    }

    async deletePatient(id: string): Promise<void> {
        if (useSupabase) {
            const { error } = await this.supabaseClient
                .from('patients')
                .delete()
                .eq('id', id)

            if (error) throw error
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.run(
                    'DELETE FROM patients WHERE id = ?',
                    [id],
                    function (err) {
                        if (err) reject(err)
                        else resolve()
                    }
                )
            })
        }
    }

    // Scan operations
    async createScan(scanData: ScanInsert): Promise<Scan> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('scans')
                .insert(scanData)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).substr(2, 9)
                const now = new Date().toISOString()
                this.sqliteDb!.run(
                    `INSERT INTO scans (id, patientId, scanType, bodyPart, scanDate, uploadedById, priority, status, notes, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, scanData.patient_id, scanData.scan_type, scanData.body_part, now, scanData.created_by, scanData.priority, scanData.status || 'pending', '', now, now],
                    function (err) {
                        if (err) reject(err)
                        else resolve({
                            id,
                            patient_id: scanData.patient_id,
                            scan_type: scanData.scan_type,
                            body_part: scanData.body_part,
                            priority: scanData.priority,
                            status: scanData.status || 'pending',
                            ai_status: 'pending',
                            file_path: scanData.file_path,
                            file_name: scanData.file_name,
                            file_size: scanData.file_size,
                            mime_type: scanData.mime_type,
                            ai_analysis: scanData.ai_analysis || {},
                            confidence: scanData.confidence || 0,
                            findings: scanData.findings || '',
                            recommendations: scanData.recommendations || '',
                            created_by: scanData.created_by,
                            created_at: now,
                            updated_at: now
                        } as Scan)
                    }
                )
            })
        }
    }

    async getScanById(id: string): Promise<Scan | null> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
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
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT * FROM scans WHERE id = ?',
                    [id],
                    (err, row: any) => {
                        if (err) reject(err)
                        else if (row) {
                            resolve({
                                id: row.id,
                                patient_id: row.patientId,
                                scan_type: row.scanType,
                                body_part: row.bodyPart,
                                priority: row.priority,
                                status: row.status,
                                ai_status: 'pending',
                                file_path: '',
                                file_name: '',
                                file_size: 0,
                                mime_type: '',
                                ai_analysis: {},
                                confidence: 0,
                                findings: '',
                                recommendations: '',
                                created_by: row.uploadedById,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Scan)
                        } else {
                            resolve(null)
                        }
                    }
                )
            })
        }
    }

    async updateScan(id: string, updates: ScanUpdate): Promise<Scan> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('scans')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const now = new Date().toISOString()
                const fields = []
                const values = []

                if (updates.status) { fields.push('status = ?'); values.push(updates.status) }
                if (updates.priority) { fields.push('priority = ?'); values.push(updates.priority) }

                fields.push('updatedAt = ?')
                values.push(now)
                values.push(id)

                this.sqliteDb!.run(
                    `UPDATE scans SET ${fields.join(', ')} WHERE id = ?`,
                    values,
                    function (err) {
                        if (err) reject(err)
                        else {
                            resolve({
                                id,
                                patient_id: updates.patient_id || '',
                                scan_type: updates.scan_type || '',
                                body_part: updates.body_part || '',
                                priority: updates.priority || 'medium',
                                status: updates.status || 'pending',
                                ai_status: updates.ai_status || 'pending',
                                file_path: updates.file_path || '',
                                file_name: updates.file_name || '',
                                file_size: updates.file_size || 0,
                                mime_type: updates.mime_type || '',
                                ai_analysis: updates.ai_analysis || {},
                                confidence: updates.confidence || 0,
                                findings: updates.findings || '',
                                recommendations: updates.recommendations || '',
                                created_by: updates.created_by || '',
                                created_at: '',
                                updated_at: now
                            } as Scan)
                        }
                    }
                )
            })
        }
    }

    async getAllScans(): Promise<Scan[]> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('scans')
                .select(`
          *,
          patients!inner(*)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.all(
                    'SELECT * FROM scans ORDER BY createdAt DESC',
                    [],
                    (err, rows: any[]) => {
                        if (err) reject(err)
                        else {
                            const scans = rows.map((row: any) => ({
                                id: row.id,
                                patient_id: row.patientId,
                                scan_type: row.scanType,
                                body_part: row.bodyPart,
                                priority: row.priority,
                                status: row.status,
                                ai_status: 'pending',
                                file_path: '',
                                file_name: '',
                                file_size: 0,
                                mime_type: '',
                                ai_analysis: {},
                                confidence: 0,
                                findings: '',
                                recommendations: '',
                                created_by: row.uploadedById,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Scan))
                            resolve(scans)
                        }
                    }
                )
            })
        }
    }

    async getScansByPatientId(patientId: string): Promise<Scan[]> {
        if (useSupabase) {
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
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.all(
                    'SELECT * FROM scans WHERE patientId = ? ORDER BY createdAt DESC',
                    [patientId],
                    (err, rows: any[]) => {
                        if (err) reject(err)
                        else {
                            const scans = rows.map((row: any) => ({
                                id: row.id,
                                patient_id: row.patientId,
                                scan_type: row.scanType,
                                body_part: row.bodyPart,
                                priority: row.priority,
                                status: row.status,
                                ai_status: 'pending',
                                file_path: '',
                                file_name: '',
                                file_size: 0,
                                mime_type: '',
                                ai_analysis: {},
                                confidence: 0,
                                findings: '',
                                recommendations: '',
                                created_by: row.uploadedById,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Scan))
                            resolve(scans)
                        }
                    }
                )
            })
        }
    }

    async deleteScan(id: string): Promise<void> {
        if (useSupabase) {
            const { error } = await this.supabaseClient
                .from('scans')
                .delete()
                .eq('id', id)

            if (error) throw error
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.run(
                    'DELETE FROM scans WHERE id = ?',
                    [id],
                    function (err) {
                        if (err) reject(err)
                        else resolve()
                    }
                )
            })
        }
    }

    // Analysis operations
    async createAnalysis(analysisData: AnalysisInsert): Promise<Analysis> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('analyses')
                .insert(analysisData)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).substr(2, 9)
                const now = new Date().toISOString()
                this.sqliteDb!.run(
                    `INSERT INTO ai_analysis (id, scanId, status, confidence, findings, recommendations, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, analysisData.scan_id, analysisData.status || 'pending', analysisData.confidence || 0, '', '', now, now],
                    function (err) {
                        if (err) reject(err)
                        else resolve({
                            id,
                            scan_id: analysisData.scan_id,
                            analysis_type: analysisData.analysis_type,
                            status: analysisData.status || 'pending',
                            result: analysisData.result || {},
                            confidence: analysisData.confidence || 0,
                            created_at: now,
                            updated_at: now
                        } as Analysis)
                    }
                )
            })
        }
    }

    async getAnalysisById(id: string): Promise<Analysis | null> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
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
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.get(
                    'SELECT * FROM ai_analysis WHERE id = ?',
                    [id],
                    (err, row: any) => {
                        if (err) reject(err)
                        else if (row) {
                            resolve({
                                id: row.id,
                                scan_id: row.scanId,
                                analysis_type: 'ai_analysis',
                                status: row.status,
                                result: {},
                                confidence: row.confidence,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Analysis)
                        } else {
                            resolve(null)
                        }
                    }
                )
            })
        }
    }

    async updateAnalysis(id: string, updates: AnalysisUpdate): Promise<Analysis> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('analyses')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            return new Promise((resolve, reject) => {
                const now = new Date().toISOString()
                const fields = []
                const values = []

                if (updates.status) { fields.push('status = ?'); values.push(updates.status) }
                if (updates.confidence) { fields.push('confidence = ?'); values.push(updates.confidence) }
                if (updates.result) { fields.push('findings = ?'); values.push(JSON.stringify(updates.result)) }

                fields.push('updatedAt = ?')
                values.push(now)
                values.push(id)

                this.sqliteDb!.run(
                    `UPDATE ai_analysis SET ${fields.join(', ')} WHERE id = ?`,
                    values,
                    function (err) {
                        if (err) reject(err)
                        else {
                            resolve({
                                id,
                                scan_id: updates.scan_id || '',
                                analysis_type: updates.analysis_type || 'ai_analysis',
                                status: updates.status || 'pending',
                                result: updates.result || {},
                                confidence: updates.confidence || 0,
                                created_at: '',
                                updated_at: now
                            } as Analysis)
                        }
                    }
                )
            })
        }
    }

    async getAllAnalyses(): Promise<Analysis[]> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('analyses')
                .select(`
          *,
          scans!inner(*)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.all(
                    'SELECT * FROM ai_analysis ORDER BY createdAt DESC',
                    [],
                    (err, rows: any[]) => {
                        if (err) reject(err)
                        else {
                            const analyses = rows.map((row: any) => ({
                                id: row.id,
                                scan_id: row.scanId,
                                analysis_type: 'ai_analysis',
                                status: row.status,
                                result: {},
                                confidence: row.confidence,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Analysis))
                            resolve(analyses)
                        }
                    }
                )
            })
        }
    }

    async getAnalysesByScanId(scanId: string): Promise<Analysis[]> {
        if (useSupabase) {
            const { data, error } = await this.supabaseClient
                .from('analyses')
                .select(`
          *,
          scans!inner(*)
        `)
                .eq('scan_id', scanId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data || []
        } else {
            return new Promise((resolve, reject) => {
                this.sqliteDb!.all(
                    'SELECT * FROM ai_analysis WHERE scanId = ? ORDER BY createdAt DESC',
                    [scanId],
                    (err, rows: any[]) => {
                        if (err) reject(err)
                        else {
                            const analyses = rows.map((row: any) => ({
                                id: row.id,
                                scan_id: row.scanId,
                                analysis_type: 'ai_analysis',
                                status: row.status,
                                result: {},
                                confidence: row.confidence,
                                created_at: row.createdAt,
                                updated_at: row.updatedAt
                            } as Analysis))
                            resolve(analyses)
                        }
                    }
                )
            })
        }
    }

    // Dashboard statistics
    async getDashboardStats() {
        if (useSupabase) {
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
        } else {
            return new Promise((resolve, reject) => {
                Promise.all([
                    new Promise<number>((resolve, reject) => {
                        this.sqliteDb!.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
                            if (err) reject(err)
                            else resolve(row.count)
                        })
                    }),
                    new Promise<number>((resolve, reject) => {
                        this.sqliteDb!.get('SELECT COUNT(*) as count FROM patients', (err, row: any) => {
                            if (err) reject(err)
                            else resolve(row.count)
                        })
                    }),
                    new Promise<number>((resolve, reject) => {
                        this.sqliteDb!.get('SELECT COUNT(*) as count FROM scans', (err, row: any) => {
                            if (err) reject(err)
                            else resolve(row.count)
                        })
                    }),
                    new Promise<number>((resolve, reject) => {
                        this.sqliteDb!.get('SELECT COUNT(*) as count FROM ai_analysis', (err, row: any) => {
                            if (err) reject(err)
                            else resolve(row.count)
                        })
                    })
                ]).then(([totalUsers, totalPatients, totalScans, totalAnalyses]) => {
                    resolve({
                        totalUsers,
                        totalPatients,
                        totalScans,
                        totalAnalyses
                    })
                }).catch(reject)
            })
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            this.ensureInitialized()

            if (useSupabase) {
                const { error } = await this.supabaseClient
                    .from('users')
                    .select('id')
                    .limit(1)

                return !error
            } else {
                return new Promise((resolve) => {
                    this.sqliteDb!.get('SELECT 1', (err) => {
                        resolve(!err)
                    })
                })
            }
        } catch {
            return false
        }
    }

    // Initialize database tables
    async initDatabase(): Promise<void> {
        this.ensureInitialized()

        if (useSupabase) {
            // Supabase database initialization is handled by migrations
            return Promise.resolve()
        } else {
            return new Promise((resolve, reject) => {
                if (!this.sqliteDb) {
                    reject(new Error('SQLite database not initialized'))
                    return
                }

                // Users table
                this.sqliteDb!.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            role TEXT CHECK(role IN ('doctor', 'radiologist', 'admin', 'patient')) DEFAULT 'doctor',
            specialization TEXT,
            licenseNumber TEXT,
            isActive BOOLEAN DEFAULT 1,
            lastLogin DATETIME,
            profileImage TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
                    if (err) reject(err)
                })

                // Patients table
                this.sqliteDb!.run(`
          CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            dateOfBirth DATE NOT NULL,
            gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
            contactNumber TEXT,
            email TEXT,
            street TEXT,
            city TEXT,
            state TEXT,
            zipCode TEXT,
            country TEXT,
            assignedDoctorId TEXT,
            isActive BOOLEAN DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assignedDoctorId) REFERENCES users (id)
          )
        `, (err) => {
                    if (err) reject(err)
                })

                // Scans table
                this.sqliteDb!.run(`
          CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            patientId TEXT NOT NULL,
            scanType TEXT CHECK(scanType IN ('X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Other')) NOT NULL,
            bodyPart TEXT NOT NULL,
            scanDate DATE NOT NULL,
            uploadedById TEXT NOT NULL,
            priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
            status TEXT CHECK(status IN ('pending', 'analyzing', 'completed', 'archived')) DEFAULT 'pending',
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patientId) REFERENCES patients (id),
            FOREIGN KEY (uploadedById) REFERENCES users (id)
          )
        `, (err) => {
                    if (err) reject(err)
                })

                // AI analysis table
                this.sqliteDb!.run(`
          CREATE TABLE IF NOT EXISTS ai_analysis (
            id TEXT PRIMARY KEY,
            scanId TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
            confidence REAL,
            findings TEXT,
            recommendations TEXT,
            processingTime INTEGER,
            modelVersion TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (scanId) REFERENCES scans (id)
          )
        `, (err) => {
                    if (err) reject(err)
                })

                // Create indexes
                this.sqliteDb!.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
                    if (err) reject(err)
                })

                this.sqliteDb!.run('CREATE INDEX IF NOT EXISTS idx_patients_id ON patients(id)', (err) => {
                    if (err) reject(err)
                })

                this.sqliteDb!.run('CREATE INDEX IF NOT EXISTS idx_scans_id ON scans(id)', (err) => {
                    if (err) reject(err)
                })

                // Insert default admin user
                this.sqliteDb!.get('SELECT id FROM users WHERE email = ?', ['admin@intellidiag.com'], (err, row) => {
                    if (err) {
                        reject(err)
                        return
                    }

                    if (!row) {
                        const bcrypt = require('bcryptjs')
                        bcrypt.hash('admin123', 12).then((hash: string) => {
                            this.sqliteDb!.run(`
                INSERT INTO users (id, email, password, firstName, lastName, role, specialization)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `, ['admin-001', 'admin@intellidiag.com', hash, 'Admin', 'User', 'admin', 'System Administrator'], (err) => {
                                if (err) {
                                    console.log('Error creating admin user:', err.message)
                                } else {
                                    console.log('Default admin user created: admin@intellidiag.com / admin123')
                                }
                            })
                        })
                    }
                })

                resolve()
            })
        }
    }
}

// Export singleton instance
export const hybridDb = new HybridDatabaseService()

// Legacy compatibility functions for existing code
export const getRow = async (table: string, id: string) => {
    switch (table) {
        case 'users':
            return await hybridDb.getUserById(id)
        case 'patients':
            return await hybridDb.getPatientById(id)
        case 'scans':
            return await hybridDb.getScanById(id)
        case 'analyses':
            return await hybridDb.getAnalysisById(id)
        default:
            throw new Error(`Unknown table: ${table}`)
    }
}

export const getAll = async (table: string) => {
    switch (table) {
        case 'users':
            return await hybridDb.getAllUsers()
        case 'patients':
            return await hybridDb.getAllPatients()
        case 'scans':
            return await hybridDb.getAllScans()
        case 'analyses':
            return await hybridDb.getAllAnalyses()
        default:
            throw new Error(`Unknown table: ${table}`)
    }
}

export const runQuery = async (query: string, params: any[] = []) => {
    // For hybrid approach, we'll need to implement specific query logic
    throw new Error('Raw SQL queries not supported with hybrid database. Use the specific methods instead.')
}

export const initDatabase = async () => {
    return await hybridDb.initDatabase()
}
