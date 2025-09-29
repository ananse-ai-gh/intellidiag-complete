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

// GET /api/scans/[id]/annotations/export - Export annotations in various dataset formats
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
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'yolo'; // yolo, coco, pascal_voc
        const includeMeasurements = searchParams.get('includes_measurements') === 'true';

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

        // Group annotations by image index
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
                    if (includeMeasurements) {
                        groupedAnnotations[imageIndex].measurements.push(annotation.annotation_data);
                    }
                    break;
            }
        });

        let datasetExport;

        switch (format.toLowerCase()) {
            case 'yolo':
                datasetExport = exportYOLOFormat(groupedAnnotations);
                break;
            case 'coco':
                datasetExport = exportCOCOFormat(groupedAnnotations, scanId);
                break;
            case 'pascal_voc':
                datasetExport = exportPascalVOCFormat(groupedAnnotations);
                break;
            default:
                datasetExport = exportYOLOFormat(groupedAnnotations);
        }

        return NextResponse.json({
            status: 'success',
            data: datasetExport,
            metadata: {
                format: format,
                scanId: scanId,
                totalImages: Object.keys(groupedAnnotations).length,
                totalAnnotations: Object.values(groupedAnnotations).reduce((sum: number, img: any) =>
                    sum + img.shapes.length + img.textAnnotations.length + (includeMeasurements ? img.measurements.length : 0), 0),
                exportTimestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Annotations export error:', error);
        return NextResponse.json(
            { status: 'error', message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// YOLO Format: class_id center_x center_y width height (normalized 0-1)
function exportYOLOFormat(groupedAnnotations: any) {
    const labels: any = {};

    Object.entries(groupedAnnotations).forEach(([imageIndex, imageAnnotations]: [string, any]) => {
        const filename = `image_${imageIndex}.txt`;
        let yoloContent = '';

        imageAnnotations.shapes.forEach((shape: any) => {
            if (shape.coordinates && shape.label) {
                const coords = shape.coordinates.normalized || shape.coordinates;

                // Get class ID (create mapping)
                const classId = getOrCreateClassId(shape.label, labels);

                // YOLO format: class_id center_x center_Y width height
                switch (shape.type) {
                    case 'rectangle':
                        yoloContent += `${classId} ${coords.center.x || coords.normalized?.center?.X || 0} ${coords.center.Y || coords.normalized?.center?.Y || 0} ${coords.normalized?.width || coords.width} ${coords.normalized?.height || coords.height}\n`;
                        break;
                    case 'ellipse':
                        yoloContent += `${classId} ${coords.center.x || coords.normalized?.center?.X || 0} ${coords.center.Y || coords.normalized?.center?.Y || 0} ${coords.normalized?.width || coords.width} ${coords.normalized?.height || coords.height}\n`;
                        break;
                    case 'polygon':
                        // Convert polygon to minimum bounding box for YOLO
                        const polygonCoords = coords.points?.map((point: any) => ({
                            X: point.X || point.x / (shape.imageSize?.width || 1),
                            Y: point.Y || point.Y / (shape.imageSize?.height || 1)
                        })) || [];
                        if (polygonCoords.length > 0) {
                            const xs = polygonCoords.map((p: any) => p.X);
                            const ys = polygonCoords.map((p: any) => p.Y);
                            const bbox = {
                                centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
                                centerY: (Math.min(...ys) + Math.max(...ys)) / 2,
                                width: Math.max(...xs) - Math.min(...xs),
                                height: Math.max(...ys) - Math.min(...ys)
                            };
                            yoloContent += `${classId} ${bbox.centerX} ${bbox.centerY} ${bbox.width} ${bbox.height}\n`;
                        }
                        break;
                }
            }
        });

        labels[filename] = yoloContent.trim();
    });

    return {
        format: 'YOLO',
        files: labels,
        classes: Object.keys(labels).length > 0 ? Object.fromEntries(Object.entries(
            Object.keys(labels).reduce((acc: any, labelName: string, index: number) => {
                acc[labelName] = getOrCreateClassId(labelName, {});
                return acc;
            }, {})
        ).map(([label, id]: [string, any]) => [id, label.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')])) : {}
    };
}

// COCO Format: Complete dataset structure
function exportCOCOFormat(groupedAnnotations: any, scanId: string) {
    const images: any[] = [];
    const annotations: any[] = [];
    const categories: any[] = [];

    const categoryMap: any = {};

    // Process each image
    Object.entries(groupedAnnotations).forEach(([imageIndex, imageAnnotations]: [string, any]) => {
        const imageId = parseInt(imageIndex) + 1;

        // Add image info
        images.push({
            id: imageId,
            file_name: `scan_${scanId}_image_${imageIndex}.jpg`,
            width: imageAnnotations.shapes[0]?.imageSize?.width || 1024, // Default size
            height: imageAnnotations.shapes[0]?.imageSize?.height || 1024
        });

        // Process annotations
        imageAnnotations.shapes.forEach((shape: any, shapeIndex: number) => {
            if (shape.coordinates && shape.label) {
                const categoryId = getOrCreateCategoryId(shape.label, categories, categoryMap);

                const annotation: any = {
                    id: imageId * 1000 + shapeIndex + 1,
                    image_id: imageId,
                    category_id: categoryId,
                    segmentation: [],
                    area: shape.coordinates.area || 0,
                    bbox: [],
                    iscrowd: 0
                };

                // Calculate bbox [X, Y, width, height]
                switch (shape.type) {
                    case 'rectangle':
                    case 'ellipse':
                        const coords = shape.coordinates;
                        annotation.bbox = [
                            (coords.topLeft as any)?.x || (coords.topLeft as any)?.X || 0,
                            (coords.topLeft as any)?.Y || (coords.topLeft as any)?.Y || 0,
                            coords.width || 0,
                            coords.height || 0
                        ] as number[];
                        break;
                    case 'polygon':
                        const points = shape.coordinates.points || [];
                        const xs = points.map((p: any) => p.x || p.X);
                        const ys = points.map((p: any) => p.Y || p.Y);
                        annotation.bbox = [
                            Math.min(...xs),
                            Math.min(...ys),
                            Math.max(...xs) - Math.min(...xs),
                            Math.max(...ys) - Math.min(...ys)
                        ];
                        // Convert points to segmentation format
                        annotation.segmentation = [xs.flatMap((x: any, i: number) => [x, ys[i]])] as number[][];
                        break;
                }

                annotations.push(annotation);
            }
        });
    });

    return {
        info: {
            description: "IntelliDiag Medical Scan Annotations",
            version: "1.0",
            year: new Date().getFullYear(),
            contributor: "IntelliDiag Platform",
            date_created: new Date().toISOString()
        },
        licenses: [],
        images,
        annotations,
        categories
    };
}

// Pascal VOC Format: XML files per image
function exportPascalVOCFormat(groupedAnnotations: any) {
    const files: any = {};

    Object.entries(groupedAnnotations).forEach(([imageIndex, imageAnnotations]: [string, any]) => {
        const filename = `image_${imageIndex}.xml`;

        if (imageAnnotations.shapes.length === 0) return;

        const imageWidth = imageAnnotations.shapes[0]?.imageSize?.width || 1024;
        const imageHeight = imageAnnotations.shapes[0]?.imageSize?.height || 1024;

        const objectElements = imageAnnotations.shapes
            .filter((shape: any) => shape.coordinates && shape.label)
            .map((shape: any) => {
                const coords = shape.coordinates;

                switch (shape.type) {
                    case 'rectangle':
                    case 'ellipse':
                        return `
        <object>
          <name>${shape.label}</name>
          <pose>Unspecified</pose>
          <truncated>0</truncated>
          <occluded>0</occluded>
          <bndbox>
            <xmin>${(coords.topLeft as any)?.x || (coords.topLeft as any)?.X || 0}</Xmin>
            <Ymin>${(coords.topLeft as any)?.Y || (coords.topLeft as any)?.Y || 0}</Ymin>
            <Xmax>${(coords.bottomRight as any)?.x || (coords.bottomRight as any)?.X || 0}</Xmax>
            <Ymax>${(coords.bottomRight as any)?.Y || (coords.bottomRight as any)?.Y || 0}</Ymax>
          </bndbox>
        </object>`;

                    case 'polygon':
                        const points = coords.points || [];
                        const xs = points.map((p: any) => p.x || p.X);
                        const ys = points.map((p: any) => p.Y || p.Y);
                        return `
        <object>
          <name>${shape.label}</name>
          <pose>Unspecified</pose>
          <truncated>0</truncated>
          <occluded>0</occluded>
          <polygon>
            ${points.map((point: any, index: number) =>
                            `<X${index + 1}>${(point as any)?.x || (point as any)?.X || 0}</X${index + 1}>`
                        ).join('\n            ')}
          </polygon>
        </object>`;
                }
                return '';
            })
            .filter((obj: string) => obj.trim() !== '')
            .join('');

        files[filename] = `<?xml version="1.0"?>
<annotation>
  <filename>image_${imageIndex}.jpg</filename>
  <size>
    <width>${imageWidth}</width>
    <height>${imageHeight}</height>
    <depth>3</depth>
  </size>
  <segmented>0</segmented>
  ${objectElements}
</annotation>`;
    });

    return {
        format: 'Pascal VOC',
        files
    };
}

// Helper functions
function getOrCreateClassId(labelName: string, labelsObj: any): number {
    const normalizedLabel = labelName.toLowerCase();
    if (!labelsObj[normalizedLabel]) {
        labelsObj[normalizedLabel] = Object.keys(labelsObj).length;
    }
    return labelsObj[normalizedLabel];
}

function getOrCreateCategoryId(labelName: string, categories: any[], categoryMap: any): number {
    if (!categoryMap[labelName]) {
        const newId = categories.length + 1;
        categories.push({
            id: newId,
            name: labelName,
            supercategory: "medical"
        });
        categoryMap[labelName] = newId;
    }
    return categoryMap[labelName];
}
