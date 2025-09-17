import { supabase, createServerSupabaseClient } from './supabase'

export interface SupabaseUser {
    id: string
    email: string
    first_name: string
    last_name: string
    role: 'admin' | 'doctor' | 'radiologist' | 'patient'
    specialization?: string
    licenseNumber?: string
    profileImage?: string
    isActive: boolean
    lastLogin?: string
    created_at: string
    updated_at: string
}

export interface SignUpData {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: 'admin' | 'doctor' | 'radiologist' | 'patient'
    specialization?: string
    licenseNumber?: string
}

export interface SignInData {
    email: string
    password: string
}

class SupabaseAuthService {
    // Client-side auth operations
    async signUp(data: SignUpData) {
        try {
            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        role: data.role || 'patient',
                        specialization: data.specialization,
                        licenseNumber: data.licenseNumber
                    }
                }
            })

            if (authError) throw authError

            // If user was created successfully, create user profile
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email: data.email,
                        first_name: data.firstName,
                        last_name: data.lastName,
                        role: data.role || 'patient',
                        specialization: data.specialization,
                        licenseNumber: data.licenseNumber,
                        isActive: true
                    })

                if (profileError) {
                    console.error('Error creating user profile:', profileError)
                    // Don't throw here as the auth user was created successfully
                }
            }

            return {
                user: authData.user,
                session: authData.session,
                error: null
            }
        } catch (error: any) {
            return {
                user: null,
                session: null,
                error: error.message
            }
        }
    }

    async signIn(data: SignInData) {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            })

            if (authError) throw authError

            // Update last login
            if (authData.user) {
                await supabase
                    .from('users')
                    .update({
                        lastLogin: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', authData.user.id)
            }

            return {
                user: authData.user,
                session: authData.session,
                error: null
            }
        } catch (error: any) {
            return {
                user: null,
                session: null,
                error: error.message
            }
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            return { error: null }
        } catch (error: any) {
            return { error: error.message }
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            return { user, error: null }
        } catch (error: any) {
            return { user: null, error: error.message }
        }
    }

    async getUserProfile(userId: string): Promise<SupabaseUser | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
    }

    // Server-side auth operations (for API routes)
    async verifyToken(token: string) {
        try {
            const supabaseAdmin = createServerSupabaseClient()
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

            if (error) throw error
            return { user, error: null }
        } catch (error: any) {
            return { user: null, error: error.message }
        }
    }

    async getUserFromToken(token: string): Promise<SupabaseUser | null> {
        try {
            const { user, error } = await this.verifyToken(token)
            if (error || !user) return null

            const supabaseAdmin = createServerSupabaseClient()
            const { data, error: profileError } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError) throw profileError
            return data
        } catch (error) {
            console.error('Error getting user from token:', error)
            return null
        }
    }

    // Password reset
    async resetPassword(email: string) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            })
            if (error) throw error
            return { error: null }
        } catch (error: any) {
            return { error: error.message }
        }
    }

    // Update password
    async updatePassword(newPassword: string) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })
            if (error) throw error
            return { error: null }
        } catch (error: any) {
            return { error: error.message }
        }
    }
}

export const supabaseAuth = new SupabaseAuthService()
