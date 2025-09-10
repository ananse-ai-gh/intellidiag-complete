import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { scanQueueManager } from '@/services/scanQueueManager';

// GET /api/queue/stats - Get queue statistics
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
        }

        const user = await verifyToken(token);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const queueStats = await scanQueueManager.getQueueStats();

        return NextResponse.json({
            success: true,
            data: { queueStats }
        });
    } catch (error) {
        console.error('Error fetching queue stats:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch queue stats' }, { status: 500 });
    }
}
