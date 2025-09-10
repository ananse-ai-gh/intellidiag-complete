import { NextRequest, NextResponse } from 'next/server';
import { getRow, runQuery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

// GET /api/scans/[id] - Get a specific scan
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

        // Get scan with patient and AI analysis details
        const scan = await getRow(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId as patientIdNumber,
                u.firstName as uploadedByFirstName,
                u.lastName as uploadedByLastName,
                aa.status as aiStatus,
                aa.confidence,
                aa.findings as aiFindings
            FROM scans s
            JOIN patients p ON s.patientId = p.id
            JOIN users u ON s.uploadedById = u.id
            LEFT JOIN ai_analysis aa ON s.id = aa.scanId
            WHERE s.id = ?
        `, [scanId]);

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: { scan }
        });

    } catch (error) {
        console.error('Error fetching scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error fetching scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT /api/scans/[id] - Update a specific scan
export async function PUT(
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
        const body = await request.json();
        const { scanType, bodyPart, priority, notes, scanDate } = body;

        // Validate required fields
        if (!scanType || !bodyPart) {
            return NextResponse.json(
                { status: 'error', message: 'Scan type and body part are required' },
                { status: 400 }
            );
        }

        // Update scan in database
        await runQuery(
            `UPDATE scans SET 
                scanType = ?, 
                bodyPart = ?, 
                priority = ?, 
                notes = ?, 
                scanDate = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [scanType, bodyPart, priority || 'medium', notes || '', scanDate, scanId]
        );

        // Get the updated scan
        const updatedScan = await getRow(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId as patientIdNumber,
                u.firstName as uploadedByFirstName,
                u.lastName as uploadedByLastName,
                aa.status as aiStatus,
                aa.confidence,
                aa.findings as aiFindings
            FROM scans s
            JOIN patients p ON s.patientId = p.id
            JOIN users u ON s.uploadedById = u.id
            LEFT JOIN ai_analysis aa ON s.id = aa.scanId
            WHERE s.id = ?
        `, [scanId]);

        return NextResponse.json({
            status: 'success',
            message: 'Scan updated successfully',
            data: { scan: updatedScan }
        });

    } catch (error) {
        console.error('Error updating scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error updating scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// DELETE /api/scans/[id] - Delete a specific scan
export async function DELETE(
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
        const scan = await getRow('SELECT * FROM scans WHERE id = ?', [scanId]);
        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Delete AI analysis first (foreign key constraint)
        await runQuery('DELETE FROM ai_analysis WHERE scanId = ?', [scanId]);

        // Delete the scan
        await runQuery('DELETE FROM scans WHERE id = ?', [scanId]);

        return NextResponse.json({
            status: 'success',
            message: 'Scan deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error deleting scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}


