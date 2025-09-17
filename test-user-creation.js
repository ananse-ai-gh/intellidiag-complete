// Test user creation with Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mjtsrvihapcvnvdrdrlk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdHNydmloYXBjdm52ZHJkcmxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYyNzc1NCwiZXhwIjoyMDczMjAzNzU0fQ.o6GjHaz9GL6lbgL7Hty6wWTtFRnKfhngoUM3UyN1oq4'

async function testUserCreation() {
    console.log('🔍 Testing user creation with Supabase...')
    
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
        
        // Test user creation (similar to what the API does)
        const testUser = {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'patient',
            password: 'hashedpassword123',
            specialization: 'General Medicine',
            licenseNumber: 'LIC123456',
            isActive: true
        }
        
        console.log('Creating test user...')
        const { data, error } = await supabase
            .from('users')
            .insert(testUser)
            .select()
            .single()
        
        if (error) {
            console.log('❌ User creation failed:', error.message)
            console.log('Error details:', error)
        } else {
            console.log('✅ User creation successful!')
            console.log('Created user:', data)
            
            // Clean up - delete the test user
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', data.id)
            
            if (deleteError) {
                console.log('⚠️ Could not delete test user:', deleteError.message)
            } else {
                console.log('✅ Test user cleaned up')
            }
        }
        
        // Test getting user by email
        console.log('\nTesting getUserByEmail...')
        const { data: existingUser, error: getError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'admin@intellidiag.com')
            .single()
        
        if (getError) {
            console.log('❌ getUserByEmail failed:', getError.message)
        } else {
            console.log('✅ getUserByEmail successful!')
            console.log('Found user:', existingUser)
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

testUserCreation()
