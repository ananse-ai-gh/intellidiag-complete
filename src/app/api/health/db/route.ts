export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
    try {
        // Always use Supabase now
        const supabase = createServerSupabaseClient()
        if (!supabase) {
            return NextResponse.json({ ok: false, engine: 'supabase', error: 'Supabase client unavailable' }, { status: 500 })
        }

        // Minimal, safe query to profiles table
        const { data, error } = await supabase.from('profiles').select('id').limit(1)
        if (error) {
            return NextResponse.json({ ok: false, engine: 'supabase', error: error.message }, { status: 500 })
        }
        return NextResponse.json({ ok: true, engine: 'supabase', sample: data?.length ?? 0 })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
    }
}


