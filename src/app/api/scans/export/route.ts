import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
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

        // Build Supabase query
        const supabase = createServerSupabaseClient();
        let query = supabase
            .from('scans')
            .select(`
                *,
                patients!inner(*),
                analyses(*)
            `);

        if (ids) {
            const idArray = ids.split(',').map(id => id.trim());
            query = query.in('id', idArray);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (scanType) {
            query = query.eq('scan_type', scanType);
        }

        const { data: scans, error } = await query.order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

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
            scan.id,
            `${scan.patients.first_name} ${scan.patients.last_name}`,
            scan.patients.id,
            scan.scan_type,
            scan.body_part,
            scan.created_at,
            scan.priority,
            scan.status,
            scan.confidence ? `${scan.confidence}%` : 'N/A',
            scan.findings || 'N/A',
            scan.findings || 'N/A',
            `${scan.users.first_name} ${scan.users.last_name}`,
            scan.created_at
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