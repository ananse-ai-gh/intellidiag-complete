import { NextRequest, NextResponse } from 'next/server';
import { getRow, runQuery } from '@/lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    } catch (error) {
        return null;
    }
};

// GET /api/users/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Only allow users to view their own profile or admin to view any profile
        if (user.id !== userId && user.role !== 'admin') {
            return NextResponse.json(
                { status: 'error', message: 'Forbidden' },
                { status: 403 }
            );
        }

        const userData = await getRow<{
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            specialization?: string;
            licenseNumber?: string;
            isActive: boolean;
            lastLogin?: string;
            profileImage?: string;
            createdAt: string;
            updatedAt: string;
        }>(
            'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, lastLogin, profileImage, createdAt, updatedAt FROM users WHERE id = ? AND isActive = 1',
            [userId]
        );

        if (!userData) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: { user: userData }
        });

    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching user' },
            { status: 500 }
        );
    }
}

// PUT /api/users/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Only allow users to update their own profile or admin to update any profile
        if (user.id !== userId && user.role !== 'admin') {
            return NextResponse.json(
                { status: 'error', message: 'Forbidden' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            role,
            specialization,
            licenseNumber,
            password
        } = body;

        // Check if user exists
        const existingUser = await getRow('SELECT id FROM users WHERE id = ? AND isActive = 1', [userId]);
        if (!existingUser) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        // Validation
        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if email is already taken by another user
        const emailCheck = await getRow('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
        if (emailCheck) {
            return NextResponse.json(
                { status: 'error', message: 'Email already exists' },
                { status: 400 }
            );
        }

        // Only admin can change role
        const updateData: any = {
            firstName,
            lastName,
            email,
            specialization,
            licenseNumber,
            updatedAt: 'CURRENT_TIMESTAMP'
        };

        if (user.role === 'admin' && role) {
            updateData.role = role;
        }

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Build dynamic update query
        const updateFields = Object.keys(updateData)
            .filter(key => key !== 'updatedAt')
            .map(key => `${key} = ?`)
            .join(', ');

        const updateValues = Object.keys(updateData)
            .filter(key => key !== 'updatedAt')
            .map(key => updateData[key]);

        await runQuery(
            `UPDATE users SET ${updateFields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            [...updateValues, userId]
        );

        // Get the updated user
        const userData = await getRow<{
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            specialization?: string;
            licenseNumber?: string;
            isActive: boolean;
            lastLogin?: string;
            profileImage?: string;
            createdAt: string;
            updatedAt: string;
        }>(
            'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, lastLogin, profileImage, createdAt, updatedAt FROM users WHERE id = ?',
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            data: { user: userData }
        });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error updating user' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(params.id);
        if (isNaN(userId)) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Only admin can delete users
        if (user.role !== 'admin') {
            return NextResponse.json(
                { status: 'error', message: 'Forbidden' },
                { status: 403 }
            );
        }

        // Prevent admin from deleting themselves
        if (user.id === userId) {
            return NextResponse.json(
                { status: 'error', message: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await getRow('SELECT id FROM users WHERE id = ? AND isActive = 1', [userId]);
        if (!existingUser) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        // Soft delete - set isActive to 0
        await runQuery(
            'UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        return NextResponse.json({
            status: 'success',
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error deleting user' },
            { status: 500 }
        );
    }
}
