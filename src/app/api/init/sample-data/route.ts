import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/init/sample-data
export async function POST(request: NextRequest) {
    try {
        // Check if sample data already exists
        const existingPatients = await hybridDb.getAllPatients();
        const existingScans = await hybridDb.getAllScans();

        if (existingPatients.length > 0 || existingScans.length > 0) {
            return NextResponse.json({
                status: 'info',
                message: 'Sample data already exists'
            });
        }

        // Create sample users
        const users = [
            {
                email: 'doctor.smith@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'John',
                lastName: 'Smith',
                role: 'doctor' as const,
                specialization: 'Cardiology'
            },
            {
                email: 'radiologist.jones@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Sarah',
                lastName: 'Jones',
                role: 'radiologist' as const,
                specialization: 'Neuroradiology'
            },
            {
                email: 'doctor.wilson@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Michael',
                lastName: 'Wilson',
                role: 'doctor' as const,
                specialization: 'Orthopedics'
            }
        ];

        const userIds: string[] = [];
        for (const user of users) {
            const createdUser = await hybridDb.createUser({
                email: user.email,
                first_name: user.firstName,
                last_name: user.lastName,
                role: user.role,
                password: user.password,
                specialization: user.specialization,
                isActive: true
            });
            userIds.push(createdUser.id);
        }

        // Create sample patients
        const patients = [
            {
                firstName: 'Emma',
                lastName: 'Johnson',
                dateOfBirth: '1985-03-15',
                gender: 'female' as const,
                phone: '+1234567890',
                email: 'emma.johnson@email.com',
                address: '123 Main St, City, State'
            },
            {
                firstName: 'David',
                lastName: 'Brown',
                dateOfBirth: '1978-07-22',
                gender: 'male' as const,
                phone: '+1234567891',
                email: 'david.brown@email.com',
                address: '456 Oak Ave, City, State'
            },
            {
                firstName: 'Sarah',
                lastName: 'Davis',
                dateOfBirth: '1992-11-08',
                gender: 'female' as const,
                phone: '+1234567892',
                email: 'sarah.davis@email.com',
                address: '789 Pine Rd, City, State'
            },
            {
                firstName: 'Michael',
                lastName: 'Chen',
                dateOfBirth: '1980-05-12',
                gender: 'male' as const,
                phone: '+1234567893',
                email: 'michael.chen@email.com',
                address: '321 Elm St, City, State'
            },
            {
                firstName: 'Lisa',
                lastName: 'Wilson',
                dateOfBirth: '1988-09-30',
                gender: 'female' as const,
                phone: '+1234567894',
                email: 'lisa.wilson@email.com',
                address: '654 Maple Dr, City, State'
            }
        ];

        const patientIds: string[] = [];
        for (const patient of patients) {
            const createdPatient = await hybridDb.createPatient({
                first_name: patient.firstName,
                last_name: patient.lastName,
                date_of_birth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone,
                email: patient.email,
                address: patient.address,
                medical_history: ''
            });
            patientIds.push(createdPatient.id);
        }

        // Create sample scans
        const scans = [
            {
                patientId: patientIds[0],
                scanType: 'X-Ray',
                bodyPart: 'Chest',
                priority: 'medium' as const,
                status: 'completed' as const,
                filePath: '/uploads/sample-chest-xray.jpg',
                fileName: 'chest-xray.jpg',
                fileSize: 1024000,
                mimeType: 'image/jpeg',
                createdBy: userIds[0]
            },
            {
                patientId: patientIds[1],
                scanType: 'MRI',
                bodyPart: 'Brain',
                priority: 'high' as const,
                status: 'completed' as const,
                filePath: '/uploads/sample-brain-mri.jpg',
                fileName: 'brain-mri.jpg',
                fileSize: 2048000,
                mimeType: 'image/jpeg',
                createdBy: userIds[1]
            },
            {
                patientId: patientIds[2],
                scanType: 'CT',
                bodyPart: 'Spine',
                priority: 'medium' as const,
                status: 'processing' as const,
                filePath: '/uploads/sample-spine-ct.jpg',
                fileName: 'spine-ct.jpg',
                fileSize: 1536000,
                mimeType: 'image/jpeg',
                createdBy: userIds[2]
            },
            {
                patientId: patientIds[3],
                scanType: 'X-Ray',
                bodyPart: 'Knee',
                priority: 'low' as const,
                status: 'pending' as const,
                filePath: '/uploads/sample-knee-xray.jpg',
                fileName: 'knee-xray.jpg',
                fileSize: 768000,
                mimeType: 'image/jpeg',
                createdBy: userIds[2]
            },
            {
                patientId: patientIds[4],
                scanType: 'Ultrasound',
                bodyPart: 'Abdomen',
                priority: 'urgent' as const,
                status: 'pending' as const,
                filePath: '/uploads/sample-abdomen-ultrasound.jpg',
                fileName: 'abdomen-ultrasound.jpg',
                fileSize: 1280000,
                mimeType: 'image/jpeg',
                createdBy: userIds[0]
            }
        ];

        const scanIds: string[] = [];
        for (const scan of scans) {
            const createdScan = await hybridDb.createScan({
                patient_id: scan.patientId,
                scan_type: scan.scanType,
                body_part: scan.bodyPart,
                priority: scan.priority,
                status: scan.status,
                file_path: scan.filePath,
                file_name: scan.fileName,
                file_size: scan.fileSize,
                mime_type: scan.mimeType,
                created_by: scan.createdBy
            });
            scanIds.push(createdScan.id);
        }

        // Create sample AI analysis
        const aiAnalyses = [
            {
                scanId: scanIds[0],
                analysisType: 'chest_xray',
                status: 'completed' as const,
                confidence: 94.5,
                result: {
                    findings: 'Normal cardiac silhouette, clear lung fields, no evidence of pneumonia or pleural effusion',
                    recommendations: 'No immediate intervention required. Follow up in 6 months for routine assessment.'
                }
            },
            {
                scanId: scanIds[1],
                analysisType: 'brain_mri',
                status: 'completed' as const,
                confidence: 91.2,
                result: {
                    findings: 'Normal brain parenchyma, no mass lesions or hemorrhage detected',
                    recommendations: 'Normal brain MRI. Continue current treatment plan.'
                }
            },
            {
                scanId: scanIds[2],
                analysisType: 'spine_ct',
                status: 'processing' as const,
                confidence: 0,
                result: {}
            }
        ];

        for (const analysis of aiAnalyses) {
            await hybridDb.createAnalysis({
                scan_id: analysis.scanId,
                analysis_type: analysis.analysisType,
                status: analysis.status,
                confidence: analysis.confidence,
                result: analysis.result
            });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Sample data created successfully',
            data: {
                usersCreated: users.length,
                patientsCreated: patients.length,
                scansCreated: scans.length,
                aiAnalysesCreated: aiAnalyses.length
            }
        });

    } catch (error) {
        console.error('Error creating sample data:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating sample data' },
            { status: 500 }
        );
    }
}