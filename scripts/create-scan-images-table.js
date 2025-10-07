const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createScanImagesTable() {
    console.log('🚀 Creating scan_images table...');

    try {
        // Test if table already exists
        const { data: existingTable, error: checkError } = await supabase
            .from('scan_images')
            .select('count')
            .limit(1);

        if (!checkError) {
            console.log('✅ scan_images table already exists');
            return;
        }

        console.log('📊 Table does not exist, creating it...');

        // Since we can't use exec_sql, we'll provide manual instructions
        console.log(`
❌ Cannot create table automatically - exec_sql function not available.

📋 MANUAL SETUP REQUIRED:

Please run the following SQL in your Supabase SQL Editor:

-- Create scan_images table
CREATE TABLE IF NOT EXISTS scan_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    image_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scan_images_scan_id ON scan_images(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_images_image_index ON scan_images(scan_id, image_index);

-- Enable RLS
ALTER TABLE scan_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view scan images for accessible scans" ON scan_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scans s
            WHERE s.id = scan_images.scan_id
            AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert scan images for accessible scans" ON scan_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM scans s
            WHERE s.id = scan_images.scan_id
            AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update scan images for accessible scans" ON scan_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM scans s
            WHERE s.id = scan_images.scan_id
            AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete scan images for accessible scans" ON scan_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM scans s
            WHERE s.id = scan_images.scan_id
            AND s.created_by = auth.uid()
        )
    );

📝 After running the SQL, test the table with:
SELECT * FROM scan_images LIMIT 1;
        `);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createScanImagesTable();
