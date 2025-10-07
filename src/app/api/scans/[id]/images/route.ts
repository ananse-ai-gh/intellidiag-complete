import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { db } from '@/lib/database'

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'scan-images'

// Verify authentication helper
const verifyToken = async (request: NextRequest) => {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return null

        const supabase = createServerSupabaseClient()
        const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

        if (error || !user) return null
        return user
    } catch (error) {
        return null
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const scanId = params.id

        // Verify authentication
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json({ status: 'error', message: 'Authentication required' }, { status: 401 })
        }

        const supabase = createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

        if (authError || !user) {
            return NextResponse.json({ status: 'error', message: 'Invalid authentication' }, { status: 401 })
        }

        // Get scan details
        const scan = await db.getScanById(scanId)
        if (!scan) {
            return NextResponse.json({ status: 'error', message: 'Scan not found' }, { status: 404 })
        }

        console.log('🔍 Fetching images for scan:', scanId)

        // Get images from scan_images table
        const { data: scanImages, error: imagesError } = await supabase
            .from('scan_images')
            .select('*')
            .eq('scan_id', scanId)
            .order('image_index', { ascending: true })

        if (imagesError) {
            console.error('❌ Error fetching scan images from database:', imagesError)
            return NextResponse.json({ status: 'error', message: 'Failed to fetch images' }, { status: 500 })
        }

        console.log('📊 Scan images from database:', scanImages?.length || 0)

        const urls: { url: string; name: string; id: string; imageIndex: number }[] = []

        // Add images from scan_images table
        if (scanImages && scanImages.length > 0) {
            for (const image of scanImages) {
                urls.push({
                    url: image.file_path,
                    name: image.file_name,
                    id: image.id,
                    imageIndex: image.image_index
                })
            }
        }

        // If no images in database, fallback to original scan file_path
        if (urls.length === 0 && scan.file_path) {
            console.log('⚠️ No images in database, using original scan file_path as fallback')
            urls.push({
                url: scan.file_path,
                name: scan.file_name || 'image',
                id: 'original',
                imageIndex: 0
            })
        }

        console.log('🎯 Final URLs generated:', urls.length)
        console.log('📋 Final URL names:', urls.map(u => u.name))

        return NextResponse.json({
            status: 'success',
            data: { images: urls }
        })

    } catch (error) {
        console.error('Error fetching scan images:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Internal server error'
        }, { status: 500 })
    }
}

