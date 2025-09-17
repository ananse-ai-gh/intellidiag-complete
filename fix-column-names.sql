-- Fix column name mismatches in Supabase
-- Run this in your Supabase SQL editor

-- Rename columns to match the application code
ALTER TABLE users RENAME COLUMN isactive TO "isActive";
ALTER TABLE users RENAME COLUMN lastlogin TO "lastLogin";
ALTER TABLE users RENAME COLUMN licensenumber TO "licenseNumber";
ALTER TABLE users RENAME COLUMN profileimage TO "profileImage";

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
