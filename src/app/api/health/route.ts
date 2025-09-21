import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/health
export async function GET() {
    try {
        // Test database connection
        const isHealthy = await db.healthCheck();

        if (!isHealthy) {
            throw new Error('Database connection failed');
        }

        return NextResponse.json({
            status: 'success',
            message: 'API is healthy',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });

    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'API is unhealthy',
                timestamp: new Date().toISOString(),
                database: 'disconnected'
            },
            { status: 500 }
        );
    }
}