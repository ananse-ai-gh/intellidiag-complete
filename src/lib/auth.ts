import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Helper function to verify JWT token
export const verifyToken = (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    } catch (error) {
        return null;
    }
};

// Helper function to generate JWT token
export const generateToken = (payload: { id: number; email: string; role: string }) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
