import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabaseProfilesDatabase';
import { createServerSupabaseClient } from '@/lib/supabase';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { analysisStorage } from '@/lib/analysisStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Helper function to verify Supabase session
const verifySupabaseSession = async (request: NextRequest) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        const supabase = createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;
        return user;
    } catch (error) {
        return null;
    }
};

// POST /api/scans/[id]/analyze - Start AI analysis for a scan
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const user = await verifySupabaseSession(request);
        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;

        // Check if scan exists
        const scan = await db.getScanById(scanId);

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Get analysis type and image index from request body
        const body = await request.json();
        console.log('📋 Analysis request body:', body);
        const analysisType = body.analysisType || 'auto';
        const imageIndex = body.imageIndex || 0;
        const force = !!body.force;
        console.log('🔍 Analysis type:', analysisType, 'Image index:', imageIndex);

        // Check for existing completed analysis and short-circuit unless force is true
        const existingAnalyses = await db.getAnalysesByScanId(scanId);
        const existingAnalysis = existingAnalyses.find(a => a.image_index === imageIndex);

        if (existingAnalysis && existingAnalysis.status === 'completed' && !force) {
            return NextResponse.json({
                status: 'success',
                message: 'Using cached analysis result',
                data: {
                    scanId,
                    status: 'completed'
                }
            });
        }

        // Update scan status to analyzing
        await db.updateScan(scanId, {
            status: 'processing'
        });

        // Update or create AI analysis record for the specific image
        if (existingAnalysis) {
            await db.updateAnalysis(existingAnalysis.id, {
                status: 'processing'
            });
        } else {
            await db.createAnalysis({
                scan_id: scanId,
                image_index: imageIndex,
                analysis_type: analysisType,
                status: 'processing',
                confidence: 0,
                result: {}
            });
        }

        // Get the specific image URL for the given index
        const authHeader = request.headers.get('authorization') || '';
        console.log('🔐 Auth header for internal fetch:', authHeader ? 'Present' : 'Missing');

        const imagesResponse = await fetch(`${request.nextUrl.origin}/api/scans/${scanId}/images`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        if (!imagesResponse.ok) {
            console.error(`❌ Failed to fetch images: ${imagesResponse.status} ${imagesResponse.statusText}`);
            return NextResponse.json(
                { status: 'error', message: `Failed to fetch images: ${imagesResponse.statusText}` },
                { status: imagesResponse.status }
            );
        }

        const imagesData = await imagesResponse.json();
        console.log('📊 Images response data:', JSON.stringify(imagesData, null, 2));
        const images = imagesData?.data?.images || [];
        console.log(`📊 Fetched ${images.length} images for analysis`);

        if (imageIndex >= images.length) {
            return NextResponse.json(
                { status: 'error', message: `Image index ${imageIndex} not found. Only ${images.length} images available.` },
                { status: 400 }
            );
        }

        const imageUrl = images[imageIndex].url;

        // Start AI analysis in background
        processAnalysisInBackground(scanId, imageUrl, scan.scan_type, scan.body_part, analysisType, imageIndex);

        return NextResponse.json({
            status: 'success',
            message: 'AI analysis started successfully',
            data: {
                scanId,
                status: 'processing',
                estimatedTime: '30-60 seconds'
            }
        });

    } catch (error) {
        console.error('Error starting analysis:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error starting analysis',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Background processing function (no automatic retry)
async function processAnalysisInBackground(
    scanId: string,
    imagePath: string,
    scanType: string,
    bodyPart: string,
    analysisType: string,
    imageIndex: number = 0
) {
    try {
        const startTime = Date.now();
        console.log(`🔄 Starting analysis for scan ${scanId}, image ${imageIndex}`);

        // Handle Supabase URLs - fetch image from URL instead of local file
        let imageFile: File;

        if (imagePath.startsWith('http')) {
            // Fetch image from Supabase URL
            console.log(`📥 Fetching image from URL: ${imagePath}`);
            const response = await fetch(imagePath);
            console.log(`📊 Image fetch response status: ${response.status}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }

            const imageBuffer = await response.arrayBuffer();
            console.log(`📊 Image buffer size: ${imageBuffer.byteLength} bytes`);
            const fileName = imagePath.split('/').pop()?.split('?')[0] || 'scan.jpg';
            imageFile = new File([imageBuffer], fileName, { type: 'image/jpeg' });
            console.log(`📊 Created image file: ${fileName}, size: ${imageFile.size} bytes`);
        } else {
            // Handle local file path (legacy support)
            const { readFile } = await import('fs/promises');
            const { join } = await import('path');
            const imageBuffer = await readFile(join(process.cwd(), 'public', imagePath));
            imageFile = new File([new Uint8Array(imageBuffer)], 'scan.jpg', { type: 'image/jpeg' });
        }

        console.log(`📊 Performing ${analysisType} analysis on ${scanType} ${bodyPart} scan`);

        // Perform AI analysis
        console.log(`🤖 Calling AI analysis service...`);
        const analysisResult = await aiAnalysisService.performAnalysis(imageFile, scanType, bodyPart, analysisType);
        console.log(`✅ AI analysis completed:`, analysisResult ? 'Success' : 'Failed');

        // Generate LLM report if analysis was successful
        let llmReport = null;
        if (analysisResult) {
            try {
                // Send only text-based data to LLM report generation (exclude large image data)
                const llmData = {
                    detected_case: analysisResult.detected_case,
                    medical_note: analysisResult.medical_note,
                    overall_confidence: analysisResult.overall_confidence,
                    confidence_scores: analysisResult.confidence_scores,
                    scan_type: analysisResult.scan_type,
                    analysis_type: analysisType,
                    scan_type_original: scanType,
                    body_part: bodyPart
                };

                console.log('🤖 Generating LLM report with data:', {
                    detected_case: llmData.detected_case,
                    confidence: llmData.overall_confidence,
                    hasConfidenceScores: !!llmData.confidence_scores
                });

                llmReport = await aiAnalysisService.generateLLMReport(llmData);
                console.log('✅ LLM report generated successfully');
            } catch (error) {
                console.error('LLM report generation failed:', error);
            }
        }

        const processingTime = Date.now() - startTime;

        // Get the scan data for storage operations
        const scan = await db.getScanById(scanId);
        if (!scan) {
            console.error('❌ Scan not found during background processing:', scanId);
            // Bail out early; analysis record status will be left as processing/failed by caller
            return;
        }

        // Upload output images to Supabase Storage if analysis was successful
        let uploadedImageUrls: Record<string, string> = {};
        if (analysisResult && scan.created_by) {
            try {
                console.log('📤 Uploading analysis output images to Supabase Storage...');

                // Upload different types of output images
                const imageUploads = [];

                if (analysisResult.combined_image) {
                    imageUploads.push(
                        analysisStorage.uploadOutputImage(
                            scan.created_by,
                            scanId,
                            analysisType,
                            imageIndex,
                            analysisResult.combined_image,
                            'combined_image'
                        ).then(url => url ? { type: 'combined_image', url } : null)
                    );
                }

                if (analysisResult.ct_to_mri) {
                    imageUploads.push(
                        analysisStorage.uploadOutputImage(
                            scan.created_by,
                            scanId,
                            analysisType,
                            imageIndex,
                            analysisResult.ct_to_mri,
                            'ct_to_mri'
                        ).then(url => url ? { type: 'ct_to_mri', url } : null)
                    );
                }

                if (analysisResult.mri_to_ct) {
                    imageUploads.push(
                        analysisStorage.uploadOutputImage(
                            scan.created_by,
                            scanId,
                            analysisType,
                            imageIndex,
                            analysisResult.mri_to_ct,
                            'mri_to_ct'
                        ).then(url => url ? { type: 'mri_to_ct', url } : null)
                    );
                }

                if (analysisResult.converted_image) {
                    imageUploads.push(
                        analysisStorage.uploadOutputImage(
                            scan.created_by,
                            scanId,
                            analysisType,
                            imageIndex,
                            analysisResult.converted_image,
                            'converted_image'
                        ).then(url => url ? { type: 'converted_image', url } : null)
                    );
                }

                // Wait for all uploads to complete
                const uploadResults = await Promise.all(imageUploads);
                uploadResults.forEach(result => {
                    if (result) {
                        uploadedImageUrls[result.type] = result.url;
                    }
                });

                console.log(`✅ Uploaded ${Object.keys(uploadedImageUrls).length} analysis output images to Supabase Storage`);
            } catch (error) {
                console.error('❌ Error uploading analysis output images:', error);
                // Continue with analysis even if image upload fails
            }
        }

        // Update scan status to completed
        await db.updateScan(scanId, {
            status: 'completed'
        });

        // Update AI analysis with results for the specific image
        const analyses = await db.getAnalysesByScanId(scanId);
        const targetAnalysis = analyses.find(a => a.image_index === imageIndex);

        console.log(`🔍 Updating analysis for scan ${scanId}, image ${imageIndex}:`);
        console.log(`📊 Found ${analyses.length} analyses`);
        console.log(`🎯 Target analysis:`, targetAnalysis ? {
            id: targetAnalysis.id,
            status: targetAnalysis.status,
            analysis_type: targetAnalysis.analysis_type,
            image_index: targetAnalysis.image_index
        } : 'Not found');

        if (targetAnalysis) {
            const updateData = {
                status: 'completed' as 'completed',
                confidence: analysisResult?.overall_confidence || analysisResult?.confidence || 0,
                result: {
                    detected_case: analysisResult?.detected_case || analysisResult?.findings || '',
                    medical_note: analysisResult?.medical_note || analysisResult?.recommendations || '',
                    confidence_scores: analysisResult?.confidence_scores || {},
                    scan_type: analysisResult?.scan_type || '',
                    // Store only Supabase Storage URLs - no base64 data
                    combined_image: uploadedImageUrls.combined_image || null,
                    ct_to_mri: uploadedImageUrls.ct_to_mri || null,
                    mri_to_ct: uploadedImageUrls.mri_to_ct || null,
                    ssim: analysisResult?.ssim || null,
                    converted_image: uploadedImageUrls.converted_image || null,
                    // Store metadata for storage retrieval
                    storage_metadata: {
                        user_id: scan.created_by,
                        scan_id: scanId,
                        analysis_type: analysisType,
                        image_index: imageIndex
                    },
                    original_response: analysisResult?.original_response || analysisResult,
                    llm_report: llmReport?.report || null
                }
            };

            console.log(`📝 Updating analysis with:`, {
                status: updateData.status,
                confidence: updateData.confidence,
                hasResult: !!updateData.result,
                detectedCase: updateData.result.detected_case,
                hasCombinedImage: !!updateData.result.combined_image,
                combinedImageType: typeof updateData.result.combined_image,
                combinedImageLength: updateData.result.combined_image?.length || 0,
                uploadedImageUrls: uploadedImageUrls
            });

            await db.updateAnalysis(targetAnalysis.id, updateData);
            console.log(`✅ Analysis updated successfully`);

            // Verify the update by reading the analysis again
            const updatedAnalyses = await db.getAnalysesByScanId(scanId);
            const updatedAnalysis = updatedAnalyses.find(a => a.image_index === imageIndex);
            console.log(`🔍 Verification - Updated analysis status:`, updatedAnalysis ? {
                id: updatedAnalysis.id,
                status: updatedAnalysis.status,
                confidence: updatedAnalysis.confidence
            } : 'Not found');
        } else {
            console.error(`❌ No analysis found for image index ${imageIndex}`);
        }

        console.log(`✅ Analysis completed for scan ${scanId} in ${processingTime}ms`);

    } catch (error) {
        console.error(`❌ Error in background analysis for scan ${scanId}:`, error);

        // Mark as failed immediately (no automatic retry)
        console.error(`💥 Analysis failed for scan ${scanId}. User can retry manually.`);

        // Update scan status to failed
        await db.updateScan(scanId, {
            status: 'failed'
        });

        // Update AI analysis status to failed for the specific image
        const analyses = await db.getAnalysesByScanId(scanId);
        const targetAnalysis = analyses.find(a => a.image_index === imageIndex);
        if (targetAnalysis) {
            await db.updateAnalysis(targetAnalysis.id, {
                status: 'failed' as 'failed',
                result: {
                    error: error instanceof Error ? error.message : 'Analysis failed'
                }
            });
        }
    }
}