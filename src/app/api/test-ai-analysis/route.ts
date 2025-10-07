import { NextRequest, NextResponse } from 'next/server'
import { aiAnalysisService } from '@/services/aiAnalysisService'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const imageFile = formData.get('image') as File

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            )
        }

        console.log(`🧪 Testing AI analysis with file: ${imageFile.name}`)

        // Test different analysis types
        const testResults = []

        // Test lung analysis
        try {
            const lungResult = await aiAnalysisService.analyzeLungTumor(imageFile)
            testResults.push({
                analysisType: 'lung_tumor',
                status: 'success',
                result: lungResult
            })
        } catch (error) {
            testResults.push({
                analysisType: 'lung_tumor',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }

        // Test brain analysis
        try {
            const brainResult = await aiAnalysisService.analyzeBrainTumor(imageFile)
            testResults.push({
                analysisType: 'brain_tumor',
                status: 'success',
                result: brainResult
            })
        } catch (error) {
            testResults.push({
                analysisType: 'brain_tumor',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }

        // Test breast cancer detection
        try {
            const breastResult = await aiAnalysisService.detectBreastCancer(imageFile)
            testResults.push({
                analysisType: 'breast_cancer',
                status: 'success',
                result: breastResult
            })
        } catch (error) {
            testResults.push({
                analysisType: 'breast_cancer',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }

        return NextResponse.json({
            message: 'AI endpoint testing completed',
            fileName: imageFile.name,
            fileSize: imageFile.size,
            fileType: imageFile.type,
            results: testResults,
            summary: {
                totalTests: testResults.length,
                successful: testResults.filter(r => r.status === 'success').length,
                failed: testResults.filter(r => r.status === 'error').length
            }
        })

    } catch (error) {
        console.error('Test API error:', error)
        return NextResponse.json(
            {
                error: 'Test failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
