-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'doctor', 'radiologist', 'patient')) NOT NULL,
    password VARCHAR(255),
    isActive BOOLEAN DEFAULT true,
    lastLogin TIMESTAMP WITH TIME ZONE,
    specialization VARCHAR(100),
    licenseNumber VARCHAR(50),
    profileImage TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    medical_history TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    scan_type VARCHAR(100) NOT NULL,
    body_part VARCHAR(100) NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'archived')) DEFAULT 'pending',
    ai_status VARCHAR(20) CHECK (ai_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    ai_analysis JSONB DEFAULT '{}',
    confidence DECIMAL(5,2) DEFAULT 0,
    findings TEXT DEFAULT '',
    recommendations TEXT DEFAULT '',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    result JSONB DEFAULT '{}',
    confidence DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_scans_patient_id ON scans(patient_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_ai_status ON scans(ai_status);
CREATE INDEX IF NOT EXISTS idx_scans_created_by ON scans(created_by);
CREATE INDEX IF NOT EXISTS idx_analyses_scan_id ON analyses(scan_id);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scans_updated_at BEFORE UPDATE ON scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data and admins can read all
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid()::text 
        AND role = 'admin'
    )
);

-- Patients policies
CREATE POLICY "Authenticated users can read patients" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert patients" ON patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update patients" ON patients FOR UPDATE USING (auth.role() = 'authenticated');

-- Scans policies
CREATE POLICY "Authenticated users can read scans" ON scans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert scans" ON scans FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update scans" ON scans FOR UPDATE USING (auth.role() = 'authenticated');

-- Analyses policies
CREATE POLICY "Authenticated users can read analyses" ON analyses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert analyses" ON analyses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update analyses" ON analyses FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample data (optional - for development)
INSERT INTO users (email, first_name, last_name, role) VALUES
('admin@intellidiag.com', 'Admin', 'User', 'admin'),
('doctor@intellidiag.com', 'Dr. John', 'Smith', 'doctor'),
('radiologist@intellidiag.com', 'Dr. Jane', 'Doe', 'radiologist')
ON CONFLICT (email) DO NOTHING;

-- Create a function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalUsers', (SELECT COUNT(*) FROM users),
        'totalPatients', (SELECT COUNT(*) FROM patients),
        'totalScans', (SELECT COUNT(*) FROM scans),
        'totalAnalyses', (SELECT COUNT(*) FROM analyses),
        'pendingScans', (SELECT COUNT(*) FROM scans WHERE status = 'pending'),
        'completedScans', (SELECT COUNT(*) FROM scans WHERE status = 'completed'),
        'avgConfidence', (SELECT COALESCE(AVG(confidence), 0) FROM scans WHERE ai_status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
