/**
 * PDF Generation Utility for Analysis Reports
 * Generates professional PDF reports for medical analysis results
 */

export interface AnalysisReportData {
    scan: {
        id: string;
        scanType: string;
        bodyPart: string;
        priority: string;
        status: string;
        createdAt: string;
        analysisType: string;
    };
    patient: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        phone: string;
        email: string;
    } | null;
    analysis: {
        id: string;
        analysisType: string;
        status: string;
        confidence: number;
        createdAt: string;
        updatedAt: string;
        result: any;
    };
    metadata: {
        exportedAt: string;
        exportedBy: string;
        format: string;
    };
}

export class PDFGenerator {
    private data: AnalysisReportData;

    constructor(data: AnalysisReportData) {
        this.data = data;
    }

    /**
     * Generate PDF report
     */
    async generatePDF(): Promise<Blob> {
        // Create HTML content for the PDF
        const htmlContent = this.generateHTML();

        // For now, we'll create a simple HTML-based PDF
        // In a production environment, you might want to use libraries like jsPDF or Puppeteer
        const blob = new Blob([htmlContent], { type: 'text/html' });

        return blob;
    }

    /**
     * Generate HTML content for the report
     */
    private generateHTML(): string {
        const { scan, patient, analysis } = this.data;
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
        const analysisTypeDisplay = this.getAnalysisTypeDisplayName(analysis.analysisType);

        // Format dates
        const scanDate = new Date(scan.createdAt).toLocaleDateString();
        const analysisDate = new Date(analysis.updatedAt).toLocaleDateString();

        // Get analysis results
        const primaryFinding = analysis.result?.detected_case || analysis.result?.findings || 'No findings reported';
        const confidence = analysis.confidence ? `${analysis.confidence.toFixed(1)}%` : 'N/A';
        const ssimScore = analysis.result?.ssim ? Number(analysis.result.ssim).toFixed(4) : 'N/A';
        const qualityAssessment = this.getQualityAssessment(analysis.result?.ssim);
        const medicalNotes = analysis.result?.medical_note || 'No medical notes available';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Analysis Report - ${scan.id}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: white;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #0694fb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #0694fb;
            margin-bottom: 10px;
        }
        .report-title {
            font-size: 24px;
            color: #333;
            margin: 10px 0;
        }
        .report-subtitle {
            font-size: 14px;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #0694fb;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #0694fb;
        }
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        .findings-box {
            background: #e8f5e8;
            border: 1px solid #4CAF50;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        .findings-title {
            font-size: 16px;
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 10px;
        }
        .findings-content {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
        }
        .confidence-badge {
            display: inline-block;
            background: #0694fb;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
        .quality-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
        }
        .quality-excellent { background: #4CAF50; color: white; }
        .quality-good { background: #8BC34A; color: white; }
        .quality-fair { background: #FFC107; color: #333; }
        .quality-poor { background: #f44336; color: white; }
        @media print {
            body { margin: 0; padding: 20px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">intelliDiag</div>
        <div class="report-title">Medical Analysis Report</div>
        <div class="report-subtitle">Generated on ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${patientName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">${patient?.dateOfBirth || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">${patient?.gender || 'N/A'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Contact</div>
                <div class="info-value">${patient?.phone || patient?.email || 'N/A'}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Scan Information</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Scan ID</div>
                <div class="info-value">${scan.id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Scan Type</div>
                <div class="info-value">${scan.scanType}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Body Part</div>
                <div class="info-value">${scan.bodyPart}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Priority</div>
                <div class="info-value">${scan.priority}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Scan Date</div>
                <div class="info-value">${scanDate}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Analysis Type</div>
                <div class="info-value">${analysisTypeDisplay}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Analysis Results</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Analysis Status</div>
                <div class="info-value">
                    <span class="confidence-badge">${analysis.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Analysis Date</div>
                <div class="info-value">${analysisDate}</div>
            </div>
            ${this.isConversionAnalysis() ? `
            <div class="info-item">
                <div class="info-label">SSIM Score</div>
                <div class="info-value">${ssimScore}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Quality Assessment</div>
                <div class="info-value">
                    <span class="quality-badge quality-${qualityAssessment.toLowerCase()}">${qualityAssessment}</span>
                </div>
            </div>
            ` : `
            <div class="info-item">
                <div class="info-label">Confidence Score</div>
                <div class="info-value">
                    <span class="confidence-badge">${confidence}</span>
                </div>
            </div>
            `}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Clinical Findings</div>
        <div class="findings-box">
            <div class="findings-title">Primary Finding</div>
            <div class="findings-content">${primaryFinding}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Medical Notes</div>
        <div class="findings-box">
            <div class="findings-content">${medicalNotes}</div>
        </div>
    </div>

    <div class="footer">
        <p>This report was generated by intelliDiag AI Analysis System</p>
        <p>Report ID: ${analysis.id} | Generated: ${new Date().toLocaleString()}</p>
        <p><strong>Disclaimer:</strong> This analysis is for informational purposes only and should not replace professional medical judgment.</p>
    </div>
</body>
</html>`;
    }

    /**
     * Get display name for analysis type
     */
    private getAnalysisTypeDisplayName(analysisType: string): string {
        const typeMap: { [key: string]: string } = {
            'auto': 'Auto-detect (Recommended)',
            'brain_tumor': 'Brain Tumor Analysis',
            'breast_cancer': 'Breast Cancer Detection',
            'lung_tumor': 'Lung Tumor Analysis',
            'ct_to_mri': 'CT to MRI Conversion',
            'mri_to_ct': 'MRI to CT Conversion'
        };
        return typeMap[analysisType] || analysisType;
    }

    /**
     * Get quality assessment based on SSIM score
     */
    private getQualityAssessment(ssim: number | null | undefined): string {
        if (ssim == null) return 'N/A';
        const score = Number(ssim);
        if (score >= 0.9) return 'Excellent';
        if (score >= 0.8) return 'Good';
        if (score >= 0.7) return 'Fair';
        return 'Poor';
    }

    /**
     * Check if this is a conversion analysis
     */
    private isConversionAnalysis(): boolean {
        return this.data.analysis.analysisType === 'ct_to_mri' ||
            this.data.analysis.analysisType === 'mri_to_ct';
    }
}

/**
 * Generate and download PDF report
 */
export async function generateAndDownloadPDF(data: AnalysisReportData): Promise<void> {
    const generator = new PDFGenerator(data);
    const blob = await generator.generatePDF();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-report-${data.scan.id}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Generate and print report
 */
export async function generateAndPrintReport(data: AnalysisReportData): Promise<void> {
    const generator = new PDFGenerator(data);
    const htmlContent = generator['generateHTML']();

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        // Wait for content to load, then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
}
