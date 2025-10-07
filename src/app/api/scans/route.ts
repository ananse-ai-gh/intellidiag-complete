import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { supabase, createServerSupabaseClient } from '@/lib/supabase';
import { scanQueueManager } from '@/services/scanQueueManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'scan-images';

// POST /api/scans - Create a new scan
export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Scan creation API called');
        console.log('Content-Type:', request.headers.get('content-type'));
        console.log('Authorization:', request.headers.get('authorization') ? 'Present' : 'Missing');

        // Verify authentication
        const user = await verifyToken(request);
        if (!user) {
            console.log('❌ Authentication failed');
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log('✅ User authenticated:', user.id);

        // Parse multipart form data
        const formData = await request.formData();
        console.log('✅ FormData parsed successfully');

        // Extract form fields
        const patientId = formData.get('patientId') as string;
        const scanType = formData.get('scanType') as string;
        const bodyPart = formData.get('bodyPart') as string;
        const priority = (formData.get('priority') as string) || 'medium';
        const notes = formData.get('notes') as string;
        const scanDate = formData.get('scanDate') as string;
        const analysisType = formData.get('analysisType') as string;
        const scanImage = formData.get('scanImage') as File;
        const scanImages = formData.getAll('scanImages') as File[];

        console.log('📋 Form fields received:');
        console.log('- patientId:', patientId);
        console.log('- scanType:', scanType);
        console.log('- bodyPart:', bodyPart);
        console.log('- priority:', priority);
        console.log('- scanImage:', scanImage ? `${scanImage.name} (${scanImage.size} bytes)` : 'Missing');

        // Validate required fields
        if (!patientId || !scanType || !bodyPart || (!scanImage && (!scanImages || scanImages.length === 0))) {
            console.log('❌ Missing required fields');
            return NextResponse.json(
                { status: 'error', message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate patient exists
        const patient = await db.getPatientById(patientId);
        if (!patient) {
            return NextResponse.json(
                { status: 'error', message: 'Patient not found' },
                { status: 404 }
            );
        }

        // Generate unique scan ID
        const scanId = `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Handle file upload to Supabase Storage (support multiple)
        let imagePath = '';
        const uploadedImagePaths: string[] = [];
        const filesToUpload: File[] = (scanImages && scanImages.length > 0) ? scanImages : (scanImage ? [scanImage] : []);
        if (filesToUpload.length > 0) {
            const serverSupabase = createServerSupabaseClient();
            let idx = 0;
            for (const file of filesToUpload) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const ext = file.name.split('.').pop();
                const suffix = idx === 0 ? '' : `-${idx}`;
                const fileName = `${scanId}${suffix}.${ext}`;
                const filePath = `scans/${fileName}`;

                const { error: upErr } = await serverSupabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(filePath, buffer, { contentType: file.type, upsert: false });
                if (upErr) {
                    console.error('❌ Error uploading to Supabase Storage:', upErr);
                    return NextResponse.json({ status: 'error', message: 'Failed to upload image' }, { status: 500 });
                }

                const { data: signedData, error: signedErr } = await serverSupabase.storage
                    .from(STORAGE_BUCKET)
                    .createSignedUrl(filePath, 60 * 60 * 24 * 7);
                if (signedErr) {
                    console.error('❌ Error creating signed URL:', signedErr);
                    return NextResponse.json({ status: 'error', message: 'Failed to create signed URL' }, { status: 500 });
                }
                uploadedImagePaths.push(signedData.signedUrl);
                if (idx === 0) imagePath = signedData.signedUrl; // first image thumbnail
                idx += 1;
            }
        }

        // Create scan in database
        console.log('📝 Creating scan in database with data:', {
            patient_id: patientId,
            scan_type: scanType,
            body_part: bodyPart,
            priority: priority,
            status: 'pending',
            file_path: imagePath,
            file_name: (filesToUpload[0] as File).name,
            file_size: (filesToUpload[0] as File).size,
            mime_type: (filesToUpload[0] as File).type,
            created_by: user.id
        });

        let scan;
        let scanData;
        try {
            // Start with minimal required fields
            scanData = {
                patient_id: patientId,
                scan_type: scanType,
                body_part: bodyPart,
                analysis_type: analysisType || 'auto',
                priority: (priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
                status: 'pending' as 'pending' | 'processing' | 'completed' | 'failed',
                file_path: imagePath,
                file_name: (filesToUpload[0] as File).name,
                file_size: (filesToUpload[0] as File).size,
                mime_type: (filesToUpload[0] as File).type,
                created_by: user.id
            };

            console.log('📝 Creating scan with data:', scanData);
            scan = await db.createScan(scanData);
            console.log('✅ Scan created successfully:', scan.id);

            // Update with additional fields after creation
            try {
                await db.updateScan(scan.id, {
                    ai_status: 'pending',
                    ai_analysis: null,
                    confidence: 0,
                    findings: '',
                    recommendations: '',
                    notes: notes || '',
                    retry_count: 0,
                    analysis_type: analysisType || 'auto'
                });
                console.log('✅ Scan updated with additional fields');
            } catch (updateError) {
                console.warn('⚠️ Warning: Could not update scan with additional fields:', updateError);
                // Don't fail the entire operation for this
            }

            // Create initial image record in scan_images table
            try {
                const serverSupabase = createServerSupabaseClient();
                const { error: imageRecordError } = await serverSupabase
                    .from('scan_images')
                    .insert({
                        scan_id: scan.id,
                        file_path: imagePath,
                        file_name: (filesToUpload[0] as File).name,
                        original_name: (filesToUpload[0] as File).name,
                        file_size: (filesToUpload[0] as File).size,
                        mime_type: (filesToUpload[0] as File).type,
                        image_index: 0
                    });

                if (imageRecordError) {
                    console.warn('⚠️ Warning: Could not create initial image record:', imageRecordError);
                } else {
                    console.log('✅ Initial image record created successfully');
                }
            } catch (imageError) {
                console.warn('⚠️ Warning: Could not create initial image record:', imageError);
                // Don't fail the entire operation for this
            }

        } catch (dbError) {
            console.error('❌ Database error creating scan:', dbError);
            console.error('❌ Error details:', JSON.stringify(dbError, null, 2));
            console.error('❌ Scan data that failed:', JSON.stringify(scanData, null, 2));
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Database error creating scan',
                    details: dbError instanceof Error ? dbError.message : 'Unknown database error',
                    errorCode: (dbError as any)?.code,
                    errorHint: (dbError as any)?.hint
                },
                { status: 500 }
            );
        }

        // Do not start analysis automatically. Analysis will be triggered from the analysis page.
        console.log('ℹ️ Skipping auto-analysis and queueing for scan:', scan.id);

        // Transform to expected format
        const createdScan = {
            id: scan.id,
            scanId: scan.id,
            patientId: scan.patient_id,
            scanType: scan.scan_type,
            bodyPart: scan.body_part,
            analysisType: scan.analysis_type,
            priority: scan.priority,
            status: scan.status,
            notes: notes || '',
            scanDate: scanDate || scan.created_at,
            createdAt: scan.created_at,
            updatedAt: scan.updated_at,
            patientFirstName: patient.first_name,
            patientLastName: patient.last_name,
            patientIdNumber: patient.id
        };

        return NextResponse.json({
            status: 'success',
            message: 'Scan created successfully and added to processing queue',
            data: {
                scan: createdScan,
                scanId: scanId,
                imagePath: imagePath,
                imagePaths: uploadedImagePaths,
                queueStatus: 'queued',
                message: 'Scan is queued for AI processing'
            }
        });

    } catch (error) {
        console.error('Error creating scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error creating scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// GET /api/scans - Get all scans
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user profile to check role
        const profile = await db.getProfileById(user.id);
        const isAdmin = profile?.role === 'admin';

        console.log(`📋 User ${user.id} (${profile?.role || 'no role'}) requesting scans - Admin: ${isAdmin}`);

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const scanType = searchParams.get('scanType');
        const patientId = searchParams.get('patientId');
        const includeArchived = searchParams.get('includeArchived') === 'true';

        // Get all scans
        let allScans = await db.getAllScans();

        // Filter out archived scans for non-admin users
        if (!isAdmin) {
            allScans = allScans.filter(scan => scan.status !== 'archived');
            console.log(`🔒 Non-admin user - filtered out archived scans. Remaining: ${allScans.length}`);
        } else if (!includeArchived) {
            // Even admins need to explicitly request archived scans
            allScans = allScans.filter(scan => scan.status !== 'archived');
            console.log(`👑 Admin user - excluding archived scans by default. Remaining: ${allScans.length}`);
        } else {
            console.log(`👑 Admin user - including archived scans. Total: ${allScans.length}`);
        }

        // Apply filters
        if (status) {
            allScans = allScans.filter(scan => scan.status === status);
        }
        if (scanType) {
            allScans = allScans.filter(scan => scan.scan_type === scanType);
        }
        if (patientId) {
            allScans = allScans.filter(scan => scan.patient_id === patientId);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedScans = allScans.slice(offset, offset + limit);

        // Transform to expected format
        const scans = await Promise.all(paginatedScans.map(async (scan) => {
            const patient = await db.getPatientById(scan.patient_id);
            const analyses = await db.getAnalysesByScanId(scan.id);
            const analysis = analyses[0];

            return {
                id: scan.id,
                scanId: scan.id,
                patientId: scan.patient_id,
                scanType: scan.scan_type,
                bodyPart: scan.body_part,
                priority: scan.priority,
                status: scan.status,
                file_path: scan.file_path,
                file_name: scan.file_name,
                notes: scan.notes || '',
                scanDate: scan.created_at,
                createdAt: scan.created_at,
                updatedAt: scan.updated_at,
                patientFirstName: patient?.first_name || '',
                patientLastName: patient?.last_name || '',
                patientIdNumber: patient?.id || '',
                uploadedByFirstName: 'User',
                uploadedByLastName: 'Name',
                aiStatus: analysis?.status || 'pending',
                confidence: analysis?.confidence || 0,
                aiFindings: analysis?.result?.findings || ''
            };
        }));

        const total = allScans.length;

        return NextResponse.json({
            status: 'success',
            data: {
                scans: scans || [],
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching scans:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error fetching scans',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT /api/scans - Update a scan
export async function PUT(request: NextRequest) {
    try {
        // Verify authentication
        const user = verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { scanId, scanType, bodyPart, priority, notes, scanDate } = body;

        // Validate required fields
        if (!scanId) {
            return NextResponse.json(
                { status: 'error', message: 'Scan ID is required' },
                { status: 400 }
            );
        }

        // Update scan in database
        const updatedScan = await db.updateScan(scanId, {
            scan_type: scanType,
            body_part: bodyPart,
            priority: priority as 'low' | 'medium' | 'high' | 'urgent',
            notes: notes || ''
        });

        // Get patient details
        const patient = await db.getPatientById(updatedScan.patient_id);

        // Transform to expected format
        const scanData = {
            id: updatedScan.id,
            scanId: updatedScan.id,
            patientId: updatedScan.patient_id,
            scanType: updatedScan.scan_type,
            bodyPart: updatedScan.body_part,
            priority: updatedScan.priority,
            status: updatedScan.status,
            notes: notes || '',
            scanDate: scanDate || updatedScan.created_at,
            createdAt: updatedScan.created_at,
            updatedAt: updatedScan.updated_at,
            patientFirstName: patient?.first_name || '',
            patientLastName: patient?.last_name || '',
            patientIdNumber: patient?.id || ''
        };

        return NextResponse.json({
            status: 'success',
            message: 'Scan updated successfully',
            data: { scan: scanData }
        });

    } catch (error) {
        console.error('Error updating scan:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error updating scan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}