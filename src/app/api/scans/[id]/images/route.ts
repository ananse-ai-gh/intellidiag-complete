import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { db } from '@/lib/database'

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'scan-images'

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
        console.log('📋 Scan details:', {
            file_name: scan.file_name,
            file_path: scan.file_path
        })

        // Extract filename from file_path URL
        const filePathUrl = scan.file_path
        let actualFileName = ''

        if (filePathUrl) {
            // Extract filename from URL like: .../SCAN-1758803148113-1NH7418AE.jpg?token=...
            const urlParts = filePathUrl.split('/')
            const fileNameWithToken = urlParts[urlParts.length - 1]
            actualFileName = fileNameWithToken.split('?')[0] // Remove token part
        }

        console.log('📝 Actual filename from file_path:', actualFileName)

        // Always search for multiple related images first
        const { data: list, error: listError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list('scans', {
                limit: 100,
                sortBy: { column: 'name', order: 'asc' }
            })

        if (listError) {
            console.error('Error listing files:', listError)
            return NextResponse.json({ status: 'error', message: 'Failed to list files' }, { status: 500 })
        }

        console.log('📁 Files found in storage:', list?.length || 0)
        console.log('📄 File names:', list?.map((f: any) => f.name) || [])

        const urls: { url: string; name: string }[] = []

        if (list && list.length > 0) {
            // Try to find files that match the actual filename or scan ID
            let matched: any[] = []

            if (actualFileName) {
                // Extract the base pattern from the filename (e.g., "SCAN-1758803148113-1NH7418AE" from "SCAN-1758803148113-1NH7418AE.jpg")
                const basePattern = actualFileName.replace(/\.(jpg|jpeg|png|dcm|dicom)$/i, '')
                console.log('🔍 Looking for files with base pattern:', basePattern)

                // Look for files that start with the same base pattern
                matched = (list || []).filter((obj: any) => {
                    const fileName = obj?.name || ''
                    // Match exact filename or files that start with the base pattern (for multi-part files)
                    return fileName === actualFileName || fileName.startsWith(basePattern)
                })

                console.log('🔍 Files matching base pattern:', matched.map(f => f.name))
            }

            // If no matches, try to match by scan ID
            if (matched.length === 0) {
                console.log('🔍 No base pattern matches, trying scan ID match')
                matched = (list || []).filter((obj: any) =>
                    obj?.name?.includes(scanId.substring(0, 8)) // Match first 8 chars of scan ID
                )
                console.log('🔍 Files matching scan ID:', matched.map(f => f.name))
            }

            console.log('✅ Matched files:', matched.length)
            console.log('📋 Matched file names:', matched.map((f: any) => f.name))

            if (matched.length > 0) {
                // Generate signed URLs for all matching files
                for (const obj of matched as any[]) {
                    const filePath = `scans/${obj.name}`
                    const { data: signed, error: signErr } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .createSignedUrl(filePath, 60 * 60 * 24 * 7) // 7 days

                    if (!signErr && signed?.signedUrl) {
                        urls.push({ url: signed.signedUrl, name: obj.name })
                    }
                }
            }
        }

        // If no URLs generated, fallback to single file_path
        if (urls.length === 0 && scan.file_path) {
            console.log('⚠️ No related images found, using single file_path as fallback')
            urls.push({ url: scan.file_path, name: scan.file_name || actualFileName || 'image' })
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