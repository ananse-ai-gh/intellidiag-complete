// Analysis Worker for background processing
// This worker handles heavy computation tasks without blocking the UI

interface AnalysisWorkerMessage {
    type: 'START_ANALYSIS' | 'CANCEL_ANALYSIS' | 'UPDATE_PROGRESS'
    payload?: any
}

interface AnalysisWorkerResponse {
    type: 'PROGRESS_UPDATE' | 'ANALYSIS_COMPLETE' | 'ANALYSIS_ERROR' | 'ANALYSIS_CANCELLED'
    payload?: any
}

class AnalysisWorker {
    private worker: Worker | null = null
    private isRunning = false
    private currentAnalysisId: string | null = null

    constructor() {
        this.initializeWorker()
    }

    private initializeWorker() {
        // Create a simple worker for background processing
        const workerCode = `
      let analysisTimeout = null;
      let currentProgress = 0;

      self.onmessage = function(e) {
        const { type, payload } = e.data;
        
        switch (type) {
          case 'START_ANALYSIS':
            startAnalysis(payload);
            break;
          case 'CANCEL_ANALYSIS':
            cancelAnalysis();
            break;
          case 'UPDATE_PROGRESS':
            updateProgress(payload);
            break;
        }
      };

      function startAnalysis(data) {
        currentProgress = 0;
        
        // Simulate analysis progress
        const progressInterval = setInterval(() => {
          currentProgress += Math.random() * 10;
          
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(progressInterval);
            
            self.postMessage({
              type: 'ANALYSIS_COMPLETE',
              payload: {
                analysisId: data.analysisId,
                results: {
                  confidence: Math.random() * 100,
                  findings: 'Analysis completed successfully',
                  recommendations: 'Follow up recommended'
                }
              }
            });
          } else {
            self.postMessage({
              type: 'PROGRESS_UPDATE',
              payload: {
                analysisId: data.analysisId,
                progress: currentProgress,
                stage: getStage(currentProgress)
              }
            });
          }
        }, 500);
        
        analysisTimeout = progressInterval;
      }

      function cancelAnalysis() {
        if (analysisTimeout) {
          clearInterval(analysisTimeout);
          analysisTimeout = null;
        }
        
        self.postMessage({
          type: 'ANALYSIS_CANCELLED',
          payload: { analysisId: currentProgress }
        });
      }

      function updateProgress(data) {
        currentProgress = data.progress;
      }

      function getStage(progress) {
        if (progress < 20) return 'initializing';
        if (progress < 40) return 'uploading';
        if (progress < 80) return 'processing';
        if (progress < 95) return 'generating_report';
        return 'completed';
      }
    `

        const blob = new Blob([workerCode], { type: 'application/javascript' })
        this.worker = new Worker(URL.createObjectURL(blob))

        this.worker.onmessage = (e) => {
            this.handleWorkerMessage(e.data)
        }

        this.worker.onerror = (error) => {
            console.error('Analysis worker error:', error)
        }
    }

    private handleWorkerMessage(message: AnalysisWorkerResponse) {
        // Handle worker responses
        switch (message.type) {
            case 'PROGRESS_UPDATE':
                this.onProgressUpdate?.(message.payload)
                break
            case 'ANALYSIS_COMPLETE':
                this.isRunning = false
                this.onAnalysisComplete?.(message.payload)
                break
            case 'ANALYSIS_ERROR':
                this.isRunning = false
                this.onAnalysisError?.(message.payload)
                break
            case 'ANALYSIS_CANCELLED':
                this.isRunning = false
                this.onAnalysisCancelled?.(message.payload)
                break
        }
    }

    startAnalysis(analysisId: string, analysisData: any) {
        if (this.isRunning) {
            console.warn('Analysis already running')
            return
        }

        this.isRunning = true
        this.currentAnalysisId = analysisId

        this.worker?.postMessage({
            type: 'START_ANALYSIS',
            payload: {
                analysisId,
                ...analysisData
            }
        })
    }

    cancelAnalysis() {
        if (!this.isRunning) return

        this.worker?.postMessage({
            type: 'CANCEL_ANALYSIS'
        })
    }

    destroy() {
        this.worker?.terminate()
        this.worker = null
    }

    // Event handlers
    onProgressUpdate?: (data: any) => void
    onAnalysisComplete?: (data: any) => void
    onAnalysisError?: (data: any) => void
    onAnalysisCancelled?: (data: any) => void
}

// Export singleton instance
export const analysisWorker = new AnalysisWorker()

// Performance monitoring utilities
export class PerformanceMonitor {
    private static instance: PerformanceMonitor
    private metrics: Map<string, number> = new Map()

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor()
        }
        return PerformanceMonitor.instance
    }

    startTimer(label: string): void {
        this.metrics.set(`${label}_start`, performance.now())
    }

    endTimer(label: string): number {
        const startTime = this.metrics.get(`${label}_start`)
        if (!startTime) return 0

        const duration = performance.now() - startTime
        this.metrics.set(`${label}_duration`, duration)

        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
        return duration
    }

    getMetric(label: string): number | undefined {
        return this.metrics.get(`${label}_duration`)
    }

    getAllMetrics(): Record<string, number> {
        const result: Record<string, number> = {}
        this.metrics.forEach((value, key) => {
            if (key.endsWith('_duration')) {
                result[key.replace('_duration', '')] = value
            }
        })
        return result
    }
}

// Cache management for analysis results
export class AnalysisCache {
    private static instance: AnalysisCache
    private cache: Map<string, any> = new Map()
    private readonly MAX_CACHE_SIZE = 50
    private readonly CACHE_EXPIRY = 60 * 60 * 1000 // 1 hour

    static getInstance(): AnalysisCache {
        if (!AnalysisCache.instance) {
            AnalysisCache.instance = new AnalysisCache()
        }
        return AnalysisCache.instance
    }

    set(key: string, value: any): void {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now()
        })
    }

    get(key: string): any | null {
        const item = this.cache.get(key)
        if (!item) return null

        // Check if expired
        if (Date.now() - item.timestamp > this.CACHE_EXPIRY) {
            this.cache.delete(key)
            return null
        }

        return item.value
    }

    has(key: string): boolean {
        return this.get(key) !== null
    }

    clear(): void {
        this.cache.clear()
    }

    getStats(): { size: number; maxSize: number; hitRate: number } {
        return {
            size: this.cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            hitRate: 0 // Would need to track hits/misses for accurate hit rate
        }
    }
}

export default AnalysisWorker
