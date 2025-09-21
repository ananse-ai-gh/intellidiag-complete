import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
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

// GET /api/dashboard
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const { user, profile } = authResult;

        // Get dashboard statistics using Supabase database
        const stats = await db.getDashboardStats() as {
            totalUsers: number;
            totalPatients: number;
            totalScans: number;
            totalAnalyses: number;
        };

        // Get recent scans
        const recentScans = await db.getAllScans();
        const recentScansLimited = recentScans.slice(0, 10);

        // Get recent cases (scans with status)
        const recentCases = recentScans
            .filter(scan => scan.status !== 'archived')
            .slice(0, 5)
            .map(scan => ({
                scanId: scan.id,
                status: scan.status,
                priority: scan.priority,
                scanType: scan.scan_type,
                bodyPart: scan.body_part,
                createdAt: scan.created_at,
                patientFirstName: 'Patient', // Will be populated with join
                patientLastName: 'Name',
                patientId: scan.patient_id
            }));

        // Get scans by status for charts
        const scansByStatus = recentScans.reduce((acc: any, scan: any) => {
            acc[scan.status] = (acc[scan.status] || 0) + 1;
            return acc;
        }, {});

        // Get scans by type for charts
        const scansByType = recentScans.reduce((acc: any, scan: any) => {
            acc[scan.scan_type] = (acc[scan.scan_type] || 0) + 1;
            return acc;
        }, {});

        // Get monthly scan trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyTrends = recentScans
            .filter(scan => new Date(scan.created_at) >= sixMonthsAgo)
            .reduce((acc: any, scan: any) => {
                const month = new Date(scan.created_at).toISOString().substring(0, 7);
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

        // Get most recent completed scan
        const lastViewedScan = recentScans
            .filter(scan => scan.status === 'completed')
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

        return NextResponse.json({
            status: 'success',
            data: {
                overview: {
                    totalPatients: stats.totalPatients,
                    totalScans: stats.totalScans,
                    pendingScans: recentScans.filter(s => s.status === 'pending').length,
                    completedScans: recentScans.filter(s => s.status === 'completed').length,
                    criticalCases: recentScans.filter(s => s.priority === 'urgent' && s.status !== 'completed').length,
                    activeCases: recentScans.filter(s => ['pending', 'processing'].includes(s.status)).length
                },
                recentScans: recentScansLimited,
                recentCases,
                aiModelStats: [], // Will be populated with actual AI analysis data
                scansByStatus: Object.entries(scansByStatus).map(([status, count]) => ({ status, count })),
                scansByType: Object.entries(scansByType).map(([scanType, count]) => ({ scanType, count })),
                monthlyTrends: Object.entries(monthlyTrends).map(([month, count]) => ({ month, count })),
                lastViewedScan
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error fetching dashboard data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}