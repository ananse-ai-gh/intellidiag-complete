import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper function to verify Supabase session
const verifyToken = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch (error) {
        return null;
    }
};

// GET /api/queue - Get scan queue
export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get pending scans
        const { data: pendingScans, error } = await supabase
            .from('scans')
            .select(`
                *,
                patients!inner(*)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        // Transform to expected format
        const queue = pendingScans?.map(scan => ({
            id: scan.id,
            scanId: scan.id,
            patientId: scan.patient_id,
            patientName: `${scan.patients.first_name} ${scan.patients.last_name}`,
            scanType: scan.scan_type,
            bodyPart: scan.body_part,
            priority: scan.priority,
            status: scan.status,
            createdAt: scan.created_at,
            estimatedTime: null // Could be calculated based on scan type
        })) || [];

        return NextResponse.json({
            status: 'success',
            data: {
                queue,
                total: queue.length,
                estimatedWaitTime: queue.length * 5 // 5 minutes per scan estimate
            }
        });

    } catch (error) {
        console.error('Get queue error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching queue' },
            { status: 500 }
        );
    }
}
