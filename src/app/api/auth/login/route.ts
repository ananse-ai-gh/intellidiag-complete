import { NextRequest, NextResponse } from 'next/server';
import { supabaseAuth } from '@/lib/supabaseAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/auth/login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // Use Supabase Auth service
        const result = await supabaseAuth.signIn({ email, password });

        if (result.error) {
            return NextResponse.json(
                { status: 'error', message: 'Incorrect email or password' },
                { status: 401 }
            );
        }

        if (!result.user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication failed' },
                { status: 401 }
            );
        }

        // Get user profile from profiles table
        const userProfile = await supabaseAuth.getUserProfile(result.user.id);

        if (!userProfile) {
            return NextResponse.json(
                { status: 'error', message: 'User profile not found. Please contact administrator.' },
                { status: 404 }
            );
        }

        if (!userProfile.isactive) {
            return NextResponse.json(
                { status: 'error', message: 'Account is deactivated' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.user_metadata?.first_name || result.user.email.split('@')[0],
                    lastName: result.user.user_metadata?.last_name || '',
                    role: userProfile.role,
                    specialization: userProfile.specialization,
                    licenseNumber: userProfile.licensenumber,
                    isActive: userProfile.isactive,
                    createdAt: result.user.created_at
                },
                session: result.session
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error' },
            { status: 500 }
        );
    }
}