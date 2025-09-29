import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/urls/shorten - Create a short URL
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

        console.log('✅ User authenticated:', user.id);

        const body = await request.json();
        const { originalUrl, scanId } = body;

        if (!originalUrl) {
            return NextResponse.json(
                { status: 'error', message: 'Original URL is required' },
                { status: 400 }
            );
        }

        // Check if a short URL already exists for this scan
        console.log('🔍 Checking for existing short URL for scan:', scanId);
        const { data: existingUrl, error: checkError } = await supabase
            .from('short_urls')
            .select('*')
            .eq('scan_id', scanId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('❌ Error checking existing short URL:', checkError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to check existing short URL' },
                { status: 500 }
            );
        }

        // If a short URL already exists, return it
        if (existingUrl) {
            console.log('✅ Found existing short URL:', existingUrl.short_code);

            // Determine base URL for existing short URL
            let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
            if (!baseUrl) {
                if (process.env.VERCEL_URL) {
                    baseUrl = `https://${process.env.VERCEL_URL}`;
                } else {
                    baseUrl = 'http://localhost:8001';
                }
            }

            const shortUrl = `${baseUrl}/s/${existingUrl.short_code}`;

            return NextResponse.json({
                status: 'success',
                message: 'Existing short URL retrieved',
                data: {
                    shortUrl,
                    shortCode: existingUrl.short_code,
                    originalUrl: existingUrl.original_url,
                    id: existingUrl.id,
                    createdAt: existingUrl.created_at,
                    isExisting: true
                }
            });
        }

        console.log('📝 No existing short URL found, creating new one...');

        // Generate a short code
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

        console.log('🌐 Base URL determined:', {
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            VERCEL_URL: process.env.VERCEL_URL,
            finalBaseUrl: baseUrl,
            shortUrl
        });

        // Store in database
        console.log('📝 Creating short URL with data:', {
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
            console.error('❌ Error creating short URL:', error);
            console.error('❌ Error details:', JSON.stringify(error, null, 2));
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Failed to create short URL',
                    details: error.message,
                    code: error.code,
                    hint: error.hint
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'success',
            message: 'Short URL created successfully',
            data: {
                shortUrl,
                shortCode,
                originalUrl,
                id: data.id,
                createdAt: data.created_at,
                isExisting: false
            }
        });

    } catch (error) {
        console.error('Error creating short URL:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating short URL', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET /api/urls/shorten - Get short URL info
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const shortCode = searchParams.get('code');

        if (!shortCode) {
            return NextResponse.json(
                { status: 'error', message: 'Short code is required' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase
            .from('short_urls')
            .select('*')
            .eq('short_code', shortCode)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { status: 'error', message: 'Short URL not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: {
                shortCode: data.short_code,
                originalUrl: data.original_url,
                scanId: data.scan_id,
                createdAt: data.created_at
            }
        });

    } catch (error) {
        console.error('Error fetching short URL:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching short URL', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
