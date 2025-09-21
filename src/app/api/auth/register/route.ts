import { NextRequest, NextResponse } from 'next/server';
import { supabaseAuth } from '@/lib/supabaseAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/auth/register
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, role, specialization, licenseNumber } = body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Use Supabase Auth for registration
        const result = await supabaseAuth.signUp({
            email,
            password,
            firstName,
            lastName,
            role: role || 'patient',
            specialization,
            licenseNumber
        });

        if (result.error) {
            return NextResponse.json(
                { status: 'error', message: result.error },
                { status: 400 }
            );
        }

        // Get user profile from profiles table
        const userProfile = await supabaseAuth.getUserProfile(result.user?.id || '');

        return NextResponse.json({
            status: 'success',
            data: {
                user: userProfile ? {
                    id: userProfile.id,
                    email: result.user?.email || '',
                    firstName: result.user?.user_metadata?.first_name || '',
                    lastName: result.user?.user_metadata?.last_name || '',
                    role: userProfile.role,
                    specialization: userProfile.specialization,
                    licenseNumber: userProfile.licensenumber,
                    isActive: userProfile.isactive,
                    createdAt: result.user?.created_at || ''
                } : null,
                session: result.session,
                message: 'User created successfully. Please check your email for verification.'
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating user' },
            { status: 500 }
        );
    }
}