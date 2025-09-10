import { NextResponse } from 'next/server';
import { getRow, getAll, runQuery } from '@/lib/database';

// GET /api/test-scans - Test scans functionality
export async function GET() {
    try {
        // Check if scans table exists and has data
        const scanCount = await getRow('SELECT COUNT(*) as count FROM scans');
        console.log('Current scan count:', scanCount?.count || 0);

        // If no scans exist, create sample data
        if (!scanCount || scanCount.count === 0) {
            console.log('No scans found, creating sample data...');

            // First, ensure we have some patients
            const patientCount = await getRow('SELECT COUNT(*) as count FROM patients');
            if (!patientCount || patientCount.count === 0) {
                // Create sample patients
                await runQuery(`
                    INSERT INTO patients (patientId, firstName, lastName, dateOfBirth, gender, contactNumber, email, city, state, country)
                    VALUES 
                    ('P001', 'John', 'Doe', '1985-03-15', 'male', '+1234567890', 'john.doe@email.com', 'New York', 'NY', 'USA'),
                    ('P002', 'Jane', 'Smith', '1990-07-22', 'female', '+1234567891', 'jane.smith@email.com', 'Los Angeles', 'CA', 'USA'),
                    ('P003', 'Mike', 'Johnson', '1978-11-08', 'male', '+1234567892', 'mike.johnson@email.com', 'Chicago', 'IL', 'USA')
                `);
                console.log('Created sample patients');
            }

            // Get a user for uploadedById
            const user = await getRow('SELECT id FROM users LIMIT 1');
            if (!user) {
                return NextResponse.json({
                    status: 'error',
                    message: 'No users found in database'
                }, { status: 400 });
            }

            // Create sample scans
            await runQuery(`
                INSERT INTO scans (scanId, patientId, scanType, bodyPart, scanDate, uploadedById, priority, status, notes)
                VALUES 
                ('SCAN-001', 1, 'X-Ray', 'Chest', '2024-01-15', ?, 'high', 'completed', 'Routine chest X-ray'),
                ('SCAN-002', 2, 'MRI', 'Brain', '2024-01-16', ?, 'medium', 'analyzing', 'Brain MRI for headache evaluation'),
                ('SCAN-003', 3, 'CT', 'Abdomen', '2024-01-17', ?, 'low', 'pending', 'Abdominal CT scan'),
                ('SCAN-004', 1, 'Ultrasound', 'Heart', '2024-01-18', ?, 'urgent', 'completed', 'Echocardiogram'),
                ('SCAN-005', 2, 'X-Ray', 'Spine', '2024-01-19', ?, 'medium', 'pending', 'Spinal X-ray for back pain')
            `, [user.id, user.id, user.id, user.id, user.id]);

            // Create AI analysis records for completed scans
            await runQuery(`
                INSERT INTO ai_analysis (scanId, status, confidence, findings)
                VALUES 
                (1, 'completed', 85, 'Normal chest X-ray with no significant findings. Heart size normal. Lungs clear.'),
                (4, 'completed', 92, 'Normal echocardiogram. Left ventricular function preserved. No significant valvular abnormalities.')
            `);

            console.log('Created sample scans and AI analysis records');
        }

        // Get all scans with patient and user details
        const scans = await getAll(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId as patientIdNumber,
                u.firstName as uploadedByFirstName,
                u.lastName as uploadedByLastName,
                aa.status as aiStatus,
                aa.confidence,
                aa.findings as aiFindings
            FROM scans s
            JOIN patients p ON s.patientId = p.id
            JOIN users u ON s.uploadedById = u.id
            LEFT JOIN ai_analysis aa ON s.id = aa.scanId
            ORDER BY s.createdAt DESC
        `);

        return NextResponse.json({
            status: 'success',
            data: {
                scans: scans || [],
                total: scans?.length || 0
            }
        });

    } catch (error) {
        console.error('Error in test-scans:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error testing scans',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
