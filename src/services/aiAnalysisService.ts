import axios from 'axios';

// AI Analysis API Configuration
const AI_API_BASE_URL = 'https://image-name-136538419615.us-central1.run.app';

// AI Analysis Service
export class AIAnalysisService {
  private baseURL: string;

  constructor(baseURL: string = AI_API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Analyze brain tumor in MRI/CT images
   */
  async analyzeBrainTumor(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(`${this.baseURL}/predict2`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      const data = response.data;

      // Parse and convert confidence scores to numbers
      let parsedConfidenceScores = data.confidence_scores;
      if (Array.isArray(parsedConfidenceScores)) {
        parsedConfidenceScores = parsedConfidenceScores.map(score => {
          const parsed = {};
          Object.keys(score).forEach(key => {
            parsed[key] = parseFloat(score[key]) || 0;
          });
          return parsed;
        });
      } else if (typeof parsedConfidenceScores === 'object' && parsedConfidenceScores !== null) {
        const parsed = {};
        Object.keys(parsedConfidenceScores).forEach(key => {
          parsed[key] = parseFloat(parsedConfidenceScores[key]) || 0;
        });
        parsedConfidenceScores = parsed;
      }

      return {
        combined_image: data.combined_image,
        detected_case: data.detected_case,
        overall_confidence: parseFloat(data.overall_confidence) || 0,
        confidence_scores: parsedConfidenceScores,
        scan_type: data.scan_type,
        medical_note: data.medical_note,
        original_response: data
      };
    } catch (error) {
      console.error('Brain tumor analysis error:', error);
      throw new Error('Failed to analyze brain tumor');
    }
  }

  /**
   * Detect breast cancer in mammography images
   */
  async detectBreastCancer(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(`${this.baseURL}/breastancerdetect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      const data = response.data;

      // Parse and convert confidence scores to numbers
      let parsedConfidenceScores = data.confidence_scores;
      if (Array.isArray(parsedConfidenceScores)) {
        parsedConfidenceScores = parsedConfidenceScores.map(score => {
          const parsed = {};
          Object.keys(score).forEach(key => {
            parsed[key] = parseFloat(score[key]) || 0;
          });
          return parsed;
        });
      } else if (typeof parsedConfidenceScores === 'object' && parsedConfidenceScores !== null) {
        const parsed = {};
        Object.keys(parsedConfidenceScores).forEach(key => {
          parsed[key] = parseFloat(parsedConfidenceScores[key]) || 0;
        });
        parsedConfidenceScores = parsed;
      }

      return {
        combined_image: data.combined_image,
        detected_case: data.detected_case,
        overall_confidence: parseFloat(data.overall_confidence) || 0,
        confidence_scores: parsedConfidenceScores,
        scan_type: data.scan_type,
        medical_note: data.medical_note,
        original_response: data
      };
    } catch (error) {
      console.error('Breast cancer detection error:', error);
      throw new Error('Failed to detect breast cancer');
    }
  }

  /**
   * Convert CT scan to MRI format
   * Uses the same endpoint as MRI to CT, but extracts the 'ct_to_mri' value
   */
  async convertCTtoMRI(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(`${this.baseURL}/cttomri`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for conversion
      });

      // Extract the ct_to_mri value from the response
      const data = response.data;
      return {
        converted_image: data.ct_to_mri,
        ssim: data.ssim,
        original_response: data
      };
    } catch (error) {
      console.error('CT to MRI conversion error:', error);
      throw new Error('Failed to convert CT to MRI');
    }
  }

  /**
   * Convert MRI scan to CT format
   * Uses the same endpoint as CT to MRI, but extracts the 'mri_to_ct' value
   */
  async convertMRItoCT(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(`${this.baseURL}/mritoct`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for conversion
      });

      // Extract the mri_to_ct value from the response
      const data = response.data;
      return {
        converted_image: data.mri_to_ct,
        ssim: data.ssim,
        original_response: data
      };
    } catch (error) {
      console.error('MRI to CT conversion error:', error);
      throw new Error('Failed to convert MRI to CT');
    }
  }

  /**
   * Generate LLM report based on analysis results
   */
  async generateLLMReport(analysisData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/response`, analysisData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('LLM report generation error:', error);
      throw new Error('Failed to generate LLM report');
    }
  }

  /**
   * Analyze lung tumors in chest X-ray/CT images
   */
  async analyzeLungTumor(imageFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await axios.post(`${this.baseURL}/lunganalysis`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      const data = response.data;
      console.log('🔍 Raw lung tumor AI response data:', {
        overall_confidence: data.overall_confidence,
        confidence_scores: data.confidence_scores,
        detected_case: data.detected_case
      });

      // Parse and convert confidence scores to numbers
      let parsedConfidenceScores = data.confidence_scores;
      if (Array.isArray(parsedConfidenceScores)) {
        parsedConfidenceScores = parsedConfidenceScores.map(score => {
          const parsed = {};
          Object.keys(score).forEach(key => {
            parsed[key] = parseFloat(score[key]) || 0;
          });
          return parsed;
        });
      } else if (typeof parsedConfidenceScores === 'object' && parsedConfidenceScores !== null) {
        const parsed = {};
        Object.keys(parsedConfidenceScores).forEach(key => {
          parsed[key] = parseFloat(parsedConfidenceScores[key]) || 0;
        });
        parsedConfidenceScores = parsed;
      }

      console.log('🔍 Parsed confidence scores:', parsedConfidenceScores);
      console.log('🔍 Parsed overall confidence:', parseFloat(data.overall_confidence) || 0);

      return {
        combined_image: data.combined_image,
        detected_case: data.detected_case,
        overall_confidence: parseFloat(data.overall_confidence) || 0,
        confidence_scores: parsedConfidenceScores,
        scan_type: data.scan_type,
        medical_note: data.medical_note,
        original_response: data
      };
    } catch (error) {
      console.error('Lung tumor analysis error:', error);
      throw new Error('Failed to analyze lung tumor');
    }
  }

  /**
   * Determine the appropriate analysis type based on scan type and body part
   */
  getAnalysisType(scanType: string, bodyPart: string): string {
    const scanTypeLower = scanType.toLowerCase();
    const bodyPartLower = bodyPart.toLowerCase();

    // Brain tumor analysis
    if (bodyPartLower.includes('brain') || bodyPartLower.includes('head')) {
      return 'brain_tumor';
    }

    // Breast cancer detection
    if (bodyPartLower.includes('breast') || bodyPartLower.includes('mammo')) {
      return 'breast_cancer';
    }

    // Lung tumor analysis
    if (bodyPartLower.includes('lung') || bodyPartLower.includes('chest') || bodyPartLower.includes('thorax')) {
      return 'lung_tumor';
    }

    // CT to MRI conversion
    if (scanTypeLower === 'ct' && (bodyPartLower.includes('brain') || bodyPartLower.includes('head'))) {
      return 'ct_to_mri';
    }

    // MRI to CT conversion
    if (scanTypeLower === 'mri' && (bodyPartLower.includes('brain') || bodyPartLower.includes('head'))) {
      return 'mri_to_ct';
    }

    // Default to brain tumor analysis for brain scans
    if (bodyPartLower.includes('brain') || bodyPartLower.includes('head')) {
      return 'brain_tumor';
    }

    return 'unknown';
  }

  /**
   * Perform analysis based on scan type and body part
   */
  async performAnalysis(imageFile: File, scanType: string, bodyPart: string, analysisType?: string): Promise<any> {
    const determinedAnalysisType = analysisType || this.getAnalysisType(scanType, bodyPart);

    console.log(`🔍 Performing ${determinedAnalysisType} analysis on ${scanType} ${bodyPart} scan`);

    switch (determinedAnalysisType) {
      case 'brain_tumor':
        return await this.analyzeBrainTumor(imageFile);

      case 'breast_cancer':
        return await this.detectBreastCancer(imageFile);

      case 'lung_tumor':
        return await this.analyzeLungTumor(imageFile);

      case 'ct_to_mri':
        return await this.convertCTtoMRI(imageFile);

      case 'mri_to_ct':
        return await this.convertMRItoCT(imageFile);

      case 'auto':
        // For auto mode, try to determine the best analysis type
        const autoType = this.getAnalysisType(scanType, bodyPart);
        console.log(`🤖 Auto-detected analysis type: ${autoType}`);
        return await this.performAnalysis(imageFile, scanType, bodyPart, autoType);

      default:
        throw new Error(`Unsupported analysis type: ${determinedAnalysisType}`);
    }
  }
}

// Export singleton instance
export const aiAnalysisService = new AIAnalysisService();
