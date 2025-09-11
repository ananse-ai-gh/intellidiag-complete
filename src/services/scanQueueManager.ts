import { runQuery, getRow, getAll } from '@/lib/database';
import { aiAnalysisService } from '@/services/aiAnalysisService';

export interface QueueItem {
    id: number;
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

    constructor() {
        this.startProcessing();
    }

    /**
     * Add a scan to the processing queue
     */
    async addToQueue(scanId: string, scanType: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<boolean> {
        try {
            const priorityLevel = this.getPriorityLevel(priority);
            const queueId = this.generateQueueId();

            // Update scan status to queued
            await runQuery(
                `UPDATE scans SET 
          status = 'queued', 
          queue_position = (SELECT COALESCE(MAX(queue_position), 0) + 1 FROM scans WHERE status = 'queued'),
          queue_timestamp = CURRENT_TIMESTAMP,
          priority_level = ?,
          queue_id = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE scanId = ?`,
                [priorityLevel, queueId, scanId]
            );

            console.log(`✅ Scan ${scanId} added to queue with priority ${priority}`);
            return true;
        } catch (error) {
            console.error(`❌ Error adding scan ${scanId} to queue:`, error);
            await this.updateScanStatus(scanId, 'queue_failed', error as string);
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

        console.log('🚀 Queue processing started');
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

            // Update status to queue_processing
            await this.updateScanStatus(nextItem.scanId, 'queue_processing');

            // Determine AI processing type based on scan type
            const aiProcessingType = this.getAIProcessingType(nextItem.scanType);
            await this.updateScanStatus(nextItem.scanId, aiProcessingType);

            // Process the scan
            const result = await this.processScan(nextItem);

            if (result.success) {
                // Update to completed status
                const finalStatus = this.getFinalStatus(nextItem.scanType, result.data);
                await this.updateScanStatus(nextItem.scanId, finalStatus, undefined, result.processingTime);
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
            const result = await getRow(
                `SELECT id, scanId, scanType, priority_level as priority, status, retry_count as retryCount, 
                createdAt, queue_position as queuePosition
         FROM scans 
         WHERE status = 'queued' 
         ORDER BY priority_level DESC, queue_position ASC, createdAt ASC 
         LIMIT 1`
            );

            return result || null;
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
                throw new Error('Scan image not found');
            }

            // Process with AI service
            const aiResult = await this.processWithAIService(item.scanType, scanImage);

            // Generate LLM report
            await this.updateScanStatus(item.scanId, 'report_generating');
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
            await runQuery(
                `UPDATE ai_analysis SET 
          status = 'completed',
          findings = ?,
          confidence = ?,
          updatedAt = CURRENT_TIMESTAMP
        WHERE scanId = (SELECT id FROM scans WHERE scanId = ?)`,
                [JSON.stringify(report), aiResult.confidence || 0, scanId]
            );

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
            // Retry
            await runQuery(
                `UPDATE scans SET 
          retry_count = ?,
          last_error_message = ?,
          status = 'queued',
          updatedAt = CURRENT_TIMESTAMP
        WHERE scanId = ?`,
                [newRetryCount, error, item.scanId]
            );
            console.log(`🔄 Retrying scan ${item.scanId} (attempt ${newRetryCount}/${this.MAX_RETRIES})`);
        } else {
            // Max retries reached
            await this.updateScanStatus(item.scanId, 'failed', error);
            console.log(`❌ Scan ${item.scanId} failed after ${this.MAX_RETRIES} retries`);
        }
    }

    /**
     * Update scan status
     */
    private async updateScanStatus(scanId: string, status: string, errorMessage?: string, processingTime?: number): Promise<void> {
        try {
            const updateFields = [
                `status = ?`,
                `updatedAt = CURRENT_TIMESTAMP`
            ];

            const params = [status];

            if (errorMessage) {
                updateFields.push(`last_error_message = ?`);
                params.push(errorMessage);
            }

            if (processingTime) {
                updateFields.push(`processing_duration_ms = ?`);
                params.push(processingTime.toString());
            }

            if (status.startsWith('ai_processing')) {
                updateFields.push(`processing_start_time = CURRENT_TIMESTAMP`);
            }

            if (status.includes('completed') || status === 'failed') {
                updateFields.push(`processing_end_time = CURRENT_TIMESTAMP`);
            }

            params.push(scanId);

            await runQuery(
                `UPDATE scans SET ${updateFields.join(', ')} WHERE scanId = ?`,
                params
            );
        } catch (error) {
            console.error(`❌ Error updating scan status for ${scanId}:`, error);
        }
    }

    /**
     * Get scan image file
     */
    private async getScanImage(scanId: string): Promise<File | null> {
        try {
            const scan = await getRow(
                `SELECT s.*, si.url FROM scans s 
         LEFT JOIN scan_images si ON s.id = si.scanId 
         WHERE s.scanId = ?`,
                [scanId]
            );

            if (!scan || !scan.url) {
                return null;
            }

            // Convert image path to File object
            const response = await fetch(`/uploads/${scan.url}`);
            const blob = await response.blob();
            return new File([blob], scan.url, { type: 'image/jpeg' });
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
            const stats = await getAll(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(priority_level) as avg_priority,
          MIN(queue_position) as min_position,
          MAX(queue_position) as max_position
        FROM scans 
        WHERE status IN ('queued', 'queue_processing', 'ai_processing', 'ai_processing_brain', 
                        'ai_processing_breast', 'ai_processing_lung', 'ai_processing_mri_ct', 'ai_processing_ct_mri')
        GROUP BY status
      `);

            return stats;
        } catch (error) {
            console.error('❌ Error getting queue stats:', error);
            return [];
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
        console.log('🛑 Queue processing stopped');
    }
}

// Export singleton instance
export const scanQueueManager = new ScanQueueManager();
