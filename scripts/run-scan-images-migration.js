const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    console.error('Current values:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Running scan_images table migration...');

    try {
        // Create scan_images table
        console.log('📊 Creating scan_images table...');
        const { error: createTableError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });

        if (createTableError) {
            console.error('❌ Failed to create table:', createTableError);
            process.exit(1);
        }

        console.log('✅ scan_images table created');

        // Create indexes
        console.log('📊 Creating indexes...');
        const { error: indexError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE INDEX IF NOT EXISTS idx_scan_images_scan_id ON scan_images(scan_id);
                CREATE INDEX IF NOT EXISTS idx_scan_images_image_index ON scan_images(scan_id, image_index);
            `
        });

        if (indexError) {
            console.warn('⚠️ Warning: Could not create indexes:', indexError);
        } else {
            console.log('✅ Indexes created');
        }

        // Enable RLS
        console.log('📊 Enabling RLS...');
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE scan_images ENABLE ROW LEVEL SECURITY;'
        });

        if (rlsError) {
            console.warn('⚠️ Warning: Could not enable RLS:', rlsError);
        } else {
            console.log('✅ RLS enabled');
        }

        // Create RLS policies
        console.log('📊 Creating RLS policies...');
        const policies = [
            {
                name: 'Users can view scan images for accessible scans',
                operation: 'SELECT',
                sql: `
                    CREATE POLICY "Users can view scan images for accessible scans" ON scan_images
                    FOR SELECT USING (
                        EXISTS (
                            SELECT 1 FROM scans s
                            WHERE s.id = scan_images.scan_id
                            AND s.created_by = auth.uid()
                        )
                    );
                `
            },
            {
                name: 'Users can insert scan images for accessible scans',
                operation: 'INSERT',
                sql: `
                    CREATE POLICY "Users can insert scan images for accessible scans" ON scan_images
                    FOR INSERT WITH CHECK (
                        EXISTS (
                            SELECT 1 FROM scans s
                            WHERE s.id = scan_images.scan_id
                            AND s.created_by = auth.uid()
                        )
                    );
                `
            },
            {
                name: 'Users can update scan images for accessible scans',
                operation: 'UPDATE',
                sql: `
                    CREATE POLICY "Users can update scan images for accessible scans" ON scan_images
                    FOR UPDATE USING (
                        EXISTS (
                            SELECT 1 FROM scans s
                            WHERE s.id = scan_images.scan_id
                            AND s.created_by = auth.uid()
                        )
                    );
                `
            },
            {
                name: 'Users can delete scan images for accessible scans',
                operation: 'DELETE',
                sql: `
                    CREATE POLICY "Users can delete scan images for accessible scans" ON scan_images
                    FOR DELETE USING (
                        EXISTS (
                            SELECT 1 FROM scans s
                            WHERE s.id = scan_images.scan_id
                            AND s.created_by = auth.uid()
                        )
                    );
                `
            }
        ];

        for (const policy of policies) {
            const { error: policyError } = await supabase.rpc('exec_sql', {
                sql: policy.sql
            });

            if (policyError) {
                console.warn(`⚠️ Warning: Could not create ${policy.name} policy:`, policyError);
            } else {
                console.log(`✅ ${policy.name} policy created`);
            }
        }

        console.log('✅ Migration completed successfully!');

        // Test the table creation
        const { data: testData, error: testError } = await supabase
            .from('scan_images')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Table test failed:', testError);
        } else {
            console.log('✅ Table test passed - scan_images table is accessible');
        }

    } catch (error) {
        console.error('❌ Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
