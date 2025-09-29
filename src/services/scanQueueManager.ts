import { db } from '@/lib/database';
import { aiAnalysisService } from '@/services/aiAnalysisService';

export interface QueueItem {
    id: string;
    scanId: string;
    scanType: string;
    priority: number;
    status: string;
    retryCount: number;
    createdAt: string;
    queuePosition: number;
}

export interface ProcessingResult {
    success: boolean;
    status: string;
    data?: any;
    error?: string;
    processingTime?: number;
}

class ScanQueueManager {
    private isProcessing = false;
    private processingInterval: NodeJS.Timeout | null = null;
    private readonly PROCESSING_INTERVAL = 5000; // 5 seconds
    private readonly MAX_RETRIES = 3;
    private readonly TIMEOUT_DURATION = 300000; // 5 minutes
    private isStarted = false;

    constructor() {
        // Don't start processing automatically - wait for explicit start
    }

    /**
     * Add a scan to the processing queue
     */
    async addToQueue(scanId: string, scanType: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<boolean> {
        try {
            // Start processing if not already started
            if (!this.isStarted) {
                this.startProcessing();
            }

            // Update scan status to queued
            await db.updateScan(scanId, {
                status: 'pending',
                priority: priority
            });

            console.log(`✅ Scan ${scanId} added to queue with priority ${priority}`);
            return true;
        } catch (error) {
            console.error(`❌ Error adding scan ${scanId} to queue:`, error);
            await this.updateScanStatus(scanId, 'failed', error as string);
            return false;
        }
    }

    /**
     * Start the queue processing loop
     */
    private startProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
        }

        this.processingInterval = setInterval(async () => {
            if (!this.isProcessing) {
                await this.processNextItem();
            }
        }, this.PROCESSING_INTERVAL);

