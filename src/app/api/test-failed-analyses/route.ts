import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getRow, runQuery } from '@/lib/database';

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
        const scans = await getRow(`
      SELECT s.* FROM scans s
      LEFT JOIN ai_analysis aa ON s.id = aa.scanId
      WHERE aa.status IS NOT NULL AND aa.status != 'failed'
      LIMIT 3
    `);

        if (!scans) {
            return NextResponse.json(
                { status: 'error', message: 'No scans found to convert to failed status' },
                { status: 404 }
            );
        }

        // Convert some analyses to failed status for testing
        const scanArray = Array.isArray(scans) ? scans : [scans];

        for (const scan of scanArray.slice(0, 2)) { // Convert first 2 scans
            // Update AI analysis status to failed
            await runQuery(
                'UPDATE ai_analysis SET status = ?, confidence = NULL, findings = NULL, updatedAt = CURRENT_TIMESTAMP WHERE scanId = ?',
                ['failed', scan.id]
            );

            // Update scan status to failed
            await runQuery(
                'UPDATE scans SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
                ['failed', scan.id]
            );
        }

        return NextResponse.json({
            status: 'success',
            message: `Converted ${Math.min(scanArray.length, 2)} analyses to failed status for testing`,
            data: {
                convertedCount: Math.min(scanArray.length, 2)
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
