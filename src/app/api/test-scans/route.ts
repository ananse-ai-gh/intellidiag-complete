import { NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/test-scans - Test scans functionality
export async function GET() {
    try {
        // Check if scans table exists and has data
        const stats = await hybridDb.getDashboardStats() as {
            totalUsers: number;
            totalPatients: number;
            totalScans: number;
            totalAnalyses: number;
        };

        console.log('Current scan count:', stats.totalScans);

        // If no scans exist, create sample data
        if (stats.totalScans === 0) {
            console.log('No scans found, creating sample data...');

            // First, ensure we have some patients
            if (stats.totalPatients === 0) {
                // Create sample patients
                await hybridDb.createPatient({
                    first_name: 'John',
                    last_name: 'Doe',
                    date_of_birth: '1985-03-15',
                    gender: 'male',
                    phone: '+1234567890',
                    email: 'john.doe@email.com',
                    address: 'New York, NY, USA',
                    medical_history: ''
                });

                await hybridDb.createPatient({
                    first_name: 'Jane',
                    last_name: 'Smith',
                    date_of_birth: '1990-07-22',
                    gender: 'female',
                    phone: '+1234567891',
                    email: 'jane.smith@email.com',
                    address: 'Los Angeles, CA, USA',
                    medical_history: ''
                });

                await hybridDb.createPatient({
                    first_name: 'Mike',
                    last_name: 'Johnson',
                    date_of_birth: '1978-11-08',
                    gender: 'male',
                    phone: '+1234567892',
                    email: 'mike.johnson@email.com',
                    address: 'Chicago, IL, USA',
                    medical_history: ''
                });

                console.log('Created sample patients');
            }

            // Get a user for uploadedById
            const users = await hybridDb.getAllUsers();
            if (users.length === 0) {
                return NextResponse.json({
                    status: 'error',
                    message: 'No users found in database'
                }, { status: 400 });
            }

            const userId = users[0].id;

            // Get patients for scan creation
            const patients = await hybridDb.getAllPatients();
            if (patients.length < 3) {
                return NextResponse.json({
                    status: 'error',
                    message: 'Not enough patients for sample data'
                }, { status: 400 });
            }

            // Create sample scans
            const scan1 = await hybridDb.createScan({
                patient_id: patients[0].id,
                scan_type: 'X-Ray',
                body_part: 'Chest',
                priority: 'high',
                status: 'completed',
                file_path: '/uploads/sample-chest-xray.jpg',
                file_name: 'chest-xray.jpg',
                file_size: 1024000,
                mime_type: 'image/jpeg',
                created_by: userId
            });

            const scan2 = await hybridDb.createScan({
                patient_id: patients[1].id,
                scan_type: 'MRI',
                body_part: 'Brain',
                priority: 'medium',
                status: 'processing',
                file_path: '/uploads/sample-brain-mri.jpg',
                file_name: 'brain-mri.jpg',
                file_size: 2048000,
                mime_type: 'image/jpeg',
                created_by: userId
            });

            const scan3 = await hybridDb.createScan({
                patient_id: patients[2].id,
                scan_type: 'CT',
                body_part: 'Abdomen',
                priority: 'low',
                status: 'pending',
                file_path: '/uploads/sample-abdomen-ct.jpg',
                file_name: 'abdomen-ct.jpg',
                file_size: 1536000,
                mime_type: 'image/jpeg',
                created_by: userId
            });

            const scan4 = await hybridDb.createScan({
                patient_id: patients[0].id,
                scan_type: 'Ultrasound',
                body_part: 'Heart',
                priority: 'urgent',
                status: 'completed',
                file_path: '/uploads/sample-heart-ultrasound.jpg',
                file_name: 'heart-ultrasound.jpg',
                file_size: 1280000,
                mime_type: 'image/jpeg',
                created_by: userId
            });

            const scan5 = await hybridDb.createScan({
                patient_id: patients[1].id,
                scan_type: 'X-Ray',
                body_part: 'Spine',
                priority: 'medium',
                status: 'pending',
                file_path: '/uploads/sample-spine-xray.jpg',
                file_name: 'spine-xray.jpg',
                file_size: 768000,
                mime_type: 'image/jpeg',
                created_by: userId
            });

            // Create AI analysis records for completed scans
            await hybridDb.createAnalysis({
                scan_id: scan1.id,
                analysis_type: 'chest_xray',
                status: 'completed',
                confidence: 85,
                result: {
                    findings: 'Normal chest X-ray with no significant findings. Heart size normal. Lungs clear.',
                    recommendations: 'No immediate intervention required.'
                }
            });

            await hybridDb.createAnalysis({
                scan_id: scan4.id,
                analysis_type: 'heart_ultrasound',
                status: 'completed',
                confidence: 92,
                result: {
                    findings: 'Normal echocardiogram. Left ventricular function preserved. No significant valvular abnormalities.',
                    recommendations: 'Continue current treatment plan.'
                }
            });

            console.log('Created sample scans and AI analysis records');
        }

        // Get all scans with patient and user details
        const allScans = await hybridDb.getAllScans();

        // Transform to expected format
        const scans = await Promise.all(allScans.map(async (scan) => {
            const patient = await hybridDb.getPatientById(scan.patient_id);
            const analyses = await hybridDb.getAnalysesByScanId(scan.id);
            const analysis = analyses[0];

            return {
                id: scan.id,
                scanId: scan.id,
                patientId: scan.patient_id,
                scanType: scan.scan_type,
                bodyPart: scan.body_part,
                priority: scan.priority,
                status: scan.status,
                notes: '',
                scanDate: scan.created_at,
                createdAt: scan.created_at,
                updatedAt: scan.updated_at,
                patientFirstName: patient?.first_name || '',
                patientLastName: patient?.last_name || '',
                patientIdNumber: patient?.id || '',
                uploadedByFirstName: 'User',
                uploadedByLastName: 'Name',
                aiStatus: analysis?.status || 'pending',
                confidence: analysis?.confidence || 0,
                aiFindings: analysis?.result?.findings || ''
            };
        }));

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