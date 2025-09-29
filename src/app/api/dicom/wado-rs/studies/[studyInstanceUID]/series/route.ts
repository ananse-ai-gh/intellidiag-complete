import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'scan-images';

// GET /api/dicom/wado-rs/studies/{studyInstanceUID}/series - Get series metadata
export async function GET(
    request: NextRequest,
    { params }: { params: { studyInstanceUID: string } }
) {
    try {
        const studyInstanceUID = params.studyInstanceUID;

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

        // For now, return mock series data
        const seriesData = [
            {
                "0020000D": {
                    "vr": "UI",
                    "Value": [studyInstanceUID]
                },
                "0020000E": {
                    "vr": "UI",
                    "Value": ["1.2.3.4.5.6.7.8.9.11"]
                },
                "00080060": {
                    "vr": "CS",
                    "Value": ["CT"]
                },
                "0008103E": {
                    "vr": "LO",
                    "Value": ["Axial CT"]
                },
                "00200011": {
                    "vr": "IS",
                    "Value": ["1"]
                },
                "00201209": {
                    "vr": "IS",
                    "Value": ["100"]
                }
            }
        ];

        return NextResponse.json(seriesData);

    } catch (error) {
        console.error('Error fetching series:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error fetching series',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
