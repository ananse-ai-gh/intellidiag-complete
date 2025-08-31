import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRow, runQuery } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Generate JWT token
const generateToken = (id: number) => {
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
        const user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
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
        await runQuery('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            status: 'success',
            data: {
                user: userWithoutPassword,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error during login' },
            { status: 500 }
        );
    }
}
