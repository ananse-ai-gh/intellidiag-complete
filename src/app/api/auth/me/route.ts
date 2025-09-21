import { NextRequest, NextResponse } from 'next/server';
import { supabase, createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/auth/me
export async function GET(request: NextRequest) {
    try {
        console.log('🔍 /api/auth/me endpoint called');

        const authHeader = request.headers.get('authorization');
        console.log('Auth header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No valid auth header');
            return NextResponse.json(
                { status: 'error', message: 'No token provided' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        console.log('Token length:', token.length);

        // Verify Supabase session
        console.log('🔍 Verifying Supabase session...');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            console.log('❌ Supabase auth error:', error.message);
            return NextResponse.json(
                { status: 'error', message: 'Invalid session' },
                { status: 401 }
            );
        }

        if (!user) {
            console.log('❌ No user returned from Supabase');
            return NextResponse.json(
                { status: 'error', message: 'Invalid session' },
                { status: 401 }
            );
        }

        console.log('✅ Supabase user verified:', user.id, user.email);

        // Use service-role client to bypass RLS for profile lookup
        const admin = createServerSupabaseClient();

        // Get user profile from profiles table (linked via foreign key)
        console.log('🔍 Looking up profile for user ID (admin client):', user.id);
        const { data: userProfile, error: profileError } = await admin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.log('❌ Profile lookup error:', profileError.message);
            console.log('Profile error details:', profileError);
            return NextResponse.json(
                { status: 'error', message: 'User profile not found' },
                { status: 404 }
            );
        }

        if (!userProfile) {
            console.log('❌ No profile found for user ID:', user.id);
            return NextResponse.json(
                { status: 'error', message: 'User profile not found' },
                { status: 404 }
            );
        }

        console.log('✅ Profile found:', userProfile.id, userProfile.role, userProfile.isactive);

        if (!userProfile.isactive) {
            console.log('❌ User profile is inactive');
            return NextResponse.json(
                { status: 'error', message: 'User account is inactive' },
                { status: 401 }
            );
        }

        console.log('✅ Returning user data successfully');
        return NextResponse.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.user_metadata?.first_name || user.email.split('@')[0],
                    lastName: user.user_metadata?.last_name || '',
                    role: userProfile.role,
                    specialization: userProfile.specialization || '',
                    licenseNumber: userProfile.licensenumber || '',
                    isActive: userProfile.isactive,
                    createdAt: user.created_at
                }
            }
        });

    } catch (error) {
        console.error('❌ Get user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Invalid token' },
            { status: 401 }
        );
    }
}