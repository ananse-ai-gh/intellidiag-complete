import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseDb } from '@/lib/supabaseDatabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Generate JWT token
const generateToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: '7d'
    });
};

// POST /api/auth/login
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Check if email and password exist
        if (!email || !password) {
            return NextResponse.json(
                { status: 'error', message: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // Check if user exists and password is correct
        const user = await supabaseDb.getUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password || ''))) {
            return NextResponse.json(
                { status: 'error', message: 'Incorrect email or password' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { status: 'error', message: 'Account is deactivated' },
                { status: 401 }
            );
        }

        // Update last login
        await supabaseDb.updateUser(user.id, {
            lastLogin: new Date().toISOString()
        });

        // Generate JWT token
        const token = generateToken(user.id);

        // Return user data and token
        return NextResponse.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error' },
            { status: 500 }
        );
    }
}