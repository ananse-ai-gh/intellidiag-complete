import { NextRequest, NextResponse } from 'next/server';
import { getAll, runQuery, getRow } from '@/lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

// GET /api/users
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
        const role = searchParams.get('role') || '';
        const offset = (page - 1) * limit;

        let sql = `
            SELECT id, email, firstName, lastName, role, specialization, licenseNumber, 
                   isActive, lastLogin, createdAt
            FROM users
            WHERE isActive = 1
        `;
        let params: any[] = [];

        if (search) {
            sql += ` AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            sql += ` AND role = ?`;
            params.push(role);
        }

        sql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const users = await getAll(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM users WHERE isActive = 1';
        let countParams: any[] = [];

        if (search) {
            countSql += ` AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (role) {
            countSql += ` AND role = ?`;
            countParams.push(role);
        }

        const countResult = await getRow<{ total: number }>(countSql, countParams);
        const total = countResult?.total || 0;

        return NextResponse.json({
            status: 'success',
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error fetching users' },
            { status: 500 }
        );
    }
}

// POST /api/users
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
        const newUser = await getRow<{
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

        return NextResponse.json({
            status: 'success',
            data: { user: newUser }
        }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Error creating user' },
            { status: 500 }
        );
    }
}
