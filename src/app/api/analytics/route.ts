import { NextRequest, NextResponse } from 'next/server';
import { getRow, getAll } from '@/lib/database';
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
        return jwt.verify(token, JWT_SECRET) as { id: number };
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

        // Get total counts
        const totalPatients = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM patients WHERE isActive = 1');
        const totalScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status != "archived"');
        const totalUsers = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE isActive = 1');
        const pendingScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status = "pending"');
        const completedScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status = "completed"');

        // Get scans by type
        const scansByType = await getAll(`
            SELECT scanType, COUNT(*) as count
            FROM scans
            WHERE status != 'archived'
            GROUP BY scanType
            ORDER BY count DESC
        `);

        // Get scans by status
        const scansByStatus = await getAll(`
            SELECT status, COUNT(*) as count
            FROM scans
            WHERE status != 'archived'
            GROUP BY status
            ORDER BY count DESC
        `);

        // Get recent activity (last 7 days)
        const recentScans = await getAll(`
            SELECT s.*, p.firstName as patientFirstName, p.lastName as patientLastName, p.patientId
            FROM scans s
            LEFT JOIN patients p ON s.patientId = p.id
            WHERE s.createdAt >= datetime('now', '-7 days')
            ORDER BY s.createdAt DESC
            LIMIT 10
        `);

        // Get scans by month (last 6 months)
        const scansByMonth = await getAll(`
            SELECT 
                strftime('%Y-%m', createdAt) as month,
                COUNT(*) as count
            FROM scans
            WHERE createdAt >= datetime('now', '-6 months')
            GROUP BY month
            ORDER BY month DESC
        `);

        return NextResponse.json({
            status: 'success',
            data: {
                overview: {
                    totalPatients: totalPatients?.count || 0,
                    totalScans: totalScans?.count || 0,
                    totalUsers: totalUsers?.count || 0,
                    pendingScans: pendingScans?.count || 0,
                    completedScans: completedScans?.count || 0
                },
                scansByType,
                scansByStatus,
                recentScans,
                scansByMonth
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
