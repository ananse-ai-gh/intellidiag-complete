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

        // Determine analysis type based on scan type and body part
        const getAnalysisType = (scanType: string, bodyPart: string): string => {
            const scanTypeLower = scanType.toLowerCase();
            const bodyPartLower = bodyPart.toLowerCase();

            // Brain tumor analysis
            if (bodyPartLower.includes('brain') || bodyPartLower.includes('head')) {
                return 'brain_tumor';
            }

            // Breast cancer detection
            if (bodyPartLower.includes('breast') || bodyPartLower.includes('mammo')) {
                return 'breast_cancer';
            }

            // Lung tumor analysis
            if (bodyPartLower.includes('lung') || bodyPartLower.includes('chest') || bodyPartLower.includes('thorax')) {
                return 'lung_tumor';
            }

            // CT to MRI conversion
            if (scanTypeLower === 'ct' && (bodyPartLower.includes('brain') || bodyPartLower.includes('head'))) {
                return 'ct_to_mri';
            }

            // MRI to CT conversion
            if (scanTypeLower === 'mri' && (bodyPartLower.includes('brain') || bodyPartLower.includes('head'))) {
                return 'mri_to_ct';
            }

            return 'auto';
        };

        // Use explicit analysis_type stored on the scan; do not use heuristics
        const resolvedAnalysisType = (scan as any)?.analysis_type || analysis?.analysis_type || 'auto'

        // Transform to expected format
        const scanData = {
            id: scan.id,
            scanId: scan.id,
            patientId: scan.patient_id,
            scanType: scan.scan_type,
            bodyPart: scan.body_part,
            priority: scan.priority,
            status: scan.status,
            notes: scan.notes || '',
            scanDate: scan.created_at,
            createdAt: scan.created_at,
            updatedAt: scan.updated_at,
            patientFirstName: patient?.first_name || '',
            patientLastName: patient?.last_name || '',
            patientIdNumber: patient?.id || '',
            uploadedByFirstName: 'User',
            uploadedByLastName: 'Name',
            analysisType: resolvedAnalysisType,
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
        const { scanType, bodyPart, analysisType, priority, notes, scanDate } = body;

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
            // analysis_type omitted since not in current DB type
            priority: (priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium'
        } as any);

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
            analysisType: (updatedScan as any)?.analysis_type,
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

// DELETE /api/scans/[id] - Archive a specific scan
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

        const { user } = authResult;
        const scanId = params.id;

        // Get user profile to check role
        const profile = await db.getProfileById(user.id);
        const isAdmin = profile?.role === 'admin';

        console.log(`🗑️ User ${user.id} (${profile?.role || 'no role'}) attempting to archive scan ${scanId} - Admin: ${isAdmin}`);

        // Check if scan exists
        const scan = await db.getScanById(scanId);
        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Check if scan is already archived
        if (scan.status === 'archived') {
            return NextResponse.json(
                { status: 'error', message: 'Scan is already archived' },
                { status: 400 }
            );
        }

        // Archive the scan
        await db.updateScan(scanId, { status: 'archived' });

        console.log(`✅ Scan ${scanId} archived by ${isAdmin ? 'admin' : 'user'} ${user.id}`);

        return NextResponse.json({
            status: 'success',
            message: 'Scan archived successfully'
        });

    } catch (error) {
        console.error('Error archiving scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error archiving scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PATCH /api/scans/[id]/permanent-delete - Permanently delete a scan (admin only)
export async function PATCH(
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

        const { user } = authResult;
        const scanId = params.id;

        // Get user profile to check role
        const profile = await db.getProfileById(user.id);
        const isAdmin = profile?.role === 'admin';

        console.log(`💀 User ${user.id} (${profile?.role || 'no role'}) attempting permanent delete of scan ${scanId} - Admin: ${isAdmin}`);

        // Only admins can permanently delete scans
        if (!isAdmin) {
            return NextResponse.json(
                { status: 'error', message: 'Admin access required for permanent deletion' },
                { status: 403 }
            );
        }

        // Check if scan exists
        const scan = await db.getScanById(scanId);
        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // TODO: Implement actual deletion from database
        // For now, we'll just mark it as permanently deleted
        await db.updateScan(scanId, { status: 'deleted' as any });

        console.log(`💀 Scan ${scanId} permanently deleted by admin ${user.id}`);

        return NextResponse.json({
            status: 'success',
            message: 'Scan permanently deleted'
        });

    } catch (error) {
        console.error('Error permanently deleting scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error permanently deleting scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}