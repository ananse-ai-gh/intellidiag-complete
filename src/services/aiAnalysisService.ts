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
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error('Breast cancer detection error:', error);
      throw new Error('Failed to detect breast cancer');
    }
  }

  /**
   * Convert CT scan to MRI format
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
      return response.data;
    } catch (error) {
      console.error('CT to MRI conversion error:', error);
      throw new Error('Failed to convert CT to MRI');
    }
  }

  /**
   * Convert MRI scan to CT format
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
      return response.data;
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
      return response.data;
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
  async performAnalysis(imageFile: File, scanType: string, bodyPart: string): Promise<any> {
    const analysisType = this.getAnalysisType(scanType, bodyPart);

    switch (analysisType) {
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
      
      default:
        throw new Error(`Unsupported analysis type for scan type: ${scanType}, body part: ${bodyPart}`);
    }
  }
}

// Export singleton instance
export const aiAnalysisService = new AIAnalysisService();
