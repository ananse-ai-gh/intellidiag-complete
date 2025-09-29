import { NextRequest, NextResponse } from 'next/server';
import { scanQueueManager } from '@/services/scanQueueManager';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper function to verify Supabase session
const verifyToken = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch (error) {
        return null;
    }
};

// POST /api/queue/clear - Clear the processing queue
export async function POST(request: NextRequest) {
    try {
        console.log('🧹 Queue clear API called');

        // Verify authentication
        const user = await verifyToken(request);
        if (!user) {
            console.log('❌ Authentication failed');
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log('✅ User authenticated:', user.id);

        // Clear the queue
        await scanQueueManager.clearQueue();

        return NextResponse.json({
            status: 'success',
            message: 'Queue cleared successfully'
        });

    } catch (error) {
        console.error('Error clearing queue:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error clearing queue',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
