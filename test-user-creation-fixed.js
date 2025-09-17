// Test user creation with correct column names
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mjtsrvihapcvnvdrdrlk.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdHNydmloYXBjdm52ZHJkcmxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYyNzc1NCwiZXhwIjoyMDczMjAzNzU0fQ.o6GjHaz9GL6lbgL7Hty6wWTtFRnKfhngoUM3UyN1oq4'

async function testUserCreationFixed() {
    console.log('🔍 Testing user creation with correct column names...')
    
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
        
        // Test user creation with lowercase column names (current DB state)
        const testUser = {
            email: 'test2@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'patient',
            password: 'hashedpassword123',
            specialization: 'General Medicine',
            licensenumber: 'LIC123456',  // lowercase
            isactive: true,              // lowercase
            profileimage: null          // lowercase
        }
        
        console.log('Creating test user with lowercase columns...')
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
        
        // Test the hybrid database service logic
        console.log('\nTesting hybrid database service logic...')
        
        // Simulate what the hybrid database does
        const userData = {
            email: 'test3@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'patient',
            password: 'hashedpassword123',
            specialization: 'General Medicine',
            licenseNumber: 'LIC123456',
            isActive: true
        }
        
        // Convert camelCase to lowercase for Supabase
        const supabaseUserData = {
            ...userData,
            isactive: userData.isActive,
            licensenumber: userData.licenseNumber,
            profileimage: userData.profileImage || null
        }
        
        // Remove camelCase fields
        delete supabaseUserData.isActive
        delete supabaseUserData.licenseNumber
        delete supabaseUserData.profileImage
        
        console.log('Creating user with converted data...')
        const { data: convertedData, error: convertedError } = await supabase
            .from('users')
            .insert(supabaseUserData)
            .select()
            .single()
        
        if (convertedError) {
            console.log('❌ Converted user creation failed:', convertedError.message)
        } else {
            console.log('✅ Converted user creation successful!')
            console.log('Created user:', convertedData)
            
            // Clean up
            await supabase.from('users').delete().eq('id', convertedData.id)
            console.log('✅ Converted test user cleaned up')
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

testUserCreationFixed()
