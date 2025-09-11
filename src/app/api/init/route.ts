import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/init
export async function POST() {
    try {
        await initDatabase();

        return NextResponse.json({
            status: 'success',
            message: 'Database initialized successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Database initialization error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to initialize database',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
