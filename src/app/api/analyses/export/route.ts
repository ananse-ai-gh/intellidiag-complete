import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAll } from '@/lib/database';

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

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const status = searchParams.get('status');
    const scanType = searchParams.get('scanType');

    // Build query with filters
    let query = `
      SELECT 
        s.*, p.firstName as patientFirstName, p.lastName as patientLastName,
        p.patientId as patientIdNumber, u.firstName as uploadedByFirstName,
        u.lastName as uploadedByLastName, aa.status as aiStatus,
        aa.confidence, aa.findings as aiFindings
      FROM scans s
      JOIN patients p ON s.patientId = p.id
      JOIN users u ON s.uploadedById = u.id
      LEFT JOIN ai_analysis aa ON s.id = aa.scanId
      WHERE aa.status IS NOT NULL
    `;
    
    const queryParams: any[] = [];
    
    if (ids) {
      const idList = ids.split(',').map(id => id.trim());
      query += ` AND s.scanId IN (${idList.map(() => '?').join(',')})`;
      queryParams.push(...idList);
    }
    
    if (status) {
      query += ` AND aa.status = ?`;
      queryParams.push(status);
    }
    
    if (scanType) {
      query += ` AND s.scanType = ?`;
      queryParams.push(scanType);
    }
    
    query += ` ORDER BY s.createdAt DESC`;

    const analyses = await getAll(query, queryParams);

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

    const csvRows = analyses.map((analysis: any) => [
      analysis.scanId,
      `${analysis.patientFirstName} ${analysis.patientLastName}`,
      analysis.patientIdNumber,
      analysis.scanType,
      analysis.bodyPart,
      analysis.aiStatus,
      analysis.confidence || 'N/A',
      analysis.aiFindings || 'N/A',
      analysis.scanDate,
      analysis.priority,
      analysis.notes || 'N/A',
      `${analysis.uploadedByFirstName} ${analysis.uploadedByLastName}`,
      analysis.createdAt
    ]);

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
