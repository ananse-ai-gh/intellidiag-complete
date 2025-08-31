import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, getRow } from '@/lib/database';

// POST /api/auth/register
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, role, specialization, licenseNumber } = body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return NextResponse.json(
                { status: 'error', message: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const result = await runQuery(
            'INSERT INTO users (email, password, firstName, lastName, role, specialization, licenseNumber) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName, role, specialization, licenseNumber]
        );

        // Get the created user
        const user = await getRow<{
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            specialization?: string;
            licenseNumber?: string;
            isActive: boolean;
            createdAt: string;
        }>(
            'SELECT id, email, firstName, lastName, role, specialization, licenseNumber, isActive, createdAt FROM users WHERE id = ?',
            [result.id]
        );

        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Error retrieving created user' },
                { status: 500 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            status: 'success',
            data: { user, token }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating user' },
            { status: 500 }
        );
    }
}
