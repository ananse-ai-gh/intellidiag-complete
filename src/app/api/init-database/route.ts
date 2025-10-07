import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/init-database - Initialize required database tables
export async function POST(request: NextRequest) {
    try {
        console.log('🔧 Initializing database tables...');

        const supabase = createServerSupabaseClient();

        // Create profiles table using direct SQL
        const { error: profilesError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        if (profilesError) {
            console.error('❌ Error creating profiles table:', profilesError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create profiles table', details: profilesError.message },
                { status: 500 }
            );
        }

        // Create patients table
        const { error: patientsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS patients (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    patientid TEXT UNIQUE NOT NULL,
                    firstname TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    dateofbirth DATE NOT NULL,
                    gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
                    contactnumber TEXT,
                    email TEXT,
                    street TEXT,
                    city TEXT,
                    state TEXT,
                    zipcode TEXT,
                    country TEXT,
                    assigneddoctorid UUID REFERENCES profiles(id),
                    isactive BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (patientsError) {
            console.error('❌ Error creating patients table:', patientsError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create patients table', details: patientsError.message },
                { status: 500 }
            );
        }

        // Create scans table
        const { error: scansError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS scans (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    scanid TEXT UNIQUE NOT NULL,
                    patientid UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                    scantype TEXT CHECK(scantype IN ('X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Other')) NOT NULL,
                    bodypart TEXT NOT NULL,
                    scandate DATE NOT NULL,
                    uploadedbyid UUID NOT NULL REFERENCES profiles(id),
                    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
                    status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'archived')) DEFAULT 'pending',
                    notes TEXT,
                    file_path TEXT,
                    ai_status TEXT CHECK(ai_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
                    ai_findings TEXT,
                    confidence REAL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (scansError) {
            console.error('❌ Error creating scans table:', scansError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create scans table', details: scansError.message },
                { status: 500 }
            );
        }

        // Create analyses table
        const { error: analysesError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS analyses (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
                    image_index INTEGER NOT NULL DEFAULT 0,
                    analysis_type TEXT DEFAULT 'ai_analysis',
                    status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
                    confidence REAL,
                    result JSONB,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(scan_id, image_index, analysis_type)
                );
            `
        });

        if (analysesError) {
            console.error('❌ Error creating analyses table:', analysesError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create analyses table', details: analysesError.message },
                { status: 500 }
            );
        }

        // Create short_urls table
        const { error: urlsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS short_urls (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    short_code TEXT UNIQUE NOT NULL,
                    original_url TEXT NOT NULL,
                    scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
                    created_by UUID REFERENCES profiles(id),
                    expires_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (urlsError) {
            console.error('❌ Error creating short_urls table:', urlsError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to create short_urls table', details: urlsError.message },
                { status: 500 }
            );
        }

        // Enable RLS on all tables
        const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
                ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
                ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
                ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
                ALTER TABLE short_urls ENABLE ROW LEVEL SECURITY;
            `
        });

        if (rlsError) {
            console.error('❌ Error enabling RLS:', rlsError);
            return NextResponse.json(
                { status: 'error', message: 'Failed to enable RLS', details: rlsError.message },
                { status: 500 }
            );
        }

        console.log('✅ Database tables initialized successfully!');

        return NextResponse.json({
            status: 'success',
            message: 'Database initialized successfully',
            tables: ['profiles', 'patients', 'scans', 'analyses', 'short_urls'],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Database initialization error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Failed to initialize database',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
