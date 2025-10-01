import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/dicom/test-bucket - Test if DICOM bucket exists and is accessible
export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Testing DICOM bucket access');

        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ status: 'error', message: 'Authentication required' }, { status: 401 });
        }

        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user) {
            return NextResponse.json({ status: 'error', message: 'Invalid authentication' }, { status: 401 });
        }

        const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_DICOM_BUCKET || 'dicom-images';

        console.log(`📦 Testing bucket: ${STORAGE_BUCKET}`);

        // Test bucket access by listing files
        const { data: files, error: listError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list('', { limit: 1 });

        if (listError) {
            console.error('❌ Bucket access error:', listError);
            return NextResponse.json({
                status: 'error',
                message: `Bucket access failed: ${listError.message}`,
                details: {
                    bucket: STORAGE_BUCKET,
                    error: listError.message,
                    code: listError.statusCode
                }
            }, { status: 500 });
        }

        // Test upload permissions with a small test file
        const testContent = Buffer.from('test-dicom-file');
        const testPath = `test/test-${Date.now()}.txt`;

        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(testPath, testContent, {
                contentType: 'text/plain',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload test error:', uploadError);
            return NextResponse.json({
                status: 'error',
                message: `Upload test failed: ${uploadError.message}`,
                details: {
                    bucket: STORAGE_BUCKET,
                    error: uploadError.message,
                    code: uploadError.statusCode
                }
            }, { status: 500 });
        }

        // Clean up test file
        await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([testPath]);

        console.log('✅ Bucket test successful');

        return NextResponse.json({
            status: 'success',
            message: 'DICOM bucket is accessible and ready',
            data: {
                bucket: STORAGE_BUCKET,
                filesCount: files?.length || 0,
                user: user.id
            }
        });

    } catch (error) {
        console.error('Error testing DICOM bucket:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error testing DICOM bucket',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
