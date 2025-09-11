import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    } catch (error) {
        return null;
    }
};

// GET /api/dashboard
export async function GET(request: NextRequest) {
    try {
        // For now, make authentication optional for testing
        const user = verifyToken(request);

        // If no user is authenticated, we'll still return data (for testing)
        // In production, you should require authentication
        if (!user) {
            console.log('No authenticated user found, proceeding without authentication');
        }

        // Get dashboard statistics using hybrid database
        const stats = await hybridDb.getDashboardStats() as {
            totalUsers: number;
            totalPatients: number;
            totalScans: number;
            totalAnalyses: number;
        };

        // Get recent scans
        const recentScans = await hybridDb.getAllScans();
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