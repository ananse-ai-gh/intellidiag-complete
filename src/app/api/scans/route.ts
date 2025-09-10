import { NextRequest, NextResponse } from 'next/server';
import { getRow, getAll, runQuery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { scanQueueManager } from '@/services/scanQueueManager';

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
        const patient = await getRow('SELECT id FROM patients WHERE id = ?', [patientId]);
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

        // Insert scan into database
        const result = await runQuery(
            `INSERT INTO scans (
                scanId, patientId, scanType, bodyPart, scanDate, 
                uploadedById, priority, status, notes, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                scanId,
                patientId,
                scanType,
                bodyPart,
                scanDate || new Date().toISOString().split('T')[0],
                user.id,
                priority || 'medium',
                'uploading', // Start with uploading status
                notes || ''
            ]
        );

        // Save image record to database
        if (imagePath) {
            await runQuery(
                'INSERT INTO scan_images (scanId, url, originalName, size) VALUES (?, ?, ?, ?)',
                [result.id, imagePath, scanImage.name, scanImage.size]
            );
        }

        // Create initial AI analysis record
        await runQuery(
            `INSERT INTO ai_analysis (
                scanId, status, modelVersion, createdAt, updatedAt
            ) VALUES (?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [result.id, analysisType || 'auto']
        );

        // Update status to uploaded
        await runQuery(
            'UPDATE scans SET status = ? WHERE id = ?',
            ['uploaded', result.id]
        );

        // Add to processing queue
        const queueSuccess = await scanQueueManager.addToQueue(scanId, scanType, priority as any);

        if (!queueSuccess) {
            return NextResponse.json({
                status: 'error',
                message: 'Scan created but failed to add to processing queue',
                data: { scanId }
            }, { status: 500 });
        }

        // Get the created scan with patient details
        const createdScan = await getRow(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId as patientIdNumber
            FROM scans s
            JOIN patients p ON s.patientId = p.id
            WHERE s.id = ?
        `, [result.id]);

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

        // Build query
        let query = `
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
        `;

        const whereConditions = [];
        const queryParams = [];

        if (status) {
            whereConditions.push('s.status = ?');
            queryParams.push(status);
        }

        if (scanType) {
            whereConditions.push('s.scanType = ?');
            queryParams.push(scanType);
        }

        if (patientId) {
            whereConditions.push('s.patientId = ?');
            queryParams.push(patientId);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY s.createdAt DESC';

        // Add pagination
        const offset = (page - 1) * limit;
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        // Execute query
        const scans = await getAll(query, queryParams);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM scans s';
        if (whereConditions.length > 0) {
            countQuery += ' WHERE ' + whereConditions.join(' AND ');
        }
        const totalResult = await getRow(countQuery, queryParams.slice(0, -2));
        const total = totalResult?.total || 0;

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
        await runQuery(
            `UPDATE scans SET 
                scanType = ?, 
                bodyPart = ?, 
                priority = ?, 
                notes = ?, 
                scanDate = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE scanId = ?`,
            [scanType, bodyPart, priority, notes, scanDate, scanId]
        );

        // Get the updated scan
        const updatedScan = await getRow(`
            SELECT 
                s.*,
                p.firstName as patientFirstName,
                p.lastName as patientLastName,
                p.patientId as patientIdNumber
            FROM scans s
            JOIN patients p ON s.patientId = p.id
            WHERE s.scanId = ?
        `, [scanId]);

        return NextResponse.json({
            status: 'success',
            message: 'Scan updated successfully',
            data: { scan: updatedScan }
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
