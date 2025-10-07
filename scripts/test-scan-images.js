const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testScanImages() {
    console.log('🧪 Testing scan_images table...');

    try {
        // Get a sample scan to test with
        const { data: scans, error: scansError } = await supabase
            .from('scans')
            .select('id, created_by')
            .limit(1);

        if (scansError) {
            console.error('❌ Error fetching scans:', scansError);
            return;
        }

        if (!scans || scans.length === 0) {
            console.log('⚠️ No scans found to test with');
            return;
        }

        const testScan = scans[0];
        console.log('📊 Testing with scan:', testScan.id);

        // Test inserting a record
        const { data: insertData, error: insertError } = await supabase
            .from('scan_images')
            .insert({
                scan_id: testScan.id,
                file_path: 'https://example.com/test-image.jpg',
                file_name: 'test-image.jpg',
                original_name: 'test-image.jpg',
                file_size: 1024,
                mime_type: 'image/jpeg',
                image_index: 0
            })
            .select()
            .single();

        if (insertError) {
            console.error('❌ Error inserting test record:', insertError);
            return;
        }

        console.log('✅ Test record inserted:', insertData.id);

        // Test querying the record
        const { data: queryData, error: queryError } = await supabase
            .from('scan_images')
            .select('*')
            .eq('scan_id', testScan.id);

        if (queryError) {
            console.error('❌ Error querying records:', queryError);
            return;
        }

        console.log('✅ Query successful, found', queryData.length, 'records');

        // Clean up test record
        const { error: deleteError } = await supabase
            .from('scan_images')
            .delete()
            .eq('id', insertData.id);

        if (deleteError) {
            console.warn('⚠️ Warning: Could not clean up test record:', deleteError);
        } else {
            console.log('✅ Test record cleaned up');
        }

        console.log('🎉 scan_images table is working correctly!');

    } catch (error) {
        console.error('❌ Error testing scan_images:', error);
    }
}

testScanImages();
