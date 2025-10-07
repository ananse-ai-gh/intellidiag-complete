import { aiAnalysisService } from '../services/aiAnalysisService'
import fetch from 'node-fetch'

// Test script to test all AI endpoints with a chest X-ray image
async function testAllAIEndpoints() {
    console.log("🧪 Starting comprehensive AI endpoint tests...")
    console.log("📋 Testing with chest X-ray image (lung abnormalities detected)")
    console.log("=" * 80)

    // Test image URL - you'll need to replace this with the actual image URL
    const imageUrl = 'https://example.com/chest-xray.jpg' // Replace with actual image URL

    // For testing purposes, let's create a mock image file
    // In a real scenario, you would fetch the actual image
    const mockImageBuffer = Buffer.from('mock-image-data')
    const imageFile = new File([mockImageBuffer], 'chest_xray.jpg', { type: 'image/jpeg' })

    const analysisTypes = [
        {
            type: 'lung_tumor',
            description: 'Lung Tumor Analysis',
            expectedResult: 'Should detect lung abnormalities and cavitary lesions',
            scanType: 'X-Ray',
            bodyPart: 'Chest'
        },
        {
            type: 'breast_cancer',
            description: 'Breast Cancer Detection',
            expectedResult: 'Should report no findings (not a mammogram)',
            scanType: 'X-Ray',
            bodyPart: 'Chest'
        },
        {
            type: 'brain_tumor',
            description: 'Brain Tumor Analysis',
            expectedResult: 'Should report no findings (not a brain scan)',
            scanType: 'X-Ray',
            bodyPart: 'Chest'
        },
        {
            type: 'ct_to_mri',
            description: 'CT to MRI Conversion',
            expectedResult: 'Should attempt conversion (may fail due to X-ray input)',
            scanType: 'X-Ray',
            bodyPart: 'Chest'
        },
        {
            type: 'mri_to_ct',
            description: 'MRI to CT Conversion',
            expectedResult: 'Should attempt conversion (may fail due to X-ray input)',
            scanType: 'X-Ray',
            bodyPart: 'Chest'
        }
    ]

    const results: Array<{
        type: string
        description: string
        status: 'success' | 'failed' | 'error'
        output?: any
        error?: string
        processingTime?: number
        expectedResult: string
    }> = []

    for (const analysis of analysisTypes) {
        console.log(`\n🔍 Testing ${analysis.description}...`)
        console.log(`📝 Expected: ${analysis.expectedResult}`)

        const startTime = Date.now()

        try {
            const output = await aiAnalysisService.performAnalysis(
                imageFile,
                analysis.scanType,
                analysis.bodyPart,
                analysis.type
            )

            const processingTime = Date.now() - startTime

            console.log(`✅ ${analysis.description} - SUCCESS`)
            console.log(`⏱️  Processing time: ${processingTime}ms`)
            console.log(`📊 Output:`, JSON.stringify(output, null, 2))

            results.push({
                type: analysis.type,
                description: analysis.description,
                status: 'success',
                output,
                processingTime,
                expectedResult: analysis.expectedResult
            })

        } catch (error: any) {
            const processingTime = Date.now() - startTime

            console.log(`❌ ${analysis.description} - FAILED`)
            console.log(`⏱️  Processing time: ${processingTime}ms`)
            console.log(`🚨 Error:`, error.message)

            results.push({
                type: analysis.type,
                description: analysis.description,
                status: 'failed',
                error: error.message,
                processingTime,
                expectedResult: analysis.expectedResult
            })
        }

        console.log("-" * 60)
    }

    // Summary Report
    console.log("\n" + "=" * 80)
    console.log("📊 COMPREHENSIVE TEST RESULTS SUMMARY")
    console.log("=" * 80)

    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length

    console.log(`\n📈 Overall Results:`)
    console.log(`   ✅ Successful: ${successCount}/${results.length}`)
    console.log(`   ❌ Failed: ${failedCount}/${results.length}`)
    console.log(`   📊 Success Rate: ${((successCount / results.length) * 100).toFixed(1)}%`)

    console.log(`\n📋 Detailed Results:`)
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.description}`)
        console.log(`   Type: ${result.type}`)
        console.log(`   Status: ${result.status.toUpperCase()}`)
        console.log(`   Processing Time: ${result.processingTime}ms`)
        console.log(`   Expected: ${result.expectedResult}`)

        if (result.status === 'success') {
            console.log(`   Output:`)
            console.log(`   ${JSON.stringify(result.output, null, 4)}`)
        } else {
            console.log(`   Error: ${result.error}`)
        }
    })

    // Expected Results Analysis
    console.log(`\n🎯 Expected Results Analysis:`)
    console.log(`   🫁 Lung Tumor Analysis: Should detect the large cavitary lesion with air-fluid level`)
    console.log(`   🫀 Breast Cancer Detection: Should report no findings (chest X-ray, not mammogram)`)
    console.log(`   🧠 Brain Tumor Analysis: Should report no findings (chest X-ray, not brain scan)`)
    console.log(`   🔄 CT to MRI Conversion: May fail due to X-ray input (expects CT)`)
    console.log(`   🔄 MRI to CT Conversion: May fail due to X-ray input (expects MRI)`)

    return results
}

// Function to test with actual image URL
async function testWithActualImage(imageUrl: string) {
    console.log(`🌐 Testing with actual image from: ${imageUrl}`)

    try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        }

        const imageBuffer = await response.buffer()
        const imageFile = new File([imageBuffer], 'chest_xray.jpg', { type: 'image/jpeg' })

        console.log(`✅ Image loaded successfully (${imageBuffer.length} bytes)`)

        // Test lung tumor analysis specifically (most relevant for chest X-ray)
        console.log(`\n🔍 Testing Lung Tumor Analysis with actual image...`)

        const startTime = Date.now()
        const result = await aiAnalysisService.performAnalysis(
            imageFile,
            'X-Ray',
            'Chest',
            'lung_tumor'
        )
        const processingTime = Date.now() - startTime

        console.log(`✅ Lung Tumor Analysis completed in ${processingTime}ms`)
        console.log(`📊 Result:`, JSON.stringify(result, null, 2))

        return result

    } catch (error: any) {
        console.error(`❌ Error testing with actual image:`, error.message)
        throw error
    }
}

// Export functions for use in other modules
export { testAllAIEndpoints, testWithActualImage }

// Run tests if this file is executed directly
if (require.main === module) {
    testAllAIEndpoints()
        .then(() => {
            console.log("\n🎉 All tests completed!")
            process.exit(0)
        })
        .catch((error) => {
            console.error("\n💥 Test execution failed:", error)
            process.exit(1)
        })
}
