import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// GET /api/health
export async function GET() {
    try {
        // Test database connection
        await new Promise((resolve, reject) => {
            db.get('SELECT 1', (err) => {
                if (err) reject(err);
                else resolve(true);
            });
        });

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
