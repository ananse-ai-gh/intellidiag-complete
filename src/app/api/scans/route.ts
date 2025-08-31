import { NextRequest, NextResponse } from 'next/server';
import { getAll, runQuery, getRow } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number };
    } catch (error) {
        return null;
    }
};

// GET /api/scans
export async function GET(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        let sql = `
            SELECT s.*, p.firstName as patientFirstName, p.lastName as patientLastName, 
                   p.patientId, u.firstName as uploadedByFirstName, u.lastName as uploadedByLastName
            FROM scans s
            LEFT JOIN patients p ON s.patientId = p.id
            LEFT JOIN users u ON s.uploadedById = u.id
            WHERE s.status != 'archived'
        `;
        let params: any[] = [];

        if (search) {
            sql += ` AND (p.firstName LIKE ? OR p.lastName LIKE ? OR p.patientId LIKE ? OR s.scanId LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            sql += ` AND s.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY s.createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const scans = await getAll(sql, params);

        // Get total count
        let countSql = `
            SELECT COUNT(*) as total 
            FROM scans s
            LEFT JOIN patients p ON s.patientId = p.id
            WHERE s.status != 'archived'
        `;
        let countParams: any[] = [];

        if (search) {
            countSql += ` AND (p.firstName LIKE ? OR p.lastName LIKE ? OR p.patientId LIKE ? OR s.scanId LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            countSql += ` AND s.status = ?`;
            countParams.push(status);
        }

        const countResult = await getRow<{ total: number }>(countSql, countParams);
        const total = countResult?.total || 0;

        return NextResponse.json({
            status: 'success',
            data: {
                scans,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get scans error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching scans' },
            { status: 500 }
        );
    }
}

// POST /api/scans
export async function POST(request: NextRequest) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            patientId,
            scanType,
            bodyPart,
            scanDate,
            priority,
            notes
        } = body;

        // Validation
        if (!patientId || !scanType || !bodyPart || !scanDate) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if patient exists
        const patient = await getRow('SELECT id FROM patients WHERE id = ?', [patientId]);
        if (!patient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        // Generate unique scan ID
        const scanId = `SCAN-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Create new scan
        const result = await runQuery(
            `INSERT INTO scans (
                scanId, patientId, scanType, bodyPart, scanDate, uploadedById, priority, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [scanId, patientId, scanType, bodyPart, scanDate, user.id, priority || 'medium', notes]
        );

        // Get the created scan
        const scan = await getRow<{
            id: number;
            scanId: string;
            patientId: number;
            scanType: string;
            bodyPart: string;
            scanDate: string;
            uploadedById: number;
            priority: string;
            status: string;
            notes?: string;
            createdAt: string;
            updatedAt: string;
            patientFirstName: string;
            patientLastName: string;
            patientPatientId: string;
            uploadedByFirstName: string;
            uploadedByLastName: string;
        }>(
            `SELECT s.*, p.firstName as patientFirstName, p.lastName as patientLastName, 
                    p.patientId, u.firstName as uploadedByFirstName, u.lastName as uploadedByLastName
             FROM scans s
             LEFT JOIN patients p ON s.patientId = p.id
             LEFT JOIN users u ON s.uploadedById = u.id
             WHERE s.id = ?`,
            [result.id]
        );

        return NextResponse.json({
            status: 'success',
            data: { scan }
        }, { status: 201 });

    } catch (error) {
        console.error('Create scan error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating scan' },
            { status: 500 }
        );
    }
}
