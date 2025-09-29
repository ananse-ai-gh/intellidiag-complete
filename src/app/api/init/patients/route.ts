import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/supabaseProfilesDatabase'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// GET /api/init/patients - seed demo patients (idempotent by email)
export async function GET(_request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient()
        const patients = [
            {
                first_name: 'Sarah', last_name: 'Johnson', date_of_birth: '1988-04-12', gender: 'female',
                phone: '+1 (555) 123-4567', email: 'sarah.johnson@email.com', address: '12 Maple Street, Springfield'
            },
            {
                first_name: 'Michael', last_name: 'Chen', date_of_birth: '1990-09-21', gender: 'male',
                phone: '+1 (555) 234-5678', email: 'michael.chen@email.com', address: '88 Pine Avenue, Lakeside'
            },
            {
                first_name: 'Emma', last_name: 'Wilson', date_of_birth: '1992-02-17', gender: 'female',
                phone: '+1 (555) 345-6789', email: 'emma.wilson@email.com', address: '5 Oak Road, Rivertown'
            },
            {
                first_name: 'David', last_name: 'Brown', date_of_birth: '1985-11-05', gender: 'male',
                phone: '+1 (555) 456-7890', email: 'david.brown@email.com', address: '220 Cedar Blvd, Brookfield'
            },
            {
                first_name: 'Lisa', last_name: 'Garcia', date_of_birth: '1994-07-23', gender: 'female',
                phone: '+1 (555) 567-8901', email: 'lisa.garcia@email.com', address: '14 Birch Lane, Hillcrest'
            },
            {
                first_name: 'Andrew', last_name: 'Smith', date_of_birth: '1987-01-28', gender: 'male',
                phone: '+1 (555) 678-9012', email: 'andrew.smith@email.com', address: '77 Elm Street, Meadowvale'
            },
            {
                first_name: 'Nadia', last_name: 'Hassan', date_of_birth: '1993-10-09', gender: 'female',
                phone: '+1 (555) 789-0123', email: 'nadia.hassan@email.com', address: '301 Palm Grove, Seaside'
            },
            {
                first_name: 'Kwame', last_name: 'Mensah', date_of_birth: '1989-05-16', gender: 'male',
                phone: '+233 55 123 4567', email: 'kwame.mensah@email.com', address: '25 Independence Ave, Accra'
            },
            {
                first_name: 'Aisha', last_name: 'Abdullah', date_of_birth: '1991-12-02', gender: 'female',
                phone: '+971 50 789 4321', email: 'aisha.abdullah@email.com', address: '90 Marina Walk, Dubai'
            },
            {
                first_name: 'Hiro', last_name: 'Tanaka', date_of_birth: '1984-08-30', gender: 'male',
                phone: '+81 90 1234 5678', email: 'hiro.tanaka@email.com', address: '2-15-3 Shibuya, Tokyo'
            }
        ]

        // Check existing by email to avoid duplicates
        const { data: existing, error: exErr } = await supabase
            .from('patients').select('id,email')
        if (exErr) {
            console.error('Read patients failed:', exErr)
        }
        const existingEmails = new Set((existing || []).map((p: any) => p.email))

        const created: any[] = []
        for (const p of patients) {
            if (existingEmails.has(p.email)) continue
            const createdPatient = await db.createPatient({
                first_name: p.first_name,
                last_name: p.last_name,
                date_of_birth: p.date_of_birth,
                gender: p.gender as 'male' | 'female' | 'other',
                phone: p.phone,
                email: p.email,
                address: p.address,
                medical_history: ''
            })
            created.push(createdPatient)
        }

        return NextResponse.json({ status: 'success', data: { created: created.length } })
    } catch (err: any) {
        console.error('Seed patients error:', err)
        return NextResponse.json({ status: 'error', message: err?.message || 'Failed' }, { status: 500 })
    }
}


