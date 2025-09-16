-- Migration script to add missing columns to existing Supabase database
-- Run this in your Supabase SQL editor if you already have tables created

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255),
ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS lastLogin TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS specialization VARCHAR(100),
ADD COLUMN IF NOT EXISTS licenseNumber VARCHAR(50),
ADD COLUMN IF NOT EXISTS profileImage TEXT;

-- Update scans table to include 'archived' status
ALTER TABLE scans 
DROP CONSTRAINT IF EXISTS scans_status_check;

ALTER TABLE scans 
ADD CONSTRAINT scans_status_check 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'archived'));

-- Update RLS policies if needed
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow service role to manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on other tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Users can view all patients" ON patients
    FOR SELECT USING (true);

CREATE POLICY "Users can insert patients" ON patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update patients" ON patients
    FOR UPDATE USING (true);

CREATE POLICY "Allow service role to manage patients" ON patients
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for scans table
CREATE POLICY "Users can view all scans" ON scans
    FOR SELECT USING (true);

CREATE POLICY "Users can insert scans" ON scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update scans" ON scans
    FOR UPDATE USING (true);

CREATE POLICY "Allow service role to manage scans" ON scans
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for analyses table
CREATE POLICY "Users can view all analyses" ON analyses
    FOR SELECT USING (true);

CREATE POLICY "Users can insert analyses" ON analyses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update analyses" ON analyses
    FOR UPDATE USING (true);

CREATE POLICY "Allow service role to manage analyses" ON analyses
    FOR ALL USING (auth.role() = 'service_role');
