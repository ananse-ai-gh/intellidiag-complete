import { NextRequest, NextResponse } from 'next/server';
import { getRow, runQuery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { aiAnalysisService } from '@/services/aiAnalysisService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/scans/[id]/analyze - Start AI analysis for a scan
export async function POST(
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

        // Check if scan exists (try both id and scanId)
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

        // Use the correct ID for database operations
        const dbId = scan.id;

        // Get scan image
        const scanImage = await getRow('SELECT * FROM scan_images WHERE scanId = ?', [dbId]);
        if (!scanImage) {
            return NextResponse.json(
                { status: 'error', message: 'Scan image not found' },
                { status: 404 }
            );
        }

        // Update scan status to analyzing
        await runQuery(
            'UPDATE scans SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            ['analyzing', dbId]
        );

        // Update or create AI analysis record
        const existingAnalysis = await getRow('SELECT * FROM ai_analysis WHERE scanId = ?', [dbId]);
        if (existingAnalysis) {
            await runQuery(
                'UPDATE ai_analysis SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE scanId = ?',
                ['processing', dbId]
            );
        } else {
            await runQuery(
                'INSERT INTO ai_analysis (scanId, status, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                [dbId, 'processing']
            );
        }

        // Start AI analysis in background
        processAnalysisInBackground(dbId, scanImage.url, scan.scanType, scan.bodyPart);

        return NextResponse.json({
            status: 'success',
            message: 'AI analysis started successfully',
            data: {
                scanId,
                status: 'analyzing',
                estimatedTime: '30-60 seconds'
            }
        });

    } catch (error) {
        console.error('Error starting analysis:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error starting analysis',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Background processing function
async function processAnalysisInBackground(scanId: number, imagePath: string, scanType: string, bodyPart: string) {
    try {
        const startTime = Date.now();

        // Read image file
        const imageBuffer = await readFile(join(process.cwd(), 'public', imagePath));
        const imageFile = new File([new Uint8Array(imageBuffer)], 'scan.jpg', { type: 'image/jpeg' });

        // Perform AI analysis
        const analysisResult = await aiAnalysisService.performAnalysis(imageFile, scanType, bodyPart);

        // Generate LLM report if analysis was successful
        let llmReport = null;
        if (analysisResult) {
            try {
                llmReport = await aiAnalysisService.generateLLMReport(analysisResult);
            } catch (error) {
                console.error('LLM report generation failed:', error);
            }
        }

        const processingTime = Date.now() - startTime;

        // Update scan status to completed
        await runQuery(
            'UPDATE scans SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            ['completed', scanId]
        );

        // Update AI analysis with results
        await runQuery(
            `UPDATE ai_analysis SET 
                status = ?, 
                confidence = ?, 
                findings = ?, 
                recommendations = ?,
                processingTime = ?,
                modelVersion = ?,
                updatedAt = CURRENT_TIMESTAMP 
            WHERE scanId = ?`,
            [
                'completed',
                analysisResult?.confidence || 0,
                analysisResult?.findings || JSON.stringify(analysisResult),
                llmReport?.report || analysisResult?.recommendations || '',
                processingTime,
                'v1.0',
                scanId
            ]
        );

        console.log(`Analysis completed for scan ${scanId} in ${processingTime}ms`);

    } catch (error) {
        console.error(`Error in background analysis for scan ${scanId}:`, error);

        // Update scan status to failed
        await runQuery(
            'UPDATE scans SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            ['failed', scanId]
        );

        // Update AI analysis status to failed
        await runQuery(
            'UPDATE ai_analysis SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE scanId = ?',
            ['failed', scanId]
        );
    }
}
