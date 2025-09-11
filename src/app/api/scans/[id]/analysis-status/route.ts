import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
        return null;
    }
};

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

        // Get scan data
        const scan = await hybridDb.getScanById(scanId);

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Get analysis data
        const analyses = await hybridDb.getAnalysesByScanId(scanId);
        const analysis = analyses[0]; // Get the first analysis

        return NextResponse.json({
            status: 'success',
            data: {
                scanStatus: scan.status,
                analysisStatus: analysis?.status || 'pending',
                confidence: analysis?.confidence,
                findings: analysis?.result?.findings || '',
                recommendations: analysis?.result?.recommendations || '',
                processingTime: 0, // Will be populated with actual processing time
                modelVersion: 'v2.1', // Will be populated with actual model version
                updatedAt: analysis?.updated_at || scan.updated_at
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