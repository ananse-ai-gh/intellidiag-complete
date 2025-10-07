import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabaseProfilesDatabase';
import { createServerSupabaseClient } from '@/lib/supabase';

const verifySupabaseSession = async (request: NextRequest) => {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return user;
    } catch (error) {
        return null;
    }
};

// GET /api/scans/[id]/export - Export analysis results
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const user = await verifySupabaseSession(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'pdf';
        const imageIndex = parseInt(searchParams.get('imageIndex') || '0');

        // Get scan data
        const scan = await db.getScanById(scanId);
        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Get analysis data
        const analyses = await db.getAnalysesByScanId(scanId);
        const analysis = analyses.find(a => a.image_index === imageIndex);

        if (!analysis || analysis.status !== 'completed') {
            return NextResponse.json(
                { status: 'error', message: 'No completed analysis found' },
                { status: 404 }
            );
        }

        // Get patient data
        const patient = await db.getPatientById(scan.patient_id);

        // Prepare export data
        const exportData = {
            scan: {
                id: scan.id,
                scanType: scan.scan_type,
                bodyPart: scan.body_part,
                priority: scan.priority,
                status: scan.status,
                createdAt: scan.created_at,
                analysisType: scan.analysis_type
            },
            patient: patient ? {
                firstName: patient.first_name,
                lastName: patient.last_name,
                dateOfBirth: patient.date_of_birth,
                gender: patient.gender,
                phone: patient.phone,
                email: patient.email
            } : null,
            analysis: {
                id: analysis.id,
                analysisType: analysis.analysis_type,
                status: analysis.status,
                confidence: analysis.confidence,
                createdAt: analysis.created_at,
                updatedAt: analysis.updated_at,
                result: analysis.result
            },
            metadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: user.id,
                format: format
            }
        };

        // Generate export based on format
        switch (format) {
            case 'json':
                return NextResponse.json(exportData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Disposition': `attachment; filename="analysis-${scanId}-${imageIndex}.json"`
                    }
                });

            case 'csv':
                const csvData = generateCSV(exportData);
                return new NextResponse(csvData, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="analysis-${scanId}-${imageIndex}.csv"`
                    }
                });

            case 'pdf':
                // For PDF, we'll return the data and let the frontend handle PDF generation
                return NextResponse.json({
                    status: 'success',
                    data: exportData,
                    message: 'PDF generation should be handled on the frontend'
                });

            default:
                return NextResponse.json(
                    { status: 'error', message: 'Unsupported export format' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error exporting analysis:', error);
        return NextResponse.json(
            { status: 'error', message: 'Failed to export analysis' },
            { status: 500 }
        );
    }
}

// Helper function to generate CSV data
function generateCSV(data: any): string {
    const headers = [
        'Scan ID',
        'Patient Name',
        'Scan Type',
        'Analysis Type',
        'Status',
        'Confidence',
        'Primary Finding',
        'SSIM Score',
        'Quality Assessment',
        'Created At',
        'Updated At'
    ];

    const patientName = data.patient ? `${data.patient.firstName} ${data.patient.lastName}` : 'Unknown';
    const primaryFinding = data.analysis.result?.detected_case || data.analysis.result?.findings || '';
    const ssimScore = data.analysis.result?.ssim || '';
    const qualityAssessment = data.analysis.result?.ssim != null ?
        (Number(data.analysis.result.ssim) >= 0.9 ? 'Excellent' :
            Number(data.analysis.result.ssim) >= 0.8 ? 'Good' :
                Number(data.analysis.result.ssim) >= 0.7 ? 'Fair' : 'Poor') : '';

    const row = [
        data.scan.id,
        patientName,
        data.scan.scanType,
        data.scan.analysisType,
        data.analysis.status,
        data.analysis.confidence || '',
        primaryFinding,
        ssimScore,
        qualityAssessment,
        data.analysis.createdAt,
        data.analysis.updatedAt
    ];

    return [headers.join(','), row.map(field => `"${field}"`).join(',')].join('\n');
}
