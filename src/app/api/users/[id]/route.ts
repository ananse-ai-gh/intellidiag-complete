import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabaseProfilesDatabase';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper function to verify Supabase session
const verifySupabaseSession = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;

        // Get user profile to check role and active status
        const profile = await db.getProfileById(user.id);
        if (!profile || !profile.isactive) return null;

        return { user, profile };
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
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { user, profile } = authResult;
        const userId = params.id;
        if (!userId) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Only allow users to view their own profile or admin to view any profile
        if (user.id !== userId && profile.role !== 'admin') {
            return NextResponse.json(
                { status: 'error', message: 'Forbidden' },
                { status: 403 }
            );
        }

        const userProfile = await db.getProfileById(userId);

        if (!userProfile) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: userProfile.id,
                    email: user.email,
                    firstName: user.user_metadata?.first_name || user.email.split('@')[0],
                    lastName: user.user_metadata?.last_name || '',
                    role: userProfile.role,
                    specialization: userProfile.specialization,
                    licenseNumber: userProfile.licensenumber,
                    isActive: userProfile.isactive,
                    lastLogin: userProfile.lastlogin,
                    createdAt: user.created_at,
                    updatedAt: userProfile.updated_at
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
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { user, profile } = authResult;
        const userId = params.id;
        if (!userId) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Only allow users to update their own profile or admin to update any profile
        if (user.id !== userId && profile.role !== 'admin') {
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
            licenseNumber
        } = body;

        // Check if user exists
        const existingProfile = await db.getProfileById(userId);
        if (!existingProfile) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        // Validation
        if (!firstName || !lastName) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: any = {
            first_name: firstName,
            last_name: lastName,
            specialization: specialization,
            licensenumber: licenseNumber
        };

        // Only admin can change role
        if (profile.role === 'admin' && role) {
            updateData.role = role as 'admin' | 'doctor' | 'radiologist' | 'patient';
        }

        // Update profile
        const updatedProfile = await db.updateProfile(userId, updateData);

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: updatedProfile.id,
                    email: user.email,
                    firstName: user.user_metadata?.first_name || user.email.split('@')[0],
                    lastName: user.user_metadata?.last_name || '',
                    role: updatedProfile.role,
                    specialization: updatedProfile.specialization,
                    licenseNumber: updatedProfile.licensenumber,
                    isActive: updatedProfile.isactive,
                    lastLogin: updatedProfile.lastlogin,
                    createdAt: user.created_at,
                    updatedAt: updatedProfile.updated_at
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
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { user, profile } = authResult;
        const userId = params.id;
        if (!userId) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Only admin can delete users
        if (profile.role !== 'admin') {
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
        const existingProfile = await db.getProfileById(userId);
        if (!existingProfile) {
            return NextResponse.json(
                { status: 'error', message: 'User not found' },
                { status: 404 }
            );
        }

        // Soft delete - set isactive to false
        await db.updateProfile(userId, {
            isactive: false
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