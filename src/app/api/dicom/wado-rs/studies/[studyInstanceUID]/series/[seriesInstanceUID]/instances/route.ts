import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'scan-images';

// GET /api/dicom/wado-rs/studies/{studyInstanceUID}/series/{seriesInstanceUID}/instances - Get instances metadata
export async function GET(
    request: NextRequest,
    { params }: { params: { studyInstanceUID: string; seriesInstanceUID: string } }
) {
    try {
        const { studyInstanceUID, seriesInstanceUID } = params;

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

        // For now, return mock instances data
        const instancesData = [
            {
                "0020000D": {
                    "vr": "UI",
                    "Value": [studyInstanceUID]
                },
                "0020000E": {
                    "vr": "UI",
                    "Value": [seriesInstanceUID]
                },
                "00080018": {
                    "vr": "UI",
                    "Value": ["1.2.3.4.5.6.7.8.9.12"]
                },
                "00080016": {
                    "vr": "UI",
                    "Value": ["1.2.840.10008.5.1.4.1.1.2"]
                },
                "00080060": {
                    "vr": "CS",
                    "Value": ["CT"]
                },
                "00200013": {
                    "vr": "IS",
                    "Value": ["1"]
                },
                "00280010": {
                    "vr": "US",
                    "Value": [512]
                },
                "00280011": {
                    "vr": "US",
                    "Value": [512]
                },
                "00280008": {
                    "vr": "IS",
                    "Value": [1]
                }
            }
        ];

        return NextResponse.json(instancesData);

    } catch (error) {
        console.error('Error fetching instances:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error fetching instances',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
