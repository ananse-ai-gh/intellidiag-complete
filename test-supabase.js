// Test script to check Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mjtsrvihapcvnvdrdrlk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdHNydmloYXBjdm52ZHJkcmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2Mjc3NTQsImV4cCI6MjA3MzIwMzc1NH0.-op_A8Cp8Q5xeybfgZM62fozsc-3F6MSe8gjwDAmAdQ'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdHNydmloYXBjdm52ZHJkcmxrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYyNzc1NCwiZXhwIjoyMDczMjAzNzU0fQ.o6GjHaz9GL6lbgL7Hty6wWTtFRnKfhngoUM3UyN1oq4'

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...')
    
    try {
        // Test with anon key
        console.log('\n1. Testing with anon key...')
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        const { data: anonData, error: anonError } = await supabase
            .from('users')
            .select('id')
            .limit(1)
        
        if (anonError) {
            console.log('❌ Anon key test failed:', anonError.message)
        } else {
            console.log('✅ Anon key test passed:', anonData?.length || 0, 'users found')
        }
        
        // Test with service role key
        console.log('\n2. Testing with service role key...')
        const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })
        
        const { data: serviceData, error: serviceError } = await supabaseService
            .from('users')
            .select('id')
            .limit(1)
        
        if (serviceError) {
            console.log('❌ Service role key test failed:', serviceError.message)
        } else {
            console.log('✅ Service role key test passed:', serviceData?.length || 0, 'users found')
        }
        
        // Test table structure
        console.log('\n3. Testing table structure...')
        const { data: tableData, error: tableError } = await supabaseService
            .from('users')
            .select('*')
            .limit(1)
        
        if (tableError) {
            console.log('❌ Table structure test failed:', tableError.message)
        } else {
            console.log('✅ Table structure test passed')
            if (tableData && tableData.length > 0) {
                console.log('   Sample user fields:', Object.keys(tableData[0]))
            } else {
                console.log('   No users found in table')
            }
        }
        
        // Test all tables
        console.log('\n4. Testing all tables...')
        const tables = ['users', 'patients', 'scans', 'analyses']
        
        for (const table of tables) {
            const { data, error } = await supabaseService
                .from(table)
                .select('id')
                .limit(1)
            
            if (error) {
                console.log(`❌ Table '${table}' test failed:`, error.message)
            } else {
                console.log(`✅ Table '${table}' test passed`)
            }
        }
        
        console.log('\n🎉 Supabase connection test completed!')
        
    } catch (error) {
        console.error('❌ Connection test failed:', error)
    }
}

testSupabaseConnection()
