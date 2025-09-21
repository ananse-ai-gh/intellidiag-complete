import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabaseProfilesDatabase';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper function to verify Supabase session
const verifySupabaseSession = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;

        // Get user profile to check role and active status
        const profile = await db.getProfileById(user.id);
        if (!profile || !profile.isactive) return null;

        return { user, profile };
    } catch (error) {
        return null;
    }
};

// GET /api/scans/[id] - Get a specific scan
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;

        // Get scan with patient and AI analysis details
        const scan = await db.getScanById(scanId);

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Get patient details
        const patient = await db.getPatientById(scan.patient_id);

        // Get AI analysis details
        const analyses = await db.getAnalysesByScanId(scanId);
        const analysis = analyses[0];

        // Transform to expected format
        const scanData = {
            id: scan.id,
            scanId: scan.id,
            patientId: scan.patient_id,
            scanType: scan.scan_type,
            bodyPart: scan.body_part,
            priority: scan.priority,
            status: scan.status,
            notes: '',
            scanDate: scan.created_at,
            createdAt: scan.created_at,
            updatedAt: scan.updated_at,
            patientFirstName: patient?.first_name || '',
            patientLastName: patient?.last_name || '',
            patientIdNumber: patient?.id || '',
            uploadedByFirstName: 'User',
            uploadedByLastName: 'Name',
            aiStatus: analysis?.status || 'pending',
            confidence: analysis?.confidence || 0,
            aiFindings: analysis?.result?.findings || ''
        };

        return NextResponse.json({
            status: 'success',
            data: { scan: scanData }
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
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
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
        const updatedScan = await db.updateScan(scanId, {
            scan_type: scanType,
            body_part: bodyPart,
            priority: priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium'
        });

        // Get patient details
        const patient = await db.getPatientById(updatedScan.patient_id);

        // Get AI analysis details
        const analyses = await db.getAnalysesByScanId(scanId);
        const analysis = analyses[0];

        // Transform to expected format
        const scanData = {
            id: updatedScan.id,
            scanId: updatedScan.id,
            patientId: updatedScan.patient_id,
            scanType: updatedScan.scan_type,
            bodyPart: updatedScan.body_part,
            priority: updatedScan.priority,
            status: updatedScan.status,
            notes: notes || '',
            scanDate: scanDate || updatedScan.created_at,
            createdAt: updatedScan.created_at,
            updatedAt: updatedScan.updated_at,
            patientFirstName: patient?.first_name || '',
            patientLastName: patient?.last_name || '',
            patientIdNumber: patient?.id || '',
            uploadedByFirstName: 'User',
            uploadedByLastName: 'Name',
            aiStatus: analysis?.status || 'pending',
            confidence: analysis?.confidence || 0,
            aiFindings: analysis?.result?.findings || ''
        };

        return NextResponse.json({
            status: 'success',
            message: 'Scan updated successfully',
            data: { scan: scanData }
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
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;

        // Check if scan exists
        const scan = await db.getScanById(scanId);
        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Delete AI analysis first (foreign key constraint)
        const analyses = await db.getAnalysesByScanId(scanId);
        for (const analysis of analyses) {
            // Note: We don't have a deleteAnalysis method in db yet
            // This would need to be implemented if needed
        }

        // Archive the scan
        await db.updateScan(scanId, { status: 'archived' });

        return NextResponse.json({
            status: 'success',
            message: 'Scan archived successfully'
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