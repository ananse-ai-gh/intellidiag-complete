import { NextRequest, NextResponse } from 'next/server';
import { getRow, runQuery } from '@/lib/database';
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

// GET /api/patients/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const patientId = parseInt(params.id);
        if (isNaN(patientId)) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid patient ID' },
                { status: 400 }
            );
        }

        const patient = await getRow<{
            id: number;
            patientId: string;
            firstName: string;
            lastName: string;
            dateOfBirth: string;
            gender: string;
            contactNumber?: string;
            email?: string;
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
            assignedDoctorId?: number;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        }>(
            `SELECT p.*, u.firstName as doctorFirstName, u.lastName as doctorLastName
             FROM patients p
             LEFT JOIN users u ON p.assignedDoctorId = u.id
             WHERE p.id = ? AND p.isActive = 1`,
            [patientId]
        );

        if (!patient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: { patient }
        });

    } catch (error) {
        console.error('Get patient error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching patient' },
            { status: 500 }
        );
    }
}

// PUT /api/patients/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const patientId = parseInt(params.id);
        if (isNaN(patientId)) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid patient ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
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

        // Check if patient exists
        const existingPatient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
        if (!existingPatient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        // Validation
        if (!firstName || !lastName || !dateOfBirth || !gender) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Update patient
        await runQuery(
            `UPDATE patients SET 
                firstName = ?, lastName = ?, dateOfBirth = ?, gender = ?,
                contactNumber = ?, email = ?, street = ?, city = ?, 
                state = ?, zipCode = ?, country = ?, assignedDoctorId = ?,
                updatedAt = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [firstName, lastName, dateOfBirth, gender, contactNumber,
                email, street, city, state, zipCode, country, assignedDoctorId, patientId]
        );

        // Get the updated patient
        const patient = await getRow<{
            id: number;
            patientId: string;
            firstName: string;
            lastName: string;
            dateOfBirth: string;
            gender: string;
            contactNumber?: string;
            email?: string;
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
            assignedDoctorId?: number;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        }>(
            `SELECT p.*, u.firstName as doctorFirstName, u.lastName as doctorLastName
             FROM patients p
             LEFT JOIN users u ON p.assignedDoctorId = u.id
             WHERE p.id = ?`,
            [patientId]
        );

        return NextResponse.json({
            status: 'success',
            data: { patient }
        });

    } catch (error) {
        console.error('Update patient error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error updating patient' },
            { status: 500 }
        );
    }
}

// DELETE /api/patients/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const patientId = parseInt(params.id);
        if (isNaN(patientId)) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid patient ID' },
                { status: 400 }
            );
        }

        // Check if patient exists
        const existingPatient = await getRow('SELECT id FROM patients WHERE id = ? AND isActive = 1', [patientId]);
        if (!existingPatient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        // Soft delete - set isActive to 0
        await runQuery(
            'UPDATE patients SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [patientId]
        );

        return NextResponse.json({
            status: 'success',
            message: 'Patient deleted successfully'
        });

    } catch (error) {
        console.error('Delete patient error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error deleting patient' },
            { status: 500 }
        );
    }
}
