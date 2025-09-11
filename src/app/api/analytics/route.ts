import { NextRequest, NextResponse } from 'next/server';
import { supabaseDb } from '@/lib/supabaseDatabase';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
        return null;
    }
};

// GET /api/analytics
export async function GET(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get dashboard stats using Supabase
        const stats = await supabaseDb.getDashboardStats();

        // Get scans by type
        const { data: scansByType } = await supabaseDb.client
            .from('scans')
            .select('scan_type')
            .not('status', 'eq', 'archived');

        const scansByTypeCount = scansByType?.reduce((acc: any, scan: any) => {
            acc[scan.scan_type] = (acc[scan.scan_type] || 0) + 1;
            return acc;
        }, {}) || {};

        // Get scans by status
        const { data: scansByStatus } = await supabaseDb.client
            .from('scans')
            .select('status')
            .not('status', 'eq', 'archived');

        const scansByStatusCount = scansByStatus?.reduce((acc: any, scan: any) => {
            acc[scan.status] = (acc[scan.status] || 0) + 1;
            return acc;
        }, {}) || {};

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentScans } = await supabaseDb.client
            .from('scans')
            .select(`
                *,
                patients!inner(*)
            `)
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);

        // Get scans by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: scansByMonth } = await supabaseDb.client
            .from('scans')
            .select('created_at')
            .gte('created_at', sixMonthsAgo.toISOString());

        const scansByMonthCount = scansByMonth?.reduce((acc: any, scan: any) => {
            const month = new Date(scan.created_at).toISOString().substring(0, 7);
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {}) || {};

        return NextResponse.json({
            status: 'success',
            data: {
                overview: {
                    totalPatients: stats.totalPatients,
                    totalScans: stats.totalScans,
                    totalUsers: stats.totalUsers,
                    pendingScans: stats.totalScans, // You might want to add a specific query for this
                    completedScans: stats.totalScans // You might want to add a specific query for this
                },
                scansByType: Object.entries(scansByTypeCount).map(([type, count]) => ({
                    scanType: type,
                    count
                })),
                scansByStatus: Object.entries(scansByStatusCount).map(([status, count]) => ({
                    status,
                    count
                })),
                recentScans: recentScans || [],
                scansByMonth: Object.entries(scansByMonthCount).map(([month, count]) => ({
                    month,
                    count
                }))
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching analytics' },
            { status: 500 }
        );
    }
}