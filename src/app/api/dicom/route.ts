import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { db } from '@/lib/database';
import * as dicomParser from 'dicom-parser';

export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_DICOM_BUCKET || 'dicom-images';

// DICOM Server API Routes

// POST /api/dicom/upload - Upload DICOM file to server
export async function POST(request: NextRequest) {
    try {
        console.log('🔍 DICOM upload API called');

        // Verify authentication
        const authHeader = request.headers.get('authorization');
        console.log('🔍 Auth header present:', !!authHeader);
        console.log('🔍 Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));

        if (!authHeader) {
            console.log('❌ No auth header provided');
            return NextResponse.json({ status: 'error', message: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('🔍 Token length:', token.length);
        console.log('🔍 Token starts with:', token.substring(0, 20) + '...');

        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
            console.log('❌ Supabase auth error:', authError.message);
            return NextResponse.json({
                status: 'error',
                message: 'Invalid authentication',
                details: { error: authError.message }
            }, { status: 401 });
        }

        if (!user) {
            console.log('❌ No user returned from Supabase');
            return NextResponse.json({ status: 'error', message: 'Invalid authentication' }, { status: 401 });
        }

        console.log('✅ User authenticated:', user.id, user.email);

        // Parse multipart form data
        const formData = await request.formData();
        const dicomFile = formData.get('dicomFile') as File;
        const studyId = formData.get('studyId') as string;
        const seriesId = formData.get('seriesId') as string;

        if (!dicomFile) {
            return NextResponse.json({ status: 'error', message: 'No DICOM file provided' }, { status: 400 });
        }

        // Generate unique identifiers
        const instanceId = `INST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const generatedStudyId = studyId || `STUDY-${Date.now()}`;
        const generatedSeriesId = seriesId || `SERIES-${Date.now()}`;

        // Upload file to Supabase Storage
        const bytes = await dicomFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${generatedStudyId}/${generatedSeriesId}/${instanceId}.dcm`;
        const filePath = `dicom/${fileName}`;

        const serverSupabase = createServerSupabaseClient();
        const { error: uploadError } = await serverSupabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, buffer, {
                contentType: 'application/dicom',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Error uploading DICOM file:', uploadError);

            // Provide specific error messages based on the error type
            let errorMessage = 'Failed to upload DICOM file';
            if (uploadError.message.includes('Bucket not found')) {
                errorMessage = 'DICOM storage bucket not found. Please create the "dicom-images" bucket in Supabase Storage.';
            } else if (uploadError.message.includes('permission')) {
                errorMessage = 'Permission denied. Please check your bucket policies.';
            } else if (uploadError.message.includes('already exists')) {
                errorMessage = 'File already exists. Please try with a different file.';
            }

            return NextResponse.json({
                status: 'error',
                message: errorMessage,
                details: {
                    bucket: STORAGE_BUCKET,
                    error: uploadError.message,
                    code: uploadError.statusCode
                }
            }, { status: 500 });
        }

        // Parse DICOM metadata
        let dicomMetadata: {
            studyInstanceUID: string;
            seriesInstanceUID: string;
            sopInstanceUID: string;
            patientName: string;
            patientId: string;
            studyDate: string;
            studyTime: string;
            modality: string;
            studyDescription: string;
            seriesDescription: string;
            numberOfFrames?: number;
            rows?: number;
            columns?: number;
            bitsAllocated?: number;
            bitsStored?: number;
            pixelSpacing?: string;
            windowCenter?: string;
            windowWidth?: string;
        } = {
            studyInstanceUID: generatedStudyId,
            seriesInstanceUID: generatedSeriesId,
            sopInstanceUID: instanceId,
            patientName: 'Unknown',
            patientId: 'Unknown',
            studyDate: new Date().toISOString().split('T')[0],
            studyTime: '000000',
            modality: 'OT',
            studyDescription: 'DICOM Study',
            seriesDescription: 'DICOM Series'
        };
        try {
            const dataSet = dicomParser.parseDicom(buffer);
            dicomMetadata = {
                studyInstanceUID: dataSet.string('x0020000d') || generatedStudyId,
                seriesInstanceUID: dataSet.string('x0020000e') || generatedSeriesId,
                sopInstanceUID: dataSet.string('x00080018') || instanceId,
                patientName: dataSet.string('x00100010') || 'Unknown',
                patientId: dataSet.string('x00100020') || 'Unknown',
                studyDate: dataSet.string('x00080020') || new Date().toISOString().split('T')[0],
                studyTime: dataSet.string('x00080030') || '000000',
                modality: dataSet.string('x00080060') || 'OT',
                studyDescription: dataSet.string('x00081030') || 'DICOM Study',
                seriesDescription: dataSet.string('x0008103e') || 'DICOM Series',
                numberOfFrames: dataSet.uint16('x00280008') || 1,
                rows: dataSet.uint16('x00280010') || 0,
                columns: dataSet.uint16('x00280011') || 0,
                bitsAllocated: dataSet.uint16('x00280100') || 16,
                bitsStored: dataSet.uint16('x00280101') || 16,
                pixelSpacing: dataSet.string('x00280030') || '1\\1',
                windowCenter: dataSet.string('x00281050') || '0',
                windowWidth: dataSet.string('x00281051') || '0'
            };
        } catch (parseError) {
            console.warn('⚠️ Could not parse DICOM metadata:', parseError);
            dicomMetadata = {
                studyInstanceUID: generatedStudyId,
                seriesInstanceUID: generatedSeriesId,
                sopInstanceUID: instanceId,
                patientName: 'Unknown',
                patientId: 'Unknown',
                studyDate: new Date().toISOString().split('T')[0],
                studyTime: '000000',
                modality: 'OT',
                studyDescription: 'DICOM Study',
                seriesDescription: 'DICOM Series'
            };
        }

        // Store DICOM metadata in database
        const dicomRecord = {
            study_instance_uid: dicomMetadata.studyInstanceUID,
            series_instance_uid: dicomMetadata.seriesInstanceUID,
            sop_instance_uid: dicomMetadata.sopInstanceUID,
            file_path: filePath,
            file_name: dicomFile.name,
            file_size: dicomFile.size,
            patient_name: dicomMetadata.patientName,
            patient_id: dicomMetadata.patientId,
            study_date: dicomMetadata.studyDate,
            study_time: dicomMetadata.studyTime,
            modality: dicomMetadata.modality,
            study_description: dicomMetadata.studyDescription,
            series_description: dicomMetadata.seriesDescription,
            number_of_frames: dicomMetadata.numberOfFrames || 1,
            rows: dicomMetadata.rows || 0,
            columns: dicomMetadata.columns || 0,
            bits_allocated: dicomMetadata.bitsAllocated || 16,
            bits_stored: dicomMetadata.bitsStored || 16,
            pixel_spacing: dicomMetadata.pixelSpacing || '1\\1',
            window_center: dicomMetadata.windowCenter || '0',
            window_width: dicomMetadata.windowWidth || '0',
            uploaded_by: user.id,
            created_at: new Date().toISOString()
        };

        // Store in database using Supabase
        const { data: studyData, error: studyError } = await serverSupabase
            .from('dicom_studies')
            .upsert({
                study_instance_uid: dicomMetadata.studyInstanceUID,
                patient_name: dicomMetadata.patientName,
                patient_id: dicomMetadata.patientId,
                study_date: dicomMetadata.studyDate,
                study_time: dicomMetadata.studyTime,
                modality: dicomMetadata.modality,
                study_description: dicomMetadata.studyDescription
            })
            .select()
            .single();

        if (studyError) {
            console.error('❌ Error storing study:', studyError);
            return NextResponse.json({ status: 'error', message: 'Failed to store study metadata' }, { status: 500 });
        }

        const { data: seriesData, error: seriesError } = await serverSupabase
            .from('dicom_series')
            .upsert({
                study_id: studyData.id,
                series_instance_uid: dicomMetadata.seriesInstanceUID,
                series_number: 1,
                modality: dicomMetadata.modality,
                series_description: dicomMetadata.seriesDescription,
                number_of_instances: 1
            })
            .select()
            .single();

        if (seriesError) {
            console.error('❌ Error storing series:', seriesError);
            return NextResponse.json({ status: 'error', message: 'Failed to store series metadata' }, { status: 500 });
        }

        const { data: instanceData, error: instanceError } = await serverSupabase
            .from('dicom_instances')
            .upsert({
                series_id: seriesData.id,
                sop_instance_uid: dicomMetadata.sopInstanceUID,
                instance_number: 1,
                sop_class_uid: '1.2.840.10008.5.1.4.1.1.2', // CT Image Storage
                file_path: filePath,
                file_name: dicomFile.name,
                file_size: dicomFile.size,
                rows: dicomMetadata.rows || 0,
                columns: dicomMetadata.columns || 0,
                bits_allocated: dicomMetadata.bitsAllocated || 16,
                bits_stored: dicomMetadata.bitsStored || 16,
                pixel_spacing: dicomMetadata.pixelSpacing || '1\\1',
                window_center: dicomMetadata.windowCenter || '0',
                window_width: dicomMetadata.windowWidth || '0',
                number_of_frames: dicomMetadata.numberOfFrames || 1
            })
            .select()
            .single();

        if (instanceError) {
            console.error('❌ Error storing instance:', instanceError);
            return NextResponse.json({ status: 'error', message: 'Failed to store instance metadata' }, { status: 500 });
        }

        console.log('📝 Storing DICOM metadata:', dicomRecord);

        return NextResponse.json({
            status: 'success',
            message: 'DICOM file uploaded successfully',
            data: {
                studyInstanceUID: dicomMetadata.studyInstanceUID,
                seriesInstanceUID: dicomMetadata.seriesInstanceUID,
                sopInstanceUID: dicomMetadata.sopInstanceUID,
                filePath: filePath,
                metadata: dicomMetadata
            }
        });

    } catch (error) {
        console.error('Error uploading DICOM file:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error uploading DICOM file',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// GET /api/dicom/studies - Get all studies (QIDO-RS)
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ status: 'error', message: 'Authentication required' }, { status: 401 });
        }

        const supabase = createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

        if (authError || !user) {
            return NextResponse.json({ status: 'error', message: 'Invalid authentication' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const studyInstanceUID = searchParams.get('studyInstanceUID');

        // Fetch studies from database
        let query = supabase
            .from('dicom_studies')
            .select(`
                *,
                dicom_series (
                    id,
                    series_instance_uid,
                    series_number,
                    modality,
                    series_description,
                    number_of_instances,
                    dicom_instances (
                        id,
                        sop_instance_uid,
                        instance_number,
                        file_path,
                        file_name,
                        file_size,
                        rows,
                        columns,
                        bits_allocated,
                        bits_stored,
                        pixel_spacing,
                        window_center,
                        window_width,
                        number_of_frames
                    )
                )
            `)
            .order('study_date', { ascending: false });

        if (studyInstanceUID) {
            query = query.eq('study_instance_uid', studyInstanceUID);
        }

        const { data: studies, error: studiesError } = await query;

        if (studiesError) {
            console.error('Error fetching studies:', studiesError);
            return NextResponse.json({ status: 'error', message: 'Failed to fetch studies' }, { status: 500 });
        }

        // Convert to OHIF format
        const ohifStudies = studies?.map((study: any) => ({
            "0020000D": {
                "vr": "UI",
                "Value": [study.study_instance_uid]
            },
            "00080020": {
                "vr": "DA",
                "Value": [study.study_date?.replace(/-/g, '') || '']
            },
            "00080030": {
                "vr": "TM",
                "Value": [study.study_time?.replace(/:/g, '') || '']
            },
            "00080050": {
                "vr": "SH",
                "Value": [study.study_id || '']
            },
            "00080060": {
                "vr": "CS",
                "Value": [study.modality || '']
            },
            "00081030": {
                "vr": "LO",
                "Value": [study.study_description || '']
            },
            "00100010": {
                "vr": "PN",
                "Value": [{
                    "Alphabetic": study.patient_name || 'Unknown'
                }]
            },
            "00100020": {
                "vr": "LO",
                "Value": [study.patient_id || '']
            },
            "00100030": {
                "vr": "DA",
                "Value": [study.patient_birth_date?.replace(/-/g, '') || '']
            },
            "00100040": {
                "vr": "CS",
                "Value": [study.patient_sex || '']
            }
        })) || [];

        return NextResponse.json(ohifStudies);

    } catch (error) {
        console.error('Error fetching studies:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Error fetching studies',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
