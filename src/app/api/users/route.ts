import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

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

// GET /api/users
export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';

        // Get all users (profiles)
        let allProfiles = await db.getAllProfiles();

        // Get auth user data for each profile to get names and email
        const usersWithAuthData = await Promise.all(
            allProfiles.map(async (profile) => {
                try {
                    const { data: { user }, error } = await supabase.auth.admin.getUserById(profile.id);
                    if (error || !user) {
                        return {
                            ...profile,
                            email: 'unknown@example.com',
                            firstName: 'Unknown',
                            lastName: 'User'
                        };
                    }
                    return {
                        ...profile,
                        email: user.email || 'unknown@example.com',
                        firstName: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Unknown',
                        lastName: user.user_metadata?.last_name || ''
                    };
                } catch (error) {
                    return {
                        ...profile,
                        email: 'unknown@example.com',
                        firstName: 'Unknown',
                        lastName: 'User'
                    };
                }
            })
        );

        // Apply filters
        let filteredUsers = usersWithAuthData;
        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);

        // Transform to expected format
        const users = paginatedUsers.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            specialization: user.specialization,
            licenseNumber: user.licensenumber,
            isActive: user.isactive,
            lastLogin: user.lastlogin,
            createdAt: user.created_at
        }));

        const total = filteredUsers.length;

        return NextResponse.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching users' },
            { status: 500 }
        );
    }
}

// POST /api/users
export async function POST(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { email, password, firstName, lastName, role, specialization, licenseNumber } = body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists in Supabase auth
        try {
            const { data: { users }, error } = await supabase.auth.admin.listUsers();
            if (error) throw error;

            const existingUser = users?.find((user: any) => user.email === email);
            if (existingUser) {
                return NextResponse.json(
                    { status: 'error', message: 'User with this email already exists' },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.error('Error checking existing user:', error);
            return NextResponse.json(
                { status: 'error', message: 'Error checking user existence' },
                { status: 500 }
            );
        }

        // Create new user in Supabase auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                role: role || 'patient',
                specialization,
                licenseNumber
            },
            email_confirm: true // Auto-confirm email for development
        });

        if (authError) {
            console.error('Error creating auth user:', authError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create user account' },
                { status: 500 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { status: 'error', message: 'Failed to create user account' },
                { status: 500 }
            );
        }

        // Create profile in profiles table
        const newProfile = await db.createProfile({
            id: authData.user.id,
            role: role as 'admin' | 'doctor' | 'radiologist' | 'patient' || 'patient',
            specialization,
            licensenumber: licenseNumber,
            isactive: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: newProfile.id,
                    email: authData.user.email,
                    firstName: firstName,
                    lastName: lastName,
                    role: newProfile.role,
                    specialization: newProfile.specialization,
                    licenseNumber: newProfile.licensenumber,
                    isActive: newProfile.isactive,
                    createdAt: newProfile.created_at
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating user' },
            { status: 500 }
        );
    }
}