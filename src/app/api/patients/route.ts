import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
// Address helpers removed: now using dedicated columns


// Helper function to verify Supabase session
const verifyToken = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch (error) {
        return null;
    }
};

// GET /api/patients
export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
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

        // Get all patients
        const allPatients = await db.getAllPatients();

        // Apply search filter
        let filteredPatients = allPatients;
        if (search) {
            filteredPatients = allPatients.filter(patient =>
                patient.first_name.toLowerCase().includes(search.toLowerCase()) ||
                patient.last_name.toLowerCase().includes(search.toLowerCase()) ||
                patient.email.toLowerCase().includes(search.toLowerCase()) ||
                patient.id.includes(search)
            );
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedPatients = filteredPatients.slice(offset, offset + limit);

        // Transform to expected format
        const patients = paginatedPatients.map(patient => ({
            id: patient.id,
            patientId: patient.id,
            firstName: patient.first_name,
            lastName: patient.last_name,
            dateOfBirth: patient.date_of_birth,
            gender: patient.gender,
            contactNumber: patient.phone,
            email: patient.email,
            street: (patient as any).street || patient.address || '',
            city: (patient as any).city || '',
            state: (patient as any).state || '',
            zipCode: (patient as any).zip_code || '',
            country: (patient as any).country || '',
            assignedDoctorId: null,
            isActive: true,
            createdAt: patient.created_at,
            updatedAt: patient.updated_at
        }));

        const total = filteredPatients.length;

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
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Unauthorized' },
                { status: 401 }
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

        // Validation
        if (!firstName || !lastName || !dateOfBirth || !gender) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Create new patient
        const patient = await db.createPatient({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            gender: gender as 'male' | 'female' | 'other',
            phone: contactNumber || '',
            email: email || '',
            address: street || '',
            street: street || '',
            city: city || '',
            state: state || '',
            zip_code: zipCode || '',
            country: country || '',
            medical_history: ''
        });

        return NextResponse.json({
            status: 'success',
            data: {
                patient: {
                    id: patient.id,
                    patientId: patient.id,
                    firstName: patient.first_name,
                    lastName: patient.last_name,
                    dateOfBirth: patient.date_of_birth,
                    gender: patient.gender,
                    contactNumber: patient.phone,
                    email: patient.email,
                    street: (patient as any).street || patient.address || '',
                    city: (patient as any).city || '',
                    state: (patient as any).state || '',
                    zipCode: (patient as any).zip_code || '',
                    country: (patient as any).country || '',
                    assignedDoctorId: null,
                    isActive: true,
                    createdAt: patient.created_at,
                    updatedAt: patient.updated_at
                }
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Create patient error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating patient' },
            { status: 500 }
        );
    }
}