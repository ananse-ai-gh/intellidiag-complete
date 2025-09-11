import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getRow } from '@/lib/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// GET /api/auth/me
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { status: 'error', message: 'No token provided' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

        // Get user data
        const user = await getRow(
            'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, createdAt FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: { user }
        });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Invalid token' },
            { status: 401 }
        );
    }
}
