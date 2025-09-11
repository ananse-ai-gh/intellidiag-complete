import { NextRequest, NextResponse } from 'next/server';
import { getRow } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/scans/[id]/analysis-status - Get analysis status
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;

        // Get scan and analysis data
        let scan = await getRow('SELECT * FROM scans WHERE id = ?', [scanId]);
        if (!scan) {
            scan = await getRow('SELECT * FROM scans WHERE scanId = ?', [scanId]);
        }

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        const dbId = scan.id;
        const analysis = await getRow('SELECT * FROM ai_analysis WHERE scanId = ?', [dbId]);

        return NextResponse.json({
            status: 'success',
            data: {
                scanStatus: scan.status,
                analysisStatus: analysis?.status || 'pending',
                confidence: analysis?.confidence,
                findings: analysis?.findings,
                recommendations: analysis?.recommendations,
                processingTime: analysis?.processingTime,
                modelVersion: analysis?.modelVersion,
                updatedAt: analysis?.updatedAt
            }
        });

    } catch (error) {
        console.error('Error getting analysis status:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error getting analysis status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
