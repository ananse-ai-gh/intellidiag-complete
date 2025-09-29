import { NextResponse, NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /s/[code] - Redirect short URL to original URL
export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    try {
        const shortCode = params.code;

        if (!shortCode) {
            return NextResponse.redirect(new URL('/404', request.url));
        }

        // Look up the short URL in database
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase
            .from('short_urls')
            .select('original_url, scan_id')
            .eq('short_code', shortCode)
            .single();

        if (error || !data) {
            console.error('Short URL not found:', shortCode, error);
            return NextResponse.redirect(new URL('/404', request.url));
        }

        // Update access count (optional)
        await supabase
            .from('short_urls')
            .update({
                access_count: (data.access_count || 0) + 1,
                last_accessed: new Date().toISOString()
            })
            .eq('short_code', shortCode);

        // Redirect to original URL
        return NextResponse.redirect(data.original_url);

    } catch (error) {
        console.error('Error redirecting short URL:', error);
        return NextResponse.redirect(new URL('/404', request.url));
    }
}
