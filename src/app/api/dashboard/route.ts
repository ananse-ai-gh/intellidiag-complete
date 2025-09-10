import { NextRequest, NextResponse } from 'next/server';
import { getRow, getAll } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
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

        // Get overview statistics
        const totalPatients = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM patients WHERE isActive = 1');
        const totalScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status != "archived"');
        const pendingScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status = "pending"');
        const completedScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status = "completed"');
        const criticalScans = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE priority = "urgent" AND status != "completed"');
        const activeCases = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans WHERE status IN ("pending", "analyzing")');

        // Get recent scans with patient and analysis data
        const recentScans = await getAll(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId,
                u.firstName as uploadedByFirstName,
                u.lastName as uploadedByLastName,
                ai.confidence,
                ai.findings as aiFindings,
                ai.status as aiStatus
            FROM scans s
            LEFT JOIN patients p ON s.patientId = p.id
            LEFT JOIN users u ON s.uploadedById = u.id
            LEFT JOIN ai_analysis ai ON s.id = ai.scanId
            WHERE s.status != 'archived'
            ORDER BY s.createdAt DESC
            LIMIT 10
        `);

        // Get recent cases (scans with status)
        const recentCases = await getAll(`
            SELECT 
                s.scanId,
                s.status,
                s.priority,
                s.scanType,
                s.bodyPart,
                s.createdAt,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId
            FROM scans s
            LEFT JOIN patients p ON s.patientId = p.id
            WHERE s.status != 'archived'
            ORDER BY s.createdAt DESC
            LIMIT 5
        `);

        // Get AI model statistics
        const aiModelStats = await getAll(`
            SELECT 
                scanType,
                COUNT(*) as totalScans,
                AVG(ai.confidence) as avgConfidence,
                AVG(ai.processingTime) as avgProcessingTime,
                COUNT(CASE WHEN ai.status = 'completed' THEN 1 END) as completedAnalyses,
                COUNT(CASE WHEN DATE(ai.createdAt) = DATE('now') THEN 1 END) as scansToday
            FROM scans s
            LEFT JOIN ai_analysis ai ON s.id = ai.scanId
            WHERE s.status != 'archived'
            GROUP BY scanType
            ORDER BY totalScans DESC
        `);

        // Get scans by status for charts
        const scansByStatus = await getAll(`
            SELECT status, COUNT(*) as count
            FROM scans
            WHERE status != 'archived'
            GROUP BY status
            ORDER BY count DESC
        `);

        // Get scans by type for charts
        const scansByType = await getAll(`
            SELECT scanType, COUNT(*) as count
            FROM scans
            WHERE status != 'archived'
            GROUP BY scanType
            ORDER BY count DESC
        `);

        // Get monthly scan trends (last 6 months)
        const monthlyTrends = await getAll(`
            SELECT 
                strftime('%Y-%m', createdAt) as month,
                COUNT(*) as count
            FROM scans
            WHERE createdAt >= datetime('now', '-6 months')
            GROUP BY month
            ORDER BY month DESC
        `);

        // Get most recent scan for "Previously Viewed Scan"
        const lastViewedScan = await getRow(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId,
                ai.confidence,
                ai.findings as aiFindings,
                ai.status as aiStatus
            FROM scans s
            LEFT JOIN patients p ON s.patientId = p.id
            LEFT JOIN ai_analysis ai ON s.id = ai.scanId
            WHERE s.status = 'completed'
            ORDER BY s.updatedAt DESC
            LIMIT 1
        `);

        return NextResponse.json({
            status: 'success',
            data: {
                overview: {
                    totalPatients: totalPatients?.count || 0,
                    totalScans: totalScans?.count || 0,
                    pendingScans: pendingScans?.count || 0,
                    completedScans: completedScans?.count || 0,
                    criticalCases: criticalScans?.count || 0,
                    activeCases: activeCases?.count || 0
                },
                recentScans,
                recentCases,
                aiModelStats,
                scansByStatus,
                scansByType,
                monthlyTrends,
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