        this.isStarted = true;
        // Only log in development, not during build
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Queue processing started');
        }
    }

    /**
     * Process the next item in the queue
     */
    private async processNextItem(): Promise<void> {
        try {
            this.isProcessing = true;

            // Get the next item from the queue (highest priority first)
            const nextItem = await this.getNextQueueItem();
            if (!nextItem) {
                return; // No items in queue
            }

            console.log(`🔄 Processing scan ${nextItem.scanId} (${nextItem.scanType})`);

            // Update status to processing
            await this.updateScanStatus(nextItem.scanId, 'processing');

            // Process the scan
            const result = await this.processScan(nextItem);

            if (result.success) {
                // Update to completed status
                await this.updateScanStatus(nextItem.scanId, 'completed', undefined, result.processingTime);
                console.log(`✅ Scan ${nextItem.scanId} completed successfully`);
            } else {
                // Handle failure
                await this.handleProcessingFailure(nextItem, result.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('❌ Error processing queue item:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Get the next item from the queue
     */
    private async getNextQueueItem(): Promise<QueueItem | null> {
        try {
            const allScans = await db.getAllScans();
            const queuedScans = allScans.filter(scan => scan.status === 'pending');

            if (queuedScans.length === 0) {
                return null;
            }

            // Sort by priority and creation time
            queuedScans.sort((a, b) => {
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                const aPriority = priorityOrder[a.priority] || 2;
                const bPriority = priorityOrder[b.priority] || 2;

                if (aPriority !== bPriority) {
                    return bPriority - aPriority; // Higher priority first
                }

                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            });

            const scan = queuedScans[0];
            // Get retry count from scan metadata or default to 0
            const retryCount = (scan as any).retry_count || 0;

            return {
                id: scan.id,
                scanId: scan.id,
                scanType: scan.scan_type,
                priority: 2, // Default priority
                status: scan.status,
                retryCount: retryCount,
                createdAt: scan.created_at,
                queuePosition: 1
            };
        } catch (error) {
            console.error('❌ Error getting next queue item:', error);
            return null;
        }
    }

    /**
     * Process a scan with AI services
     */
    private async processScan(item: QueueItem): Promise<ProcessingResult> {
        const startTime = Date.now();

        try {
            // Get scan image
            const scanImage = await this.getScanImage(item.scanId);
            if (!scanImage) {
                // Mark as failed if no image available (e.g., old scans with local paths)
                await this.updateScanStatus(item.scanId, 'failed', 'Image not available - old scan format');
                return {
                    success: false,
                    status: 'failed',
                    error: 'Image not available - old scan format',
                    processingTime: Date.now() - startTime
                };
            }

            // Process with AI service
            const aiResult = await this.processWithAIService(item.scanType, scanImage);

            // Generate LLM report
            await this.updateScanStatus(item.scanId, 'processing');
            const llmReport = await this.generateLLMReport(item.scanId, aiResult);

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                status: 'completed',
                data: { aiResult, llmReport },
                processingTime
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;
            return {
                success: false,
                status: 'failed',
                error: error as string,
                processingTime
            };
        }
    }

    /**
     * Process scan with AI service
     */
    private async processWithAIService(scanType: string, imageFile: File): Promise<any> {
        try {
            const result = await aiAnalysisService.performAnalysis(imageFile, scanType, 'chest');
            return result;
        } catch (error) {
            throw new Error(`AI service error: ${error}`);
        }
    }

    /**
     * Generate LLM report
     */
    private async generateLLMReport(scanId: string, aiResult: any): Promise<any> {
        try {
            const report = await aiAnalysisService.generateLLMReport(aiResult);

            // Update AI analysis table
            const analyses = await db.getAnalysesByScanId(scanId);
            if (analyses.length > 0) {
                await db.updateAnalysis(analyses[0].id, {
                    status: 'completed',
                    confidence: aiResult.confidence || 0,
                    result: {
                        findings: JSON.stringify(report),
                        recommendations: report.recommendations || ''
                    }
                });
            }

            return report;
        } catch (error) {
            throw new Error(`LLM report generation error: ${error}`);
        }
    }

    /**
     * Handle processing failure
     */
    private async handleProcessingFailure(item: QueueItem, error: string): Promise<void> {
        const newRetryCount = item.retryCount + 1;

        if (newRetryCount <= this.MAX_RETRIES) {
            // Retry - update status to pending with new retry count
            await this.updateScanStatus(item.scanId, 'pending', error, undefined, newRetryCount);
            console.log(`🔄 Retrying scan ${item.scanId} (attempt ${newRetryCount}/${this.MAX_RETRIES})`);
        } else {
            // Max retries reached - mark as failed
            await this.updateScanStatus(item.scanId, 'failed', error, undefined, newRetryCount);
            console.log(`❌ Scan ${item.scanId} failed after ${this.MAX_RETRIES} retries - no more retries`);
        }
    }

    /**
     * Update scan status
     */
    private async updateScanStatus(scanId: string, status: string, errorMessage?: string, processingTime?: number, retryCount?: number): Promise<void> {
        try {
            const updateData: any = {
                status: status as 'pending' | 'processing' | 'completed' | 'failed'
            };

            // Add retry count if provided
            if (retryCount !== undefined) {
                updateData.retry_count = retryCount;
            }

            await db.updateScan(scanId, updateData);
        } catch (error) {
            console.error(`❌ Error updating scan status for ${scanId}:`, error);
        }
    }

    /**
     * Get scan image file
     */
    private async getScanImage(scanId: string): Promise<File | null> {
        try {
            const scan = await db.getScanById(scanId);
            if (!scan || !scan.file_path) {
                console.log(`❌ No scan or file path found for ${scanId}`);
                return null;
            }

            console.log(`📷 Fetching image for scan ${scanId} from: ${scan.file_path}`);

            // Check if it's a Supabase Storage URL (new format) or local path (old format)
            if (scan.file_path.startsWith('http')) {
                // Supabase Storage URL - fetch directly
                const response = await fetch(scan.file_path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                }

                const blob = await response.blob();
                return new File([blob], scan.file_name, { type: scan.mime_type });
            } else {
                // Old local path - skip processing for now
                console.log(`⚠️ Skipping old scan ${scanId} with local path: ${scan.file_path}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error getting scan image for ${scanId}:`, error);
            return null;
        }
    }

    /**
     * Get priority level
     */
    private getPriorityLevel(priority: string): number {
        switch (priority) {
            case 'urgent': return 4;
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 2;
        }
    }

    /**
     * Get AI processing type
     */
    private getAIProcessingType(scanType: string): string {
        switch (scanType) {
            case 'Brain': return 'ai_processing_brain';
            case 'Breast': return 'ai_processing_breast';
            case 'Lung': return 'ai_processing_lung';
            case 'MRI-CT Translation': return 'ai_processing_mri_ct';
            case 'CT-MRI Translation': return 'ai_processing_ct_mri';
            default: return 'ai_processing';
        }
    }

    /**
     * Get final status
     */
    private getFinalStatus(scanType: string, data: any): string {
        if (scanType.includes('Translation')) {
            return 'translation_completed';
        }

        if (data?.aiResult?.findings && data.aiResult.findings.length > 0) {
            return 'completed_with_findings';
        }

        return 'completed_no_findings';
    }

    /**
     * Generate queue ID
     */
    private generateQueueId(): string {
        return `Q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(): Promise<any> {
        try {
            const allScans = await db.getAllScans();
            const queuedScans = allScans.filter(scan =>
                ['pending', 'processing'].includes(scan.status)
            );

            return queuedScans.map(scan => ({
                status: scan.status,
                count: 1,
                scanType: scan.scan_type,
                priority: scan.priority
            }));
        } catch (error) {
            console.error('❌ Error getting queue stats:', error);
            return [];
        }
    }

    /**
     * Clear the queue by marking all pending/processing scans as failed
     */
    async clearQueue(): Promise<void> {
        try {
            console.log('🧹 Clearing queue...');

            // Get all pending and processing scans
            const allScans = await db.getAllScans();
            const queuedScans = allScans.filter(scan =>
                ['pending', 'processing'].includes(scan.status)
            );

            console.log(`📋 Found ${queuedScans.length} scans to clear`);

            // Mark each scan as failed
            for (const scan of queuedScans) {
                await this.updateScanStatus(scan.id, 'failed', 'Queue cleared by admin');
                console.log(`✅ Cleared scan ${scan.id}`);
            }

            console.log(`🎉 Queue cleared successfully - ${queuedScans.length} scans marked as failed`);
        } catch (error) {
            console.error('❌ Error clearing queue:', error);
            throw error;
        }
    }

    /**
     * Stop queue processing
     */
    stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        // Only log in development, not during build
        if (process.env.NODE_ENV === 'development') {
            console.log('🛑 Queue processing stopped');
        }
    }
}

// Export singleton instance
export const scanQueueManager = new ScanQueueManager();