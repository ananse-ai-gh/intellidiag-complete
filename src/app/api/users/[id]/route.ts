import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
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

        const userId = params.id;
        if (!userId) {
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

        const userData = await hybridDb.getUserById(userId);

        if (!userData) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: userData.id,
                    email: userData.email,
                    firstName: userData.first_name,
                    lastName: userData.last_name,
                    role: userData.role,
                    specialization: userData.specialization,
                    licenseNumber: userData.licenseNumber,
                    isActive: userData.isActive,
                    lastLogin: userData.lastLogin,
                    profileImage: userData.profileImage,
                    createdAt: userData.created_at,
                    updatedAt: userData.updated_at
                }
            }
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

        const userId = params.id;
        if (!userId) {
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
        const existingUser = await hybridDb.getUserById(userId);
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
        const emailCheck = await hybridDb.getUserByEmail(email);
        if (emailCheck && emailCheck.id !== userId) {
            return NextResponse.json(
                { status: 'error', message: 'Email already exists' },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            specialization: specialization,
            licenseNumber: licenseNumber
        };

        // Only admin can change role
        if (user.role === 'admin' && role) {
            updateData.role = role as 'admin' | 'doctor' | 'radiologist' | 'patient';
        }

        // Update password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        // Update user
        const updatedUser = await hybridDb.updateUser(userId, updateData);

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    role: updatedUser.role,
                    specialization: updatedUser.specialization,
                    licenseNumber: updatedUser.licenseNumber,
                    isActive: updatedUser.isActive,
                    lastLogin: updatedUser.lastLogin,
                    profileImage: updatedUser.profileImage,
                    createdAt: updatedUser.created_at,
                    updatedAt: updatedUser.updated_at
                }
            }
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

        const userId = params.id;
        if (!userId) {
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
        const existingUser = await hybridDb.getUserById(userId);
        if (!existingUser) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        // Soft delete - set isActive to false
        await hybridDb.updateUser(userId, {
            isActive: false
        });

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