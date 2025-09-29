import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/urls/regenerate - Regenerate a short URL (delete old one and create new one)
export async function POST(request: NextRequest) {
    try {
        // Verify authentication using Supabase
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Verify the Supabase token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            console.error('❌ Authentication error:', authError);
            return NextResponse.json(
                { status: 'error', message: 'Invalid authentication token' },
                { status: 401 }
            );
        }

        console.log('✅ User authenticated for regeneration:', user.id);

        const body = await request.json();
        const { originalUrl, scanId } = body;

        if (!originalUrl || !scanId) {
            return NextResponse.json(
                { status: 'error', message: 'Original URL and scan ID are required' },
                { status: 400 }
            );
        }

        // Delete existing short URL for this scan
        console.log('🗑️ Deleting existing short URL for scan:', scanId);
        const { error: deleteError } = await supabase
            .from('short_urls')
            .delete()
            .eq('scan_id', scanId);

        if (deleteError) {
            console.error('❌ Error deleting existing short URL:', deleteError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to delete existing short URL' },
                { status: 500 }
            );
        }

        console.log('✅ Existing short URL deleted, creating new one...');

        // Generate a new short code
        const shortCode = crypto.randomBytes(4).toString('hex');

        // Determine base URL with proper fallback logic
        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (!baseUrl) {
            if (process.env.VERCEL_URL) {
                baseUrl = `https://${process.env.VERCEL_URL}`;
            } else {
                baseUrl = 'http://localhost:8001';
            }
        }

        const shortUrl = `${baseUrl}/s/${shortCode}`;

        console.log('🌐 New base URL determined:', {
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            VERCEL_URL: process.env.VERCEL_URL,
            finalBaseUrl: baseUrl,
            shortUrl
        });

        // Create new short URL
        console.log('📝 Creating new short URL with data:', {
            short_code: shortCode,
            original_url: originalUrl,
            scan_id: scanId,
            created_by: user.id,
            created_at: new Date().toISOString()
        });

        const { data, error } = await supabase
            .from('short_urls')
            .insert({
                short_code: shortCode,
                original_url: originalUrl,
                scan_id: scanId,
                created_by: user.id,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creating new short URL:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Failed to create new short URL',
                    details: error.message,
                    code: error.code,
                    hint: error.hint
                },
                { status: 500 }
            );
        }

        console.log('✅ New short URL created successfully:', data);

        return NextResponse.json({
            status: 'success',
            message: 'Short URL regenerated successfully',
            data: {
                shortUrl,
                shortCode,
                originalUrl,
                id: data.id,
                createdAt: data.created_at,
                isExisting: false,
                isRegenerated: true
            }
        });

    } catch (error) {
        console.error('Error regenerating short URL:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error regenerating short URL', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
