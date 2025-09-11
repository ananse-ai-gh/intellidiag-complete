import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { scanQueueManager } from '@/services/scanQueueManager';

// GET /api/queue/stats - Get queue statistics
export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
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
