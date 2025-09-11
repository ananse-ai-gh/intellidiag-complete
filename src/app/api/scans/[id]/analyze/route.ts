import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import jwt from 'jsonwebtoken';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { aiAnalysisService } from '@/services/aiAnalysisService';

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

        // Check if scan exists
        const scan = await hybridDb.getScanById(scanId);

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Update scan status to analyzing
        await hybridDb.updateScan(scanId, {
            status: 'processing'
        });

        // Update or create AI analysis record
        const existingAnalyses = await hybridDb.getAnalysesByScanId(scanId);
        if (existingAnalyses.length > 0) {
            await hybridDb.updateAnalysis(existingAnalyses[0].id, {
                status: 'processing'
            });
        } else {
            await hybridDb.createAnalysis({
                scan_id: scanId,
                analysis_type: 'ai_analysis',
                status: 'processing',
                confidence: 0,
                result: {}
            });
        }

        // Start AI analysis in background
        processAnalysisInBackground(scanId, scan.file_path, scan.scan_type, scan.body_part);

        return NextResponse.json({
            status: 'success',
            message: 'AI analysis started successfully',
            data: {
                scanId,
                status: 'processing',
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
async function processAnalysisInBackground(scanId: string, imagePath: string, scanType: string, bodyPart: string) {
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
        await hybridDb.updateScan(scanId, {
            status: 'completed'
        });

        // Update AI analysis with results
        const analyses = await hybridDb.getAnalysesByScanId(scanId);
        if (analyses.length > 0) {
            await hybridDb.updateAnalysis(analyses[0].id, {
                status: 'completed',
                confidence: analysisResult?.confidence || 0,
                result: {
                    findings: analysisResult?.findings || JSON.stringify(analysisResult),
                    recommendations: llmReport?.report || analysisResult?.recommendations || ''
                }
            });
        }

        console.log(`Analysis completed for scan ${scanId} in ${processingTime}ms`);

    } catch (error) {
        console.error(`Error in background analysis for scan ${scanId}:`, error);

        // Update scan status to failed
        await hybridDb.updateScan(scanId, {
            status: 'failed'
        });

        // Update AI analysis status to failed
        const analyses = await hybridDb.getAnalysesByScanId(scanId);
        if (analyses.length > 0) {
            await hybridDb.updateAnalysis(analyses[0].id, {
                status: 'failed'
            });
        }
    }
}