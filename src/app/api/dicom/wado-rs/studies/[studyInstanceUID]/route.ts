import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'scan-images';

// WADO-RS endpoints for DICOM retrieval

// GET /api/dicom/wado-rs/studies/{studyInstanceUID} - Get study metadata
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

        // For now, return mock study data
        // In a real implementation, you'd query your database for the study
        const studyData = {
            "0020000D": {
                "vr": "UI",
                "Value": [studyInstanceUID]
            },
            "00080020": {
                "vr": "DA",
                "Value": ["20240101"]
            },
            "00080030": {
                "vr": "TM",
                "Value": ["120000"]
            },
            "00080050": {
                "vr": "SH",
                "Value": ["STUDY001"]
            },
            "00080060": {
                "vr": "CS",
                "Value": ["CT"]
            },
            "00081030": {
                "vr": "LO",
                "Value": ["Chest CT"]
            },
            "00100010": {
                "vr": "PN",
                "Value": [{
                    "Alphabetic": "Doe^John"
                }]
            },
            "00100020": {
                "vr": "LO",
                "Value": ["12345"]
            }
        };

        return NextResponse.json(studyData);

    } catch (error) {
        console.error('Error fetching study:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error fetching study',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
