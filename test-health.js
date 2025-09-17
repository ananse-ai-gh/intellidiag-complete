// Test the database health endpoint
import { createServerSupabaseClient } from './src/lib/supabase.js'

async function testHealthEndpoint() {
    console.log('🔍 Testing database health endpoint logic...')
    
    try {
        // Simulate the health endpoint logic
        const useSupabase = process.env.USE_SUPABASE === 'true' || process.env.NODE_ENV === 'production'
        
        if (useSupabase) {
            console.log('Using Supabase for health check...')
            const supabase = createServerSupabaseClient()
            
            if (!supabase) {
                console.log('❌ Supabase client unavailable')
                return
            }
            
            // Test the same query as in the health endpoint
            const { data, error } = await supabase.from('users').select('id').limit(1)
            
            if (error) {
                console.log('❌ Health check failed:', error.message)
            } else {
                console.log('✅ Health check passed:', data?.length || 0, 'users found')
            }
        } else {
            console.log('Using SQLite for health check...')
            // SQLite test would go here
        }
        
    } catch (error) {
        console.error('❌ Health check failed:', error)
    }
}

testHealthEndpoint()
