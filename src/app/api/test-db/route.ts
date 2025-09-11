import { NextRequest, NextResponse } from 'next/server';
import { getRow, getAll } from '@/lib/database';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/test-db
export async function GET(request: NextRequest) {
    try {
        console.log('Testing database connection...');

        // Test basic database queries
        const patientCount = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM patients');
        const scanCount = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM scans');
        const userCount = await getRow<{ count: number }>('SELECT COUNT(*) as count FROM users');

        console.log('Database queries successful');

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            data: {
                patients: patientCount?.count || 0,
                scans: scanCount?.count || 0,
                users: userCount?.count || 0
            }
        });

    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Database connection failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// POST /api/test-db - Test AI API connectivity
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const endpoint = formData.get('endpoint') as string;

        if (!file || !endpoint) {
            return NextResponse.json(
                { status: 'error', message: 'File and endpoint are required' },
                { status: 400 }
            );
        }

        const AI_API_BASE_URL = 'https://image-name-136538419615.us-central1.run.app';

        let apiEndpoint = '';
        let taskType = '';

        switch (endpoint) {
            case 'brain_tumor':
                apiEndpoint = `${AI_API_BASE_URL}/predict2`;
                break;
            case 'breast_cancer':
                apiEndpoint = `${AI_API_BASE_URL}/breastancerdetect`;
                break;
            case 'lung_tumor':
                apiEndpoint = `${AI_API_BASE_URL}/lunganalysis`;
                break;
            case 'ct_to_mri':
                apiEndpoint = `${AI_API_BASE_URL}/mritoct`; // Same API endpoint
                taskType = 'ct_to_mri';
                break;
            case 'mri_to_ct':
                apiEndpoint = `${AI_API_BASE_URL}/mritoct`; // Same API endpoint
                taskType = 'mri_to_ct';
                break;
            default:
                return NextResponse.json(
                    { status: 'error', message: 'Invalid endpoint' },
                    { status: 400 }
                );
        }

        console.log(`Testing ${endpoint} endpoint: ${apiEndpoint}`);
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Create new FormData for the external API
        const externalFormData = new FormData();
        externalFormData.append('file', file);

        const response = await axios.post(apiEndpoint, externalFormData, {
            timeout: 30000,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        console.log(`${endpoint} response:`, response.data);

        return NextResponse.json({
            status: 'success',
            message: `Successfully tested ${endpoint}`,
            data: {
                endpoint,
                taskType,
                response: response.data,
                status: response.status,
                headers: response.headers
            }
        });

    } catch (error: any) {
        console.error('Test image analysis error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Error testing image analysis',
            data: {
                error: error.message,
                status: error.response?.status,
                response: error.response?.data,
                details: error.response?.statusText || 'Unknown error'
            }
        }, { status: 500 });
    }
}
