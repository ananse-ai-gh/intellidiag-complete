import { NextRequest, NextResponse } from 'next/server';
import { getAll, runQuery, getRow } from '@/lib/database';
import jwt from 'jsonwebtoken';

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

// GET /api/patients
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
        const offset = (page - 1) * limit;

        let sql = `
      SELECT p.*, u.firstName as doctorFirstName, u.lastName as doctorLastName
      FROM patients p
      LEFT JOIN users u ON p.assignedDoctorId = u.id
      WHERE p.isActive = 1
    `;
        let params: any[] = [];

        if (search) {
            sql += ` AND (p.firstName LIKE ? OR p.lastName LIKE ? OR p.patientId LIKE ? OR p.email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const patients = await getAll(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM patients WHERE isActive = 1';
        let countParams: any[] = [];

        if (search) {
            countSql += ` AND (firstName LIKE ? OR lastName LIKE ? OR patientId LIKE ? OR email LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        const countResult = await getRow(countSql, countParams);
        const total = countResult?.total || 0;

        return NextResponse.json({
            status: 'success',
            data: {
                patients,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get patients error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching patients' },
            { status: 500 }
        );
    }
}

// POST /api/patients
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
            firstName,
            lastName,
            dateOfBirth,
            gender,
            contactNumber,
            email,
            street,
            city,
            state,
            zipCode,
            country,
            assignedDoctorId
        } = body;

        // Validation
        if (!patientId || !firstName || !lastName || !dateOfBirth || !gender) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if patient already exists
        const existingPatient = await getRow('SELECT id FROM patients WHERE patientId = ?', [patientId]);
        if (existingPatient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient with this ID already exists' },
                { status: 400 }
            );
        }

        // Create new patient
        const result = await runQuery(
            `INSERT INTO patients (
        patientId, firstName, lastName, dateOfBirth, gender, contactNumber, 
        email, street, city, state, zipCode, country, assignedDoctorId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [patientId, firstName, lastName, dateOfBirth, gender, contactNumber,
                email, street, city, state, zipCode, country, assignedDoctorId]
        );

        // Get the created patient
        const patient = await getRow(
            'SELECT * FROM patients WHERE id = ?',
            [result.id]
        );

        return NextResponse.json({
            status: 'success',
            data: { patient }
        }, { status: 201 });

    } catch (error) {
        console.error('Create patient error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating patient' },
            { status: 500 }
        );
    }
}
