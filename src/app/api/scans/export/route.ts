import { NextRequest, NextResponse } from 'next/server';
import { getRow } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/scans/export - Export scans to CSV
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');
        const status = searchParams.get('status');
        const scanType = searchParams.get('scanType');

        // Build query
        let query = `
            SELECT 
                s.scanId,
                s.scanType,
                s.bodyPart,
                s.scanDate,
                s.priority,
                s.status,
                s.notes,
                s.createdAt,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId as patientIdNumber,
                u.firstName as uploadedByFirstName,
                u.lastName as uploadedByLastName,
                aa.confidence,
                aa.findings as aiFindings
            FROM scans s
            JOIN patients p ON s.patientId = p.id
            JOIN users u ON s.uploadedById = u.id
            LEFT JOIN ai_analysis aa ON s.id = aa.scanId
        `;

        const whereConditions = [];
        const queryParams = [];

        if (ids) {
            const idArray = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (idArray.length > 0) {
                whereConditions.push(`s.id IN (${idArray.map(() => '?').join(',')})`);
                queryParams.push(...idArray);
            }
        }

        if (status) {
            whereConditions.push('s.status = ?');
            queryParams.push(status);
        }

        if (scanType) {
            whereConditions.push('s.scanType = ?');
            queryParams.push(scanType);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY s.createdAt DESC';

        // Execute query
        const scans = await getRow(query, queryParams);

        if (!scans || scans.length === 0) {
            return NextResponse.json(
                { status: 'error', message: 'No scans found to export' },
                { status: 404 }
            );
        }

        // Convert to CSV format
        const csvHeaders = [
            'Scan ID',
            'Patient Name',
            'Patient ID',
            'Scan Type',
            'Body Part',
            'Scan Date',
            'Priority',
            'Status',
            'AI Confidence',
            'AI Findings',
            'Notes',
            'Uploaded By',
            'Created Date'
        ];

        const csvRows = scans.map((scan: any) => [
            scan.scanId,
            `${scan.patientFirstName} ${scan.patientLastName}`,
            scan.patientIdNumber,
            scan.scanType,
            scan.bodyPart,
            scan.scanDate,
            scan.priority,
            scan.status,
            scan.confidence ? `${scan.confidence}%` : 'N/A',
            scan.aiFindings || 'N/A',
            scan.notes || 'N/A',
            `${scan.uploadedByFirstName} ${scan.uploadedByLastName}`,
            scan.createdAt
        ]);

        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create response with CSV content
        const response = new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="scans-export-${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

        return response;

    } catch (error) {
        console.error('Error exporting scans:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error exporting scans',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
