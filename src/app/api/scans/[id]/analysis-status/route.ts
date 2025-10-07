import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabaseProfilesDatabase';
import { createServerSupabaseClient } from '@/lib/supabase';
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

// GET /api/scans/[id]/analysis-status - Get analysis status
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const user = await verifySupabaseSession(request);
        if (!user) {
            console.log('⚠️ Authentication failed - no valid session found');
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        console.log('✅ Authentication successful for user:', user.id);

        const scanId = params.id;
        const imageIndex = parseInt(request.nextUrl.searchParams.get('imageIndex') || '0');

        // Get scan data
        const scan = await db.getScanById(scanId);

        if (!scan) {
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            );
        }

        // Get analysis data for the specific image
        const analyses = await db.getAnalysesByScanId(scanId);
        const analysis = analyses.find(a => a.image_index === imageIndex);

        console.log(`🔍 Analysis status check for scan ${scanId}, image ${imageIndex}:`);
        console.log(`📊 Found ${analyses.length} analyses`);
        console.log(`📋 All analyses:`, analyses.map(a => ({
            id: a.id,
            imageIndex: a.image_index,
            status: a.status,
            analysisType: a.analysis_type
        })));
        console.log(`🎯 Target analysis:`, analysis ? {
            id: analysis.id,
            status: analysis.status,
            confidence: analysis.confidence,
            hasResult: !!analysis.result,
            analysisType: analysis.analysis_type,
            imageIndex: analysis.image_index
        } : 'Not found');


        // Retrieve image URLs from Supabase Storage or use base64 data as fallback
        let imageUrls: Record<string, string | null> = {};

        if (analysis?.result?.storage_metadata) {
            // New analyses: Try to get from Supabase Storage first
            const metadata = analysis.result.storage_metadata;
            console.log('📤 Retrieving images from Supabase Storage...');
            console.log('📋 Storage metadata:', metadata);

            try {
                const [combinedImageUrl, ctToMriUrl, mriToCtUrl, convertedImageUrl] = await Promise.all([
                    analysisStorage.getOutputImageUrl(metadata.user_id, metadata.scan_id, metadata.analysis_type, metadata.image_index, 'combined_image'),
                    analysisStorage.getOutputImageUrl(metadata.user_id, metadata.scan_id, metadata.analysis_type, metadata.image_index, 'ct_to_mri'),
                    analysisStorage.getOutputImageUrl(metadata.user_id, metadata.scan_id, metadata.analysis_type, metadata.image_index, 'mri_to_ct'),
                    analysisStorage.getOutputImageUrl(metadata.user_id, metadata.scan_id, metadata.analysis_type, metadata.image_index, 'converted_image')
                ]);

                imageUrls = {
                    combined_image: combinedImageUrl,
                    ct_to_mri: ctToMriUrl,
                    mri_to_ct: mriToCtUrl,
                    converted_image: convertedImageUrl
                };

                console.log(`✅ Retrieved ${Object.values(imageUrls).filter(Boolean).length} images from Supabase Storage`);
            } catch (error) {
                console.error('❌ Error retrieving images from Supabase Storage:', error);
            }
        }

        // Fallback: Use base64 data from database for old analyses
        if (!imageUrls.combined_image && analysis?.result?.combined_image) {
            imageUrls.combined_image = `data:image/png;base64,${analysis.result.combined_image}`;
        }
        if (!imageUrls.ct_to_mri && analysis?.result?.ct_to_mri) {
            imageUrls.ct_to_mri = `data:image/png;base64,${analysis.result.ct_to_mri}`;
        }
        if (!imageUrls.mri_to_ct && analysis?.result?.mri_to_ct) {
            imageUrls.mri_to_ct = `data:image/png;base64,${analysis.result.mri_to_ct}`;
        }
        if (!imageUrls.converted_image && analysis?.result?.converted_image) {
            imageUrls.converted_image = `data:image/png;base64,${analysis.result.converted_image}`;
        }


        const responseData = {
            scanStatus: scan.status,
            analysisStatus: analysis?.status || 'pending',
            confidence: analysis?.confidence,
            findings: analysis?.result?.detected_case || analysis?.result?.findings || '',
            recommendations: analysis?.result?.medical_note || analysis?.result?.recommendations || '',
            // pass-through rich fields for UI
            detected_case: analysis?.result?.detected_case,
            overall_confidence: analysis?.result?.overall_confidence,
            confidence_scores: analysis?.result?.confidence_scores,
            // Use Supabase Storage URLs (fallback to database URLs if available)
            combined_image: imageUrls.combined_image || analysis?.result?.combined_image,
            converted_image: imageUrls.converted_image || analysis?.result?.converted_image,
            ct_to_mri: imageUrls.ct_to_mri || analysis?.result?.ct_to_mri,
            mri_to_ct: imageUrls.mri_to_ct || analysis?.result?.mri_to_ct,
            ssim: analysis?.result?.ssim,
            medical_note: analysis?.result?.medical_note,
            processingTime: 0, // Will be populated with actual processing time
            modelVersion: 'v2.1', // Will be populated with actual model version
            updatedAt: analysis?.updated_at || scan.updated_at
        };

        console.log(`📤 Returning analysis status:`, {
            analysisStatus: responseData.analysisStatus,
            hasAnalysis: !!analysis,
            detected_case: responseData.detected_case,
            confidence: responseData.confidence,
            hasCombinedImage: !!responseData.combined_image,
            combinedImageType: typeof responseData.combined_image,
            combinedImageLength: responseData.combined_image?.length || 0,
            imageUrls: imageUrls
        });

        return NextResponse.json({
            status: 'success',
            data: responseData
        });

    } catch (error) {
        console.error('Error getting analysis status:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: 'Error getting analysis status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}