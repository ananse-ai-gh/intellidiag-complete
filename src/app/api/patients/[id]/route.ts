import { NextRequest, NextResponse } from 'next/server';
import { hybridDb } from '@/lib/hybridDatabase';
import jwt from 'jsonwebtoken';

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

        const patientId = params.id;
        if (!patientId) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid patient ID' },
                { status: 400 }
            );
        }

        const patient = await hybridDb.getPatientById(patientId);

        if (!patient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            data: {
                patient: {
                    id: patient.id,
                    patientId: patient.id, // Using id as patientId for compatibility
                    firstName: patient.first_name,
                    lastName: patient.last_name,
                    dateOfBirth: patient.date_of_birth,
                    gender: patient.gender,
                    contactNumber: patient.phone,
                    email: patient.email,
                    street: patient.address,
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    assignedDoctorId: null,
                    isActive: true,
                    createdAt: patient.created_at,
                    updatedAt: patient.updated_at
                }
            }
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

        const patientId = params.id;
        if (!patientId) {
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
        const existingPatient = await hybridDb.getPatientById(patientId);
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
        const updatedPatient = await hybridDb.updatePatient(patientId, {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            gender: gender as 'male' | 'female' | 'other',
            phone: contactNumber,
            email: email,
            address: street
        });

        return NextResponse.json({
            status: 'success',
            data: {
                patient: {
                    id: updatedPatient.id,
                    patientId: updatedPatient.id,
                    firstName: updatedPatient.first_name,
                    lastName: updatedPatient.last_name,
                    dateOfBirth: updatedPatient.date_of_birth,
                    gender: updatedPatient.gender,
                    contactNumber: updatedPatient.phone,
                    email: updatedPatient.email,
                    street: updatedPatient.address,
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    assignedDoctorId: null,
                    isActive: true,
                    createdAt: updatedPatient.created_at,
                    updatedAt: updatedPatient.updated_at
                }
            }
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

        const patientId = params.id;
        if (!patientId) {
            return NextResponse.json(
                { status: 'error', message: 'Invalid patient ID' },
                { status: 400 }
            );
        }

        // Check if patient exists
        const existingPatient = await hybridDb.getPatientById(patientId);
        if (!existingPatient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        // Delete patient
        await hybridDb.deletePatient(patientId);

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