import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getRow } from '@/lib/database';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/init/sample-data
export async function POST(request: NextRequest) {
    try {
        // Check if sample data already exists
        const existingPatients = await getRow('SELECT COUNT(*) as count FROM patients');
        const existingScans = await getRow('SELECT COUNT(*) as count FROM scans');

        if (existingPatients?.count > 0 || existingScans?.count > 0) {
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
                role: 'doctor',
                specialization: 'Cardiology'
            },
            {
                email: 'radiologist.jones@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Sarah',
                lastName: 'Jones',
                role: 'radiologist',
                specialization: 'Neuroradiology'
            },
            {
                email: 'doctor.wilson@intellidiag.com',
                password: await bcrypt.hash('password123', 12),
                firstName: 'Michael',
                lastName: 'Wilson',
                role: 'doctor',
                specialization: 'Orthopedics'
            }
        ];

        const userIds: number[] = [];
        for (const user of users) {
            const result = await runQuery(
                'INSERT INTO users (email, password, firstName, lastName, role, specialization) VALUES (?, ?, ?, ?, ?, ?)',
                [user.email, user.password, user.firstName, user.lastName, user.role, user.specialization]
            );
            userIds.push(result.id);
        }

        // Create sample patients
        const patients = [
            {
                patientId: 'P001',
                firstName: 'Emma',
                lastName: 'Johnson',
                dateOfBirth: '1985-03-15',
                gender: 'female',
                contactNumber: '+1234567890',
                email: 'emma.johnson@email.com',
                assignedDoctorId: userIds[0]
            },
            {
                patientId: 'P002',
                firstName: 'David',
                lastName: 'Brown',
                dateOfBirth: '1978-07-22',
                gender: 'male',
                contactNumber: '+1234567891',
                email: 'david.brown@email.com',
                assignedDoctorId: userIds[0]
            },
            {
                patientId: 'P003',
                firstName: 'Sarah',
                lastName: 'Davis',
                dateOfBirth: '1992-11-08',
                gender: 'female',
                contactNumber: '+1234567892',
                email: 'sarah.davis@email.com',
                assignedDoctorId: userIds[2]
            },
            {
                patientId: 'P004',
                firstName: 'Michael',
                lastName: 'Chen',
                dateOfBirth: '1980-05-12',
                gender: 'male',
                contactNumber: '+1234567893',
                email: 'michael.chen@email.com',
                assignedDoctorId: userIds[2]
            },
            {
                patientId: 'P005',
                firstName: 'Lisa',
                lastName: 'Wilson',
                dateOfBirth: '1988-09-30',
                gender: 'female',
                contactNumber: '+1234567894',
                email: 'lisa.wilson@email.com',
                assignedDoctorId: userIds[0]
            }
        ];

        const patientIds: number[] = [];
        for (const patient of patients) {
            const result = await runQuery(
                'INSERT INTO patients (patientId, firstName, lastName, dateOfBirth, gender, contactNumber, email, assignedDoctorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [patient.patientId, patient.firstName, patient.lastName, patient.dateOfBirth, patient.gender, patient.contactNumber, patient.email, patient.assignedDoctorId]
            );
            patientIds.push(result.id);
        }

        // Create sample scans
        const scans = [
            {
                scanId: 'SCAN-001',
                patientId: patientIds[0],
                scanType: 'X-Ray',
                bodyPart: 'Chest',
                scanDate: '2024-01-15',
                uploadedById: userIds[0],
                priority: 'medium',
                status: 'completed',
                notes: 'Routine chest X-ray for respiratory assessment'
            },
            {
                scanId: 'SCAN-002',
                patientId: patientIds[1],
                scanType: 'MRI',
                bodyPart: 'Brain',
                scanDate: '2024-01-16',
                uploadedById: userIds[1],
                priority: 'high',
                status: 'completed',
                notes: 'Brain MRI for neurological evaluation'
            },
            {
                scanId: 'SCAN-003',
                patientId: patientIds[2],
                scanType: 'CT',
                bodyPart: 'Spine',
                scanDate: '2024-01-17',
                uploadedById: userIds[2],
                priority: 'medium',
                status: 'analyzing',
                notes: 'Spine CT for back pain assessment'
            },
            {
                scanId: 'SCAN-004',
                patientId: patientIds[3],
                scanType: 'X-Ray',
                bodyPart: 'Knee',
                scanDate: '2024-01-18',
                uploadedById: userIds[2],
                priority: 'low',
                status: 'pending',
                notes: 'Knee X-ray for injury evaluation'
            },
            {
                scanId: 'SCAN-005',
                patientId: patientIds[4],
                scanType: 'Ultrasound',
                bodyPart: 'Abdomen',
                scanDate: '2024-01-19',
                uploadedById: userIds[0],
                priority: 'urgent',
                status: 'pending',
                notes: 'Abdominal ultrasound for pain assessment'
            },
            {
                scanId: 'SCAN-006',
                patientId: patientIds[0],
                scanType: 'CT',
                bodyPart: 'Chest',
                scanDate: '2024-01-20',
                uploadedById: userIds[0],
                priority: 'high',
                status: 'completed',
                notes: 'Chest CT for detailed lung assessment'
            },
            {
                scanId: 'SCAN-007',
                patientId: patientIds[1],
                scanType: 'MRI',
                bodyPart: 'Spine',
                scanDate: '2024-01-21',
                uploadedById: userIds[1],
                priority: 'medium',
                status: 'analyzing',
                notes: 'Spine MRI for detailed evaluation'
            }
        ];

        const scanIds: number[] = [];
        for (const scan of scans) {
            const result = await runQuery(
                'INSERT INTO scans (scanId, patientId, scanType, bodyPart, scanDate, uploadedById, priority, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [scan.scanId, scan.patientId, scan.scanType, scan.bodyPart, scan.scanDate, scan.uploadedById, scan.priority, scan.status, scan.notes]
            );
            scanIds.push(result.id);
        }

        // Create sample AI analysis
        const aiAnalyses = [
            {
                scanId: scanIds[0],
                status: 'completed',
                confidence: 94.5,
                findings: 'Normal cardiac silhouette, clear lung fields, no evidence of pneumonia or pleural effusion',
                recommendations: 'No immediate intervention required. Follow up in 6 months for routine assessment.',
                processingTime: 2300,
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[1],
                status: 'completed',
                confidence: 91.2,
                findings: 'Normal brain parenchyma, no mass lesions or hemorrhage detected',
                recommendations: 'Normal brain MRI. Continue current treatment plan.',
                processingTime: 4700,
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[2],
                status: 'processing',
                confidence: 0,
                findings: '',
                recommendations: '',
                processingTime: 0,
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[5],
                status: 'completed',
                confidence: 88.7,
                findings: 'Mild emphysematous changes in upper lobes, no acute findings',
                recommendations: 'Consider pulmonary function tests. Smoking cessation counseling recommended.',
                processingTime: 3100,
                modelVersion: 'v2.1'
            },
            {
                scanId: scanIds[6],
                status: 'processing',
                confidence: 0,
                findings: '',
                recommendations: '',
                processingTime: 0,
                modelVersion: 'v2.1'
            }
        ];

        for (const analysis of aiAnalyses) {
            await runQuery(
                'INSERT INTO ai_analysis (scanId, status, confidence, findings, recommendations, processingTime, modelVersion) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [analysis.scanId, analysis.status, analysis.confidence, analysis.findings, analysis.recommendations, analysis.processingTime, analysis.modelVersion]
            );
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
