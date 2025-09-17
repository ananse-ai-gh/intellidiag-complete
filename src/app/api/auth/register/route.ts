import { NextRequest, NextResponse } from 'next/server';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { hybridDb } from '@/lib/hybridDatabase';

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

        // Check if using Supabase Auth
        const useSupabase = process.env.USE_SUPABASE === 'true' || process.env.NODE_ENV === 'production';

        if (useSupabase) {
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

            // Get user profile
            const userProfile = await supabaseAuth.getUserProfile(result.user?.id || '');

            return NextResponse.json({
                status: 'success',
                data: {
                    user: userProfile ? {
                        id: userProfile.id,
                        email: userProfile.email,
                        firstName: userProfile.first_name,
                        lastName: userProfile.last_name,
                        role: userProfile.role,
                        specialization: userProfile.specialization,
                        licenseNumber: userProfile.licenseNumber,
                        isActive: userProfile.isActive,
                        createdAt: userProfile.created_at
                    } : null,
                    session: result.session,
                    message: 'User created successfully. Please check your email for verification.'
                }
            }, { status: 201 });

        } else {
            // Fallback to custom JWT auth for development
            const existingUser = await hybridDb.getUserByEmail(email);
            if (existingUser) {
                return NextResponse.json(
                    { status: 'error', message: 'User with this email already exists' },
                    { status: 400 }
                );
            }

            // Create new user with custom auth
            const user = await hybridDb.createUser({
                email,
                first_name: firstName,
                last_name: lastName,
                role: role || 'patient',
                password: password, // Note: In production, this should be hashed
                specialization,
                licenseNumber,
                isActive: true
            });

            // Generate JWT token for development
            const jwt = require('jsonwebtoken');
            const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return NextResponse.json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        role: user.role,
                        specialization: user.specialization,
                        licenseNumber: user.licenseNumber,
                        isActive: user.isActive,
                        createdAt: user.created_at
                    },
                    token
                }
            }, { status: 201 });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating user' },
            { status: 500 }
        );
    }
}