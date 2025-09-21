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
        let allUsers = await db.getAllProfiles();

        // Apply filters
        if (search) {
            allUsers = allUsers.filter(user =>
                user.first_name.toLowerCase().includes(search.toLowerCase()) ||
                user.last_name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (role) {
            allUsers = allUsers.filter(user => user.role === role);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedUsers = allUsers.slice(offset, offset + limit);

        // Transform to expected format
        const users = paginatedUsers.map(user => ({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            specialization: user.specialization,
            licenseNumber: user.licenseNumber,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.created_at
        }));

        const total = allUsers.length;

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

        // Check if user already exists
        const existingUser = await db.getProfileByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { status: 'error', message: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user profile
        const newUser = await db.createProfile({
            email,
            first_name: firstName,
            last_name: lastName,
            role: role as 'admin' | 'doctor' | 'radiologist' | 'patient' || 'patient',
            password: hashedPassword,
            specialization,
            licenseNumber,
            isActive: true
        });

        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.first_name,
                    lastName: newUser.last_name,
                    role: newUser.role,
                    specialization: newUser.specialization,
                    licenseNumber: newUser.licenseNumber,
                    isActive: newUser.isActive,
                    createdAt: newUser.created_at
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