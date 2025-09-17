// Test Supabase after column name fix
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mjtsrvihapcvnvdrdrlk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdHNydmloYXBjdm52ZHJkcmxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYyNzc1NCwiZXhwIjoyMDczMjAzNzU0fQ.o6GjHaz9GL6lbgL7Hty6wWTtFRnKfhngoUM3UyN1oq4'

async function testAfterColumnFix() {
    console.log('🔍 Testing Supabase after column name fix...')
    
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
        
        // Test user creation with camelCase column names (should work now)
        const testUser = {
            email: 'test-fixed@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'patient',
            password: 'hashedpassword123',
            specialization: 'General Medicine',
            licenseNumber: 'LIC123456',  // camelCase
            isActive: true,              // camelCase
            profileImage: null          // camelCase
        }
        
        console.log('Creating test user with camelCase columns...')
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
            
            // Test the hybrid database service logic (should work without conversion now)
            console.log('\nTesting hybrid database service logic...')
            
            const userData = {
                email: 'test-hybrid@example.com',
                first_name: 'Test',
                last_name: 'User',
                role: 'patient',
                password: 'hashedpassword123',
                specialization: 'General Medicine',
                licenseNumber: 'LIC123456',
                isActive: true
            }
            
            // This should work directly now (no conversion needed)
            const { data: hybridData, error: hybridError } = await supabase
                .from('users')
                .insert(userData)
                .select()
                .single()
            
            if (hybridError) {
                console.log('❌ Hybrid user creation failed:', hybridError.message)
            } else {
                console.log('✅ Hybrid user creation successful!')
                console.log('Created user:', hybridData)
                
                // Clean up both test users
                await supabase.from('users').delete().eq('id', data.id)
                await supabase.from('users').delete().eq('id', hybridData.id)
                console.log('✅ Test users cleaned up')
            }
        }
        
        // Test getting existing user
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
            console.log('Found user with columns:', Object.keys(existingUser))
            console.log('Sample data:', {
                id: existingUser.id,
                email: existingUser.email,
                isActive: existingUser.isActive,
                licenseNumber: existingUser.licenseNumber,
                profileImage: existingUser.profileImage
            })
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

testAfterColumnFix()
