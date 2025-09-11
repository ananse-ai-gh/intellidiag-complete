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

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get existing scans that don't have failed status
        const allScans = await hybridDb.getAllScans();
        const scans = allScans.filter(scan => scan.status !== 'failed').slice(0, 3);

        if (scans.length === 0) {
            return NextResponse.json(
                { status: 'error', message: 'No scans found to convert to failed status' },
                { status: 404 }
            );
        }

        // Convert some analyses to failed status for testing
        let convertedCount = 0;
        for (const scan of scans.slice(0, 2)) { // Convert first 2 scans
            // Update AI analysis status to failed
            const analyses = await hybridDb.getAnalysesByScanId(scan.id);
            if (analyses.length > 0) {
                await hybridDb.updateAnalysis(analyses[0].id, {
                    status: 'failed',
                    confidence: 0,
                    result: {}
                });
            }

            // Update scan status to failed
            await hybridDb.updateScan(scan.id, {
                status: 'failed'
            });

            convertedCount++;
        }

        return NextResponse.json({
            status: 'success',
            message: `Converted ${convertedCount} analyses to failed status for testing`,
            data: {
                convertedCount
            }
        });

    } catch (error) {
        console.error('Error creating failed analyses:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating failed analyses', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}