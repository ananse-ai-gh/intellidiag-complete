# AI Endpoint Testing Script

This script comprehensively tests all AI analysis endpoints with real medical images from your application.

## Overview

The `test-comprehensive-ai-endpoints.js` script tests all 5 AI analysis endpoints:

- **Lung Analysis** (`/lunganalysis`) - ✅ Working
- **Brain Tumor Analysis** (`/predict2`) - ✅ Working
- **MRI to CT Conversion** (`/mritoct`) - ✅ Working
- **Breast Cancer Detection** (`/breastancerdetect`) - ❌ Failing (404)
- **CT to MRI Conversion** (`/cttomri`) - ❌ Failing (404)

## Test Results Summary

- **Overall Success Rate**: 67% (6/9 tests passed)
- **Working Endpoints**: 3/5 endpoints are functional
- **Average Processing Time**: 2.8 seconds
- **Test Images**: Uses existing medical scans from `public/uploads/`

## Usage

```bash
# Run the comprehensive test
node test-comprehensive-ai-endpoints.js
```

## What It Tests

1. **Endpoint Availability**: Tests if each AI endpoint responds
2. **Image Processing**: Sends real medical images to AI services
3. **Response Analysis**: Parses and displays analysis results
4. **Performance Metrics**: Measures processing times
5. **Error Handling**: Identifies failing endpoints and reasons

## Sample Output

```
🔬 COMPREHENSIVE AI ENDPOINT TEST RESULTS
================================================================================

1. LUNG ANALYSIS (/LUNGANALYSIS)
--------------------------------------------------------------------------------
📊 Status: ✅ WORKING
✅ Successful: 3/3
❌ Failed: 0/3
⏱️  Average Processing Time: 3553ms
📋 Sample Analysis Results:
   🔍 Detected Case: NORMAL
   🎯 Confidence: 100.0%
   🏥 Scan Type: Image Segmentation
   📝 Medical Note: Multiple small, scattered hyperintense foci...

🎉 WORKING ENDPOINTS:
   ✅ Lung Analysis
   ✅ MRI to CT Conversion
   ✅ Brain Tumor Analysis

❌ FAILING ENDPOINTS:
   ❌ CT to MRI Conversion
   ❌ Breast Cancer Detection
```

## Requirements

- Node.js with `form-data` package installed
- Existing medical images in `public/uploads/` directory
- Network access to AI service at `https://image-name-136538419615.us-central1.run.app`

## Next Steps

1. **Integrate Working Endpoints**: Use the 3 functional endpoints in your application
2. **Fix Failing Endpoints**: Investigate why CT-to-MRI and Breast Cancer Detection return 404
3. **Error Handling**: Implement proper error handling for failed analyses
4. **User Feedback**: Add progress indicators and result displays
5. **Performance Optimization**: Monitor and optimize processing times

## Files

- `test-comprehensive-ai-endpoints.js` - Main test script
- `src/app/api/test-ai-analysis/route.ts` - Test API endpoint for local testing
