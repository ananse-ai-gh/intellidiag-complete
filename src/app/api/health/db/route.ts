export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { NextResponse } from 'next/server'
import { createServerSupabaseClient, getSQLiteDb } from '@/lib/supabase'

export async function GET() {
    try {
        const useSupabase = process.env.USE_SUPABASE === 'true' || process.env.NODE_ENV === 'production'

        if (useSupabase) {
            const supabase = typeof createServerSupabaseClient === 'function' ? createServerSupabaseClient() : null
            if (!supabase) {
                return NextResponse.json({ ok: false, engine: 'supabase', error: 'Supabase client unavailable' }, { status: 500 })
            }

            // Minimal, safe query
            const { data, error } = await supabase.from('users').select('id').limit(1)
            if (error) {
                return NextResponse.json({ ok: false, engine: 'supabase', error: error.message }, { status: 500 })
            }
            return NextResponse.json({ ok: true, engine: 'supabase', sample: data?.length ?? 0 })
        }

        // SQLite path (development)
        const db = getSQLiteDb()
        if (!db) {
            return NextResponse.json({ ok: false, engine: 'sqlite', error: 'SQLite unavailable' }, { status: 500 })
        }

        const rowCount = await new Promise<number>((resolve, reject) => {
            db.get('SELECT 1 as ok', [], (err, row: any) => {
                if (err) return reject(err)
                resolve(row ? 1 : 0)
            })
        })

        return NextResponse.json({ ok: rowCount === 1, engine: 'sqlite' })
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
    }
}


