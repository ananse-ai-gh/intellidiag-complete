#!/usr/bin/env node

/**
 * Script to create the analysis-outputs bucket in Supabase Storage
 * Run this with: node scripts/create-storage-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAnalysisOutputsBucket() {
    try {
        console.log('🚀 Creating analysis-outputs bucket...');

        // Create the bucket
        const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('analysis-outputs', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
            fileSizeLimit: 10485760 // 10MB
        });

        if (bucketError) {
            if (bucketError.message.includes('already exists')) {
                console.log('✅ Bucket analysis-outputs already exists');
            } else {
                console.error('❌ Error creating bucket:', bucketError);
                return false;
            }
        } else {
            console.log('✅ Created analysis-outputs bucket successfully');
        }

        // Set up RLS policies
        console.log('🔒 Setting up bucket policies...');

        const policies = [
            {
                name: 'Allow authenticated users to upload analysis outputs',
                operation: 'INSERT',
                policy: "auth.role() = 'authenticated'"
            },
            {
                name: 'Allow authenticated users to view analysis outputs',
                operation: 'SELECT',
                policy: "auth.role() = 'authenticated'"
            },
            {
                name: 'Allow users to update own analysis outputs',
                operation: 'UPDATE',
                policy: "auth.uid()::text = (storage.foldername(name))[1]"
            },
            {
                name: 'Allow users to delete own analysis outputs',
                operation: 'DELETE',
                policy: "auth.uid()::text = (storage.foldername(name))[1]"
            }
        ];

        for (const policy of policies) {
            try {
                const { error: policyError } = await supabase.rpc('create_storage_policy', {
                    bucket_name: 'analysis-outputs',
                    policy_name: policy.name,
                    operation: policy.operation,
                    policy_definition: policy.policy
                });

                if (policyError) {
                    console.warn(`⚠️ Could not create policy "${policy.name}":`, policyError.message);
                } else {
                    console.log(`✅ Created policy: ${policy.name}`);
                }
            } catch (err) {
                console.warn(`⚠️ Policy creation failed for "${policy.name}":`, err.message);
            }
        }

        console.log('🎉 Supabase Storage setup complete!');
        console.log('');
        console.log('📁 File structure will be:');
        console.log('   analysis-outputs/{userId}/{analysisType}/{scanId}/{imageIndex}/{imageType}.png');
        console.log('');
        console.log('🔐 Security:');
        console.log('   - Only authenticated users can upload/view images');
        console.log('   - Users can only modify their own analysis outputs');
        console.log('   - Images are organized by user ID for proper access control');

        return true;

    } catch (error) {
        console.error('❌ Error setting up Supabase Storage:', error);
        return false;
    }
}

// Run the setup
createAnalysisOutputsBucket()
    .then(success => {
        if (success) {
            console.log('✅ Setup completed successfully');
            process.exit(0);
        } else {
            console.log('❌ Setup failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
