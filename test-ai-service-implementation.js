#!/usr/bin/env node

/**
 * Test AI Analysis Service Implementation
 * Tests the updated service with proper JSON key handling
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const FormData = require('form-data');

// Configuration
const AI_BASE_URL = 'https://image-name-136538419615.us-central1.run.app';
const BASE_URL = new URL(AI_BASE_URL);

// Test images
const TEST_IMAGES = [
  {
    name: 'Chest X-ray',
    path: 'public/uploads/SCAN-1758571903452-PTEFGAMPW.jpg',
    analysisType: 'lung_tumor'
  },
  {
    name: 'Medical Scan',
    path: 'public/uploads/SCAN-1758572018960-U4MM3YBHY.jpg',
    analysisType: 'brain_tumor'
  }
];

// Test endpoints with expected JSON structure
const TEST_ENDPOINTS = [
  {
    name: 'Lung Analysis',
    path: '/lunganalysis',
    analysisType: 'lung_tumor',
    expectedKeys: ['combined_image', 'detected_case', 'overall_confidence', 'confidence_scores', 'scan_type', 'medical_note']
  },
  {
    name: 'Brain Tumor Analysis',
    path: '/predict2',
    analysisType: 'brain_tumor',
    expectedKeys: ['combined_image', 'detected_case', 'overall_confidence', 'confidence_scores', 'scan_type', 'medical_note']
  },
  {
    name: 'CT to MRI Conversion',
    path: '/cttomri',
    analysisType: 'ct_to_mri',
    expectedKeys: ['ct_to_mri', 'mri_to_ct', 'ssim']
  },
  {
    name: 'MRI to CT Conversion',
    path: '/mritoct',
    analysisType: 'mri_to_ct',
    expectedKeys: ['ct_to_mri', 'mri_to_ct', 'ssim']
  }
];

function makeRequest(endpoint, imagePath) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

    const options = {
      hostname: BASE_URL.hostname,
      port: BASE_URL.port || 443,
      path: (BASE_URL.pathname.endsWith('/') ? BASE_URL.pathname.slice(0, -1) : BASE_URL.pathname) + endpoint.path,
      method: 'POST',
      headers: form.getHeaders(),
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonResponse });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data, parseError: e.message });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    form.pipe(req);
  });
}

function testJsonStructure(data, expectedKeys, analysisType) {
  const actualKeys = Object.keys(data);
  const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
  const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key));
  
  console.log(`  📋 Expected keys: ${expectedKeys.join(', ')}`);
  console.log(`  📋 Actual keys: ${actualKeys.join(', ')}`);
  
  if (missingKeys.length > 0) {
    console.log(`  ⚠️  Missing keys: ${missingKeys.join(', ')}`);
  }
  
  if (extraKeys.length > 0) {
    console.log(`  ℹ️  Extra keys: ${extraKeys.join(', ')}`);
  }
  
  // Test specific functionality based on analysis type
  if (analysisType === 'lung_tumor' || analysisType === 'brain_tumor') {
    if (data.overall_confidence !== undefined) {
      console.log(`  ✅ Overall confidence: ${data.overall_confidence}%`);
    }
    if (data.confidence_scores && typeof data.confidence_scores === 'object') {
      console.log(`  ✅ Confidence scores breakdown: ${Object.keys(data.confidence_scores).length} categories`);
    }
    if (data.detected_case) {
      console.log(`  ✅ Detected case: ${data.detected_case.substring(0, 50)}...`);
    }
  }
  
  if (analysisType === 'ct_to_mri' || analysisType === 'mri_to_ct') {
    if (data.ssim !== undefined) {
      console.log(`  ✅ SSIM score: ${data.ssim}`);
    }
    const conversionKey = analysisType === 'ct_to_mri' ? 'ct_to_mri' : 'mri_to_ct';
    if (data[conversionKey]) {
      console.log(`  ✅ Conversion data available: ${typeof data[conversionKey] === 'string' ? 'Base64 string' : 'Object'}`);
    }
  }
  
  return missingKeys.length === 0;
}

async function runTests() {
  console.log('🧪 Testing AI Analysis Service Implementation');
  console.log('================================================\n');

  let successfulTests = 0;
  const results = [];

  for (const endpoint of TEST_ENDPOINTS) {
    console.log(`🔬 Testing: ${endpoint.name}`);
    console.log(`📊 Analysis Type: ${endpoint.analysisType}`);
    
    // Use appropriate test image
    const testImage = endpoint.analysisType.includes('lung') 
      ? TEST_IMAGES[0] 
      : TEST_IMAGES[1];
    
    console.log(`📸 Using: ${testImage.name}`);
    
    const startTime = Date.now();
    let status = '❌ FAILED';
    let responseData = null;
    let structureValid = false;

    try {
      const { statusCode, data, parseError } = await makeRequest(endpoint, testImage.path);
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      responseData = data;
      
      if (statusCode >= 200 && statusCode < 300 && !parseError) {
        console.log(`  ✅ HTTP Status: ${statusCode}`);
        
        // Test JSON structure
        structureValid = testJsonStructure(data, endpoint.expectedKeys, endpoint.analysisType);
        
        if (structureValid) {
          status = '✅ SUCCESS';
          successfulTests++;
        } else {
          status = '⚠️  PARTIAL (Structure issues)';
        }
      } else {
        status = `❌ FAILED (${statusCode})`;
        if (parseError) {
          console.log(`  ❌ Parse Error: ${parseError}`);
        }
      }

      console.log(`  ⏱️  Processing Time: ${processingTime}ms`);
      console.log(`  📊 Result: ${status}\n`);

      results.push({
        name: endpoint.name,
        analysisType: endpoint.analysisType,
        status: status,
        processingTime: processingTime,
        structureValid: structureValid,
        responseData: responseData
      });

    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      console.error(`  ❌ Error: ${error.message}`);
      console.log(`  ⏱️  Processing Time: ${processingTime}ms`);
      console.log(`  📊 Result: ${status}\n`);
      
      results.push({
        name: endpoint.name,
        analysisType: endpoint.analysisType,
        status: status,
        processingTime: processingTime,
        structureValid: false,
        responseData: null,
        error: error.message
      });
    }
  }

  console.log('================================================================================');
  console.log('📊 AI ANALYSIS SERVICE IMPLEMENTATION TEST RESULTS');
  console.log('================================================================================\n');

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}`);
    console.log('--------------------------------------------------');
    console.log(`📊 Status: ${result.status}`);
    console.log(`🔬 Analysis Type: ${result.analysisType}`);
    console.log(`⏱️  Processing Time: ${result.processingTime}ms`);
    console.log(`🏗️  Structure Valid: ${result.structureValid ? '✅ Yes' : '❌ No'}`);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    }
    
    console.log('');
  });

  console.log('================================================================================');
  console.log('📈 SUMMARY STATISTICS');
  console.log('================================================================================');
  console.log(`✅ Successful: ${successfulTests}/${TEST_ENDPOINTS.length}`);
  console.log(`❌ Failed: ${TEST_ENDPOINTS.length - successfulTests}/${TEST_ENDPOINTS.length}`);
  console.log(`🏆 Success Rate: ${((successfulTests / TEST_ENDPOINTS.length) * 100).toFixed(0)}%`);
  console.log(`🏗️  Structure Validation: ${results.filter(r => r.structureValid).length}/${TEST_ENDPOINTS.length} passed\n`);

  console.log('✨ Implementation testing complete!');
}

runTests();