// POST /api/scans/[id]/images - Upload additional images to existing scan
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const scanId = params.id
        console.log('📤 Upload additional image API called for scan:', scanId)

        // Verify authentication
        const user = await verifyToken(request)
        if (!user) {
            console.log('❌ Authentication failed')
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            )
        }

        console.log('✅ User authenticated:', user.id)

        // Get scan details to verify it exists
        const scan = await db.getScanById(scanId)
        if (!scan) {
            console.log('❌ Scan not found:', scanId)
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            )
        }

        console.log('✅ Scan found:', scan.id)

        // Parse multipart form data
        const formData = await request.formData()
        const imageFile = formData.get('image') as File

        if (!imageFile) {
            console.log('❌ No image file provided')
            return NextResponse.json(
                { status: 'error', message: 'No image file provided' },
                { status: 400 }
            )
        }

        console.log('📋 Image file received:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
        })

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/dicom']
        const isValidType = validTypes.includes(imageFile.type) || imageFile.name.toLowerCase().endsWith('.dcm')

        if (!isValidType) {
            console.log('❌ Invalid file type:', imageFile.type)
            return NextResponse.json(
                { status: 'error', message: 'Invalid file type. Please upload JPEG, PNG, GIF, or DICOM files.' },
                { status: 400 }
            )
        }

        // Upload to Supabase Storage
        const supabase = createServerSupabaseClient()

        // Generate unique filename
        const timestamp = Date.now()
        const ext = imageFile.name.split('.').pop() || 'jpg'
        const fileName = `${scanId}-${timestamp}.${ext}`
        const filePath = `scans/${fileName}`

        console.log('📤 Uploading to storage:', filePath)

        // Convert file to buffer
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, buffer, {
                contentType: imageFile.type,
                upsert: false
            })

        if (uploadError) {
            console.error('❌ Error uploading to Supabase Storage:', uploadError)
            return NextResponse.json(
                { status: 'error', message: 'Failed to upload image to storage' },
                { status: 500 }
            )
        }

        console.log('✅ Image uploaded to storage successfully')

        // Create signed URL for the uploaded image
        const { data: signedData, error: signedError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

        if (signedError) {
            console.error('❌ Error creating signed URL:', signedError)
            return NextResponse.json(
                { status: 'error', message: 'Failed to create signed URL' },
                { status: 500 }
            )
        }

        console.log('✅ Signed URL created successfully')

        // Get the next image index for this scan
        const { data: existingImages, error: countError } = await supabase
            .from('scan_images')
            .select('image_index')
            .eq('scan_id', scanId)
            .order('image_index', { ascending: false })
            .limit(1)

        if (countError) {
            console.error('❌ Error getting existing images count:', countError)
            return NextResponse.json(
                { status: 'error', message: 'Failed to get existing images count' },
                { status: 500 }
            )
        }

        const nextImageIndex = existingImages && existingImages.length > 0
            ? existingImages[0].image_index + 1
            : 0

        console.log('📊 Next image index:', nextImageIndex)

        // Create database record for the uploaded image
        const { data: imageRecord, error: dbError } = await supabase
            .from('scan_images')
            .insert({
                scan_id: scanId,
                file_path: signedData.signedUrl,
                file_name: fileName,
                original_name: imageFile.name,
                file_size: imageFile.size,
                mime_type: imageFile.type,
                image_index: nextImageIndex
            })
            .select()
            .single()

        if (dbError) {
            console.error('❌ Error creating database record:', dbError)
            return NextResponse.json(
                { status: 'error', message: 'Failed to create database record' },
                { status: 500 }
            )
        }

        console.log('✅ Database record created successfully:', imageRecord.id)

        // Return the uploaded image data
        const uploadedImage = {
            id: imageRecord.id,
            url: signedData.signedUrl,
            name: fileName,
            originalName: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
            imageIndex: nextImageIndex,
            uploadedAt: new Date().toISOString()
        }

        console.log('🎉 Image upload completed successfully')

        return NextResponse.json({
            status: 'success',
            message: 'Image uploaded successfully',
            data: {
                image: uploadedImage,
                scanId: scanId
            }
        })

    } catch (error) {
        console.error('❌ Error uploading additional image:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Error uploading image',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// DELETE /api/scans/[id]/images - Delete an image from a scan
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const scanId = params.id
        const { searchParams } = new URL(request.url)
        const imageIndex = parseInt(searchParams.get('imageIndex') || '0')

        console.log('🗑️ Delete image API called for scan:', scanId, 'image index:', imageIndex)

        // Verify authentication
        const user = await verifyToken(request)
        if (!user) {
            console.log('❌ Authentication failed')
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            )
        }

        console.log('✅ User authenticated:', user.id)

        // Get scan details to verify it exists
        const scan = await db.getScanById(scanId)
        if (!scan) {
            console.log('❌ Scan not found:', scanId)
            return NextResponse.json(
                { status: 'error', message: 'Scan not found' },
                { status: 404 }
            )
        }

        console.log('✅ Scan found:', scan.id)

        // Get Supabase client
        const supabase = createServerSupabaseClient()

        // Get all images for this scan
        const { data: scanImages, error: imagesError } = await supabase
            .from('scan_images')
            .select('*')
            .eq('scan_id', scanId)
            .order('image_index', { ascending: true })

        if (imagesError) {
            console.error('❌ Error fetching scan images:', imagesError)
            return NextResponse.json(
                { status: 'error', message: 'Failed to fetch scan images' },
                { status: 500 }
            )
        }

        if (!scanImages || scanImages.length === 0) {
            console.log('❌ No images found for scan:', scanId)
            return NextResponse.json(
                { status: 'error', message: 'No images found for this scan' },
                { status: 404 }
            )
        }

        if (imageIndex >= scanImages.length) {
            console.log('❌ Image index out of range:', imageIndex, 'available:', scanImages.length)
            return NextResponse.json(
                { status: 'error', message: 'Image index out of range' },
                { status: 400 }
            )
        }

        // Don't allow deleting the last image
        if (scanImages.length === 1) {
            console.log('❌ Cannot delete the last image from a scan')
            return NextResponse.json(
                { status: 'error', message: 'Cannot delete the last image from a scan' },
                { status: 400 }
            )
        }

        const imageToDelete = scanImages[imageIndex]
        console.log('🗑️ Deleting image:', imageToDelete.id, imageToDelete.file_name)

        // Delete from Supabase Storage
        // Extract file path from the stored URL
        let filePath = imageToDelete.file_path
        if (filePath.startsWith('http')) {
            // Extract the file path from the Supabase Storage URL
            const urlParts = filePath.split('/')
            const fileName = urlParts[urlParts.length - 1].split('?')[0]
            filePath = `scans/${fileName}`
        }

        console.log('🗑️ Deleting from storage:', filePath)

        try {
            const { error: storageError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([filePath])

            if (storageError) {
                console.error('❌ Error deleting from storage:', storageError)
                // Continue with database deletion even if storage deletion fails
            } else {
                console.log('✅ Image deleted from storage successfully')
            }
        } catch (storageException) {
            console.error('❌ Exception deleting from storage:', storageException)
            // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        console.log('🗑️ Deleting from database:', imageToDelete.id)
        const { error: dbError } = await supabase
            .from('scan_images')
            .delete()
            .eq('id', imageToDelete.id)

        if (dbError) {
            console.error('❌ Error deleting from database:', dbError)
            return NextResponse.json(
                { status: 'error', message: `Failed to delete image from database: ${dbError.message}` },
                { status: 500 }
            )
        }

        console.log('✅ Image deleted from database successfully')

        // Reindex remaining images to maintain sequential order
        const remainingImages = scanImages.filter((img: any, index: number) => index !== imageIndex)
        console.log('🔄 Reindexing', remainingImages.length, 'remaining images')

        try {
            for (let i = 0; i < remainingImages.length; i++) {
                const image = remainingImages[i]
                if (image.image_index !== i) {
                    console.log(`🔄 Reindexing image ${image.id} from ${image.image_index} to ${i}`)
                    const { error: updateError } = await supabase
                        .from('scan_images')
                        .update({ image_index: i })
                        .eq('id', image.id)

                    if (updateError) {
                        console.error('❌ Error reindexing image:', updateError)
                    } else {
                        console.log(`✅ Reindexed image ${image.id} to index ${i}`)
                    }
                }
            }
        } catch (reindexException) {
            console.error('❌ Exception during reindexing:', reindexException)
            // Continue - reindexing failure is not critical
        }

        // Update analysis indices for remaining images (before deleting the target analysis)
        console.log('🔄 Updating analysis indices for remaining images')
        try {
            // Get all analyses for this scan
            const { data: allAnalyses, error: analysesFetchError } = await supabase
                .from('analyses')
                .select('*')
                .eq('scan_id', scanId)
                .order('image_index', { ascending: true })

            if (analysesFetchError) {
                console.error('❌ Error fetching analyses:', analysesFetchError)
            } else if (allAnalyses && allAnalyses.length > 0) {
                console.log(`📊 Found ${allAnalyses.length} analyses to update`)

                // Update analysis indices for images that come after the deleted image
                for (const analysis of allAnalyses) {
                    if (analysis.image_index > imageIndex) {
                        const newIndex = analysis.image_index - 1
                        console.log(`🔄 Updating analysis ${analysis.id} from index ${analysis.image_index} to ${newIndex}`)

                        const { error: updateAnalysisError } = await supabase
                            .from('analyses')
                            .update({ image_index: newIndex })
                            .eq('id', analysis.id)

                        if (updateAnalysisError) {
                            console.error('❌ Error updating analysis index:', updateAnalysisError)
                        } else {
                            console.log(`✅ Updated analysis ${analysis.id} to index ${newIndex}`)
                        }
                    }
                }
            }
        } catch (analysisUpdateException) {
            console.error('❌ Exception during analysis index update:', analysisUpdateException)
        }

        // Delete any analyses associated with the deleted image
        console.log('🗑️ Deleting analyses for scan:', scanId, 'image index:', imageIndex)
        const { error: analysisError } = await supabase
            .from('analyses')
            .delete()
            .eq('scan_id', scanId)
            .eq('image_index', imageIndex)

        if (analysisError) {
            console.error('❌ Error deleting analyses:', analysisError)
            // Continue - this is not critical
        } else {
            console.log('✅ Deleted analyses for image index:', imageIndex)
        }

        console.log('🎉 Image deletion completed successfully')

        return NextResponse.json({
            status: 'success',
            message: 'Image deleted successfully',
            data: {
                deletedImageIndex: imageIndex,
                remainingImagesCount: remainingImages.length
            }
        })

    } catch (error) {
        console.error('❌ Error deleting image:', error)
        return NextResponse.json({
            status: 'error',
            message: 'Error deleting image',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}