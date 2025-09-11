import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { scanQueueManager } from '@/services/scanQueueManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (error) {
        return null;
    }
};

// POST /api/scans - Create a new scan
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Parse multipart form data
        const formData = await request.formData();

        // Extract form fields
        const patientId = formData.get('patientId') as string;
        const scanType = formData.get('scanType') as string;
        const bodyPart = formData.get('bodyPart') as string;
        const priority = formData.get('priority') as string;
        const notes = formData.get('notes') as string;
        const scanDate = formData.get('scanDate') as string;
        const analysisType = formData.get('analysisType') as string;
        const scanImage = formData.get('scanImage') as File;

        // Validate required fields
        if (!patientId || !scanType || !bodyPart || !scanImage) {
            return NextResponse.json(
                { status: 'error', message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate patient exists
        const patient = await hybridDb.getPatientById(patientId);
        if (!patient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        // Generate unique scan ID
        const scanId = `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Handle file upload
        let imagePath = '';
        if (scanImage) {
            const bytes = await scanImage.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create uploads directory if it doesn't exist
            const uploadsDir = join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadsDir, { recursive: true });

            // Generate unique filename
            const fileExtension = scanImage.name.split('.').pop();
            const fileName = `${scanId}.${fileExtension}`;
            imagePath = `/uploads/${fileName}`;

            // Save file
            await writeFile(join(uploadsDir, fileName), buffer);
        }

        // Create scan in database
        const scan = await hybridDb.createScan({
            patient_id: patientId,
            scan_type: scanType,
            body_part: bodyPart,
            priority: priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
            status: 'pending',
            file_path: imagePath,
            file_name: scanImage.name,
            file_size: scanImage.size,
            mime_type: scanImage.type,
            created_by: user.id
        });

        // Create initial AI analysis record
        await hybridDb.createAnalysis({
            scan_id: scan.id,
            analysis_type: analysisType || 'auto',
            status: 'pending',
            confidence: 0,
            result: {}
        });

        // Add to processing queue
        const queueSuccess = await scanQueueManager.addToQueue(scanId, scanType, priority as any);

        if (!queueSuccess) {
            return NextResponse.json({
                status: 'error',
                message: 'Scan created but failed to add to processing queue',
                data: { scanId }
            }, { status: 500 });
        }

        // Transform to expected format
        const createdScan = {
            id: scan.id,
            scanId: scan.id,
            patientId: scan.patient_id,
            scanType: scan.scan_type,
            bodyPart: scan.body_part,
            priority: scan.priority,
            status: scan.status,
            notes: notes || '',
            scanDate: scanDate || scan.created_at,
            createdAt: scan.created_at,
            updatedAt: scan.updated_at,
            patientFirstName: patient.first_name,
            patientLastName: patient.last_name,
            patientIdNumber: patient.id
        };

        return NextResponse.json({
            status: 'success',
            message: 'Scan created successfully and added to processing queue',
            data: {
                scan: createdScan,
                scanId: scanId,
                imagePath: imagePath,
                queueStatus: 'queued',
                message: 'Scan is queued for AI processing'
            }
        });

    } catch (error) {
        console.error('Error creating scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error creating scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET /api/scans - Get all scans
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const scanType = searchParams.get('scanType');
        const patientId = searchParams.get('patientId');

        // Get all scans
        let allScans = await hybridDb.getAllScans();

        // Apply filters
        if (status) {
            allScans = allScans.filter(scan => scan.status === status);
        }
        if (scanType) {
            allScans = allScans.filter(scan => scan.scan_type === scanType);
        }
        if (patientId) {
            allScans = allScans.filter(scan => scan.patient_id === patientId);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedScans = allScans.slice(offset, offset + limit);

        // Transform to expected format
        const scans = await Promise.all(paginatedScans.map(async (scan) => {
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

        const total = allScans.length;

        return NextResponse.json({
            status: 'success',
            data: {
                scans: scans || [],
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching scans:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error fetching scans',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT /api/scans - Update a scan
export async function PUT(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { scanId, scanType, bodyPart, priority, notes, scanDate } = body;

        // Validate required fields
        if (!scanId) {
            return NextResponse.json(
                { status: 'error', message: 'Scan ID is required' },
                { status: 400 }
            );
        }

        // Update scan in database
        const updatedScan = await hybridDb.updateScan(scanId, {
            scan_type: scanType,
            body_part: bodyPart,
            priority: priority as 'low' | 'medium' | 'high' | 'urgent'
        });

        // Get patient details
        const patient = await hybridDb.getPatientById(updatedScan.patient_id);

        // Transform to expected format
        const scanData = {
            id: updatedScan.id,
            scanId: updatedScan.id,
            patientId: updatedScan.patient_id,
            scanType: updatedScan.scan_type,
            bodyPart: updatedScan.body_part,
            priority: updatedScan.priority,
            status: updatedScan.status,
            notes: notes || '',
            scanDate: scanDate || updatedScan.created_at,
            createdAt: updatedScan.created_at,
            updatedAt: updatedScan.updated_at,
            patientFirstName: patient?.first_name || '',
            patientLastName: patient?.last_name || '',
            patientIdNumber: patient?.id || ''
        };

        return NextResponse.json({
            status: 'success',
            message: 'Scan updated successfully',
            data: { scan: scanData }
        });

    } catch (error) {
        console.error('Error updating scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error updating scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}