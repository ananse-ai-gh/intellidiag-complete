import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

const verifySupabaseSession = async (request: NextRequest) => {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        const supabase = createServerSupabaseClient();

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return null;
        }

        return { id: user.id, email: user.email };
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
};

// GET /api/scans/[id]/annotations - Get all annotations for a scan
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;
        const supabase = createServerSupabaseClient();

        // Get all annotations for the scan
        const { data: annotations, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('scan_id', scanId)
            .order('image_index')
            .order('created_at');

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { status: 'error', message: 'Failed to fetch annotations' },
                { status: 500 }
            );
        }

        // Group annotations by image index and type
        const groupedAnnotations: { [imageIndex: number]: any } = {};

        annotations.forEach((annotation: any) => {
            const imageIndex = annotation.image_index;
            if (!groupedAnnotations[imageIndex]) {
                groupedAnnotations[imageIndex] = {
                    shapes: [],
                    textAnnotations: [],
                    measurements: []
                };
            }

            switch (annotation.annotation_type) {
                case 'shape':
                    groupedAnnotations[imageIndex].shapes.push(annotation.annotation_data);
                    break;
                case 'text':
                    groupedAnnotations[imageIndex].textAnnotations.push(annotation.annotation_data);
                    break;
                case 'measurement':
                    groupedAnnotations[imageIndex].measurements.push(annotation.annotation_data);
                    break;
            }
        });

        return NextResponse.json({
            status: 'success',
            data: { annotations: groupedAnnotations }
        });

    } catch (error) {
        console.error('Annotations fetch error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/scans/[id]/annotations - Save annotations for a scan
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const authResult = await verifySupabaseSession(request);
        if (!authResult) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const scanId = params.id;
        const { imageIndex, annotations } = await request.json();
        const supabase = createServerSupabaseClient();

        console.log('💾 Saving annotations for scan:', scanId, 'image index:', imageIndex);

        // Prepare annotation data for database
        const annotationsToSave: Array<{
            annotation_type: 'shape' | 'text' | 'measurement'
            annotation_data: any
        }> = []

        // Add shapes
        if (annotations.shapes && Array.isArray(annotations.shapes)) {
            annotations.shapes.forEach((shape: any) => {
                annotationsToSave.push({
                    annotation_type: 'shape',
                    annotation_data: shape
                })
            })
        }

        // Add text annotations
        if (annotations.textAnnotations && Array.isArray(annotations.textAnnotations)) {
            annotations.textAnnotations.forEach((textAnnotation: any) => {
                annotationsToSave.push({
                    annotation_type: 'text',
                    annotation_data: textAnnotation
                })
            })
        }

        // Add measurements
        if (annotations.measurements && Array.isArray(annotations.measurements)) {
            annotations.measurements.forEach((measurement: any) => {
                annotationsToSave.push({
                    annotation_type: 'measurement',
                    annotation_data: measurement
                })
            })
        }

        // Convert to database format
        const dbAnnotations = annotationsToSave.map(item => ({
            scan_id: scanId,
            image_index: imageIndex,
            annotation_type: item.annotation_type,
            annotation_data: item.annotation_data,
            created_by: authResult.id
        }))

        // Delete existing annotations for this image first
        const { error: deleteError } = await supabase
            .from('annotations')
            .delete()
            .eq('scan_id', scanId)
            .eq('image_index', imageIndex)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return NextResponse.json(
                { status: 'error', message: 'Failed to update annotations' },
                { status: 500 }
            )
        }

        // Insert new annotations
        if (dbAnnotations.length > 0) {
            const { error: insertError } = await supabase
                .from('annotations')
                .insert(dbAnnotations)

            if (insertError) {
                console.error('Insert error:', insertError)
                return NextResponse.json(
                    { status: 'error', message: 'Failed to save annotations' },
                    { status: 500 }
                )
            }
        }

        console.log(`✅ Successfully saved ${dbAnnotations.length} annotations`)

        return NextResponse.json({
            status: 'success',
            message: 'Annotations saved successfully',
            data: { count: dbAnnotations.length }
        })

    } catch (error) {
        console.error('Annotations save error:', error)
        return NextResponse.json(
            { status: 'error', message: 'Internal server error' },
            { status: 500 }
        )
    }
}