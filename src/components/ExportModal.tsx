import React, { useState } from 'react';
import styled from 'styled-components';
import { FaDownload, FaFilePdf, FaFileAlt, FaFileCsv, FaTimes } from 'react-icons/fa';
import { generateAndDownloadPDF, generateAndPrintReport, AnalysisReportData } from '@/utils/pdfGenerator';
import api from '@/services/api';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    scanId: string;
    imageIndex: number;
    analysisData: AnalysisReportData | null;
}

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
`;

const ModalContent = styled.div`
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    color: #8aa;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
`;

const ExportOptions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ExportOption = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    
    &:hover {
        background: rgba(6, 148, 251, 0.1);
        border-color: #0694fb;
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const OptionIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: white;
`;

const OptionContent = styled.div`
    flex: 1;
`;

const OptionTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
`;

const OptionDescription = styled.div`
    font-size: 12px;
    color: #8aa;
    line-height: 1.4;
`;

const LoadingSpinner = styled.div`
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    scanId,
    imageIndex,
    analysisData
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportingFormat, setExportingFormat] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleExport = async (format: string) => {
        if (!analysisData) return;
        
        setIsExporting(true);
        setExportingFormat(format);

        try {
            switch (format) {
                case 'pdf':
                    await generateAndDownloadPDF(analysisData);
                    break;
                    
                case 'json':
                    const jsonResponse = await api.get(`/api/scans/${scanId}/export?format=json&imageIndex=${imageIndex}`);
                    const jsonBlob = new Blob([JSON.stringify(jsonResponse.data, null, 2)], { 
                        type: 'application/json' 
                    });
                    const jsonUrl = URL.createObjectURL(jsonBlob);
                    const jsonLink = document.createElement('a');
                    jsonLink.href = jsonUrl;
                    jsonLink.download = `analysis-${scanId}-${imageIndex}.json`;
                    document.body.appendChild(jsonLink);
                    jsonLink.click();
                    document.body.removeChild(jsonLink);
                    URL.revokeObjectURL(jsonUrl);
                    break;
                    
                case 'csv':
                    const csvResponse = await api.get(`/api/scans/${scanId}/export?format=csv&imageIndex=${imageIndex}`, {
                        responseType: 'blob'
                    });
                    const csvUrl = URL.createObjectURL(csvResponse.data);
                    const csvLink = document.createElement('a');
                    csvLink.href = csvUrl;
                    csvLink.download = `analysis-${scanId}-${imageIndex}.csv`;
                    document.body.appendChild(csvLink);
                    csvLink.click();
                    document.body.removeChild(csvLink);
                    URL.revokeObjectURL(csvUrl);
                    break;
                    
                default:
                    throw new Error('Unsupported export format');
            }
            
            // Show success message
            console.log(`✅ Exported analysis in ${format.toUpperCase()} format`);
            
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Failed to export analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
            setExportingFormat(null);
        }
    };

    const handlePrint = async () => {
        if (!analysisData) return;
        
        setIsExporting(true);
        setExportingFormat('print');

        try {
            await generateAndPrintReport(analysisData);
        } catch (error) {
            console.error('Print failed:', error);
            alert(`Failed to print report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
            setExportingFormat(null);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        <FaDownload size={20} />
                        Export Analysis Results
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <FaTimes size={16} />
                    </CloseButton>
                </ModalHeader>

                <ExportOptions>
                    <ExportOption 
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                    >
                        <OptionIcon style={{ background: '#f44336' }}>
                            {exportingFormat === 'pdf' ? <LoadingSpinner /> : <FaFilePdf />}
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>PDF Report</OptionTitle>
                            <OptionDescription>
                                Professional medical report with all analysis details, findings, and recommendations
                            </OptionDescription>
                        </OptionContent>
                    </ExportOption>

                    <ExportOption 
                        onClick={() => handleExport('json')}
                        disabled={isExporting}
                    >
                        <OptionIcon style={{ background: '#4CAF50' }}>
                            {exportingFormat === 'json' ? <LoadingSpinner /> : <FaFileAlt />}
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>JSON Data</OptionTitle>
                            <OptionDescription>
                                Complete analysis data in JSON format for integration with other systems
                            </OptionDescription>
                        </OptionContent>
                    </ExportOption>

                    <ExportOption 
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                    >
                        <OptionIcon style={{ background: '#FF9800' }}>
                            {exportingFormat === 'csv' ? <LoadingSpinner /> : <FaFileCsv />}
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>CSV Spreadsheet</OptionTitle>
                            <OptionDescription>
                                Tabular data format suitable for Excel or database import
                            </OptionDescription>
                        </OptionContent>
                    </ExportOption>

                    <ExportOption 
                        onClick={handlePrint}
                        disabled={isExporting}
                    >
                        <OptionIcon style={{ background: '#0694fb' }}>
                            {exportingFormat === 'print' ? <LoadingSpinner /> : <FaFilePdf />}
                        </OptionIcon>
                        <OptionContent>
                            <OptionTitle>Print Report</OptionTitle>
                            <OptionDescription>
                                Print the analysis report directly to your default printer
                            </OptionDescription>
                        </OptionContent>
                    </ExportOption>
                </ExportOptions>
            </ModalContent>
        </ModalOverlay>
    );
};

export default ExportModal;
