const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkScanSchema() {
    console.log('🔍 Checking scans table schema...');

    try {
        // Try to get a sample scan and see what columns exist
        const { data: scans, error: scansError } = await supabase
            .from('scans')
            .select('*')
            .limit(1);

        if (scansError) {
            console.error('❌ Error fetching scans:', scansError);
            return;
        }

        if (scans && scans.length > 0) {
            const scan = scans[0];
            console.log('📊 Sample scan columns:');
            Object.keys(scan).forEach(key => {
                console.log(`  - ${key}: ${typeof scan[key]} (${scan[key]})`);
            });

            // Check specifically for the user column
            if (scan.created_by) {
                console.log('✅ Found created_by column');
            } else if (scan.uploadedbyid) {
                console.log('✅ Found uploadedbyid column');
            } else {
                console.log('❌ Neither created_by nor uploadedbyid found');
            }
        } else {
            console.log('⚠️ No scans found to check schema');
        }

    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

checkScanSchema();
