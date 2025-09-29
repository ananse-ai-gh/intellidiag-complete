import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_DICOM_BUCKET || 'dicom-images';

// GET /api/dicom/wado-rs/studies/{studyInstanceUID}/series/{seriesInstanceUID}/instances/{sopInstanceUID} - Get DICOM instance
export async function GET(
    request: NextRequest,
    { params }: { params: { studyInstanceUID: string; seriesInstanceUID: string; sopInstanceUID: string } }
) {
    try {
        const { studyInstanceUID, seriesInstanceUID, sopInstanceUID } = params;

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

        // Construct file path based on DICOM hierarchy
        const filePath = `dicom/${studyInstanceUID}/${seriesInstanceUID}/${sopInstanceUID}.dcm`;

        // Get the file from Supabase Storage
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .download(filePath);

        if (error) {
            console.error('Error downloading DICOM file:', error);
            return NextResponse.json({ status: 'error', message: 'DICOM file not found' }, { status: 404 });
        }

        // Convert blob to buffer
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Return the DICOM file with proper headers
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/dicom',
                'Content-Disposition': `attachment; filename="${sopInstanceUID}.dcm"`,
                'Content-Length': buffer.length.toString(),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

    } catch (error) {
        console.error('Error retrieving DICOM instance:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error retrieving DICOM instance',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
