import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const status = searchParams.get('status');
    const scanType = searchParams.get('scanType');

    // Get all scans with analyses using Supabase
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('scans')
      .select(`
        *,
        patients!inner(*),
        analyses!inner(*)
      `)
      .not('analyses.status', 'is', null);

    if (ids) {
      const idList = ids.split(',').map(id => id.trim());
      query = query.in('id', idList);
    }

    if (status) {
      query = query.eq('analyses.status', status);
    }

    if (scanType) {
      query = query.eq('scan_type', scanType);
    }

    const { data: analyses, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Convert to CSV format
    const csvHeaders = [
      'Scan ID',
      'Patient Name',
      'Patient ID',
      'Scan Type',
      'Body Part',
      'AI Status',
      'Confidence (%)',
      'AI Findings',
      'Scan Date',
      'Priority',
      'Notes',
      'Uploaded By',
      'Created At'
    ];

    const csvRows = analyses?.map((scan: any) => [
      scan.id,
      `${scan.patients.first_name} ${scan.patients.last_name}`,
      scan.patients.id,
      scan.scan_type,
      scan.body_part,
      scan.analyses.status,
      scan.analyses.confidence || 'N/A',
      scan.analyses.result?.findings || 'N/A',
      scan.created_at,
      scan.priority,
      scan.findings || 'N/A',
      `${scan.users.first_name} ${scan.users.last_name}`,
      scan.created_at
    ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `analysis-reports-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting analyses:', error);
    return NextResponse.json(
      { status: 'error', message: 'Error exporting analyses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}