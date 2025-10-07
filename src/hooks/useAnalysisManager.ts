import { useState, useCallback, useRef, useEffect } from 'react'
import { aiAnalysisService } from '@/services/aiAnalysisService'
import api from '@/services/api'

export interface AnalysisResult {
    id: string
    scanId: string
    analysisType: string
    imageIndex: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    confidence?: number
    // enriched fields used by the UI
    detected_case?: string
    overall_confidence?: number
    confidence_scores?: Record<string, number>
    combined_image?: string
    converted_image?: any
    ct_to_mri?: string
    mri_to_ct?: string
    ssim?: number
    medical_note?: string
    scan_type?: string
    findings?: string
    recommendations?: string
    processingTime?: number
    error?: string
    createdAt: string
    updatedAt: string
    rawData?: any
}

export interface AnalysisProgress {
    stage: 'initializing' | 'uploading' | 'processing' | 'generating_report' | 'completed'
    progress: number // 0-100
    message: string
    estimatedTimeRemaining?: number
}

export interface AnalysisManagerState {
    currentAnalysis: AnalysisResult | null
    analysisHistory: AnalysisResult[]
    isRunning: boolean
    progress: AnalysisProgress | null
    error: string | null
    lastAnalysisTime: number | null
}

const ANALYSIS_CACHE_KEY = 'analysis_cache'

export const useAnalysisManager = (scanId: string, imageIndex: number = 0) => {
    const [state, setState] = useState<AnalysisManagerState>({
        currentAnalysis: null,
        analysisHistory: [],
        isRunning: false,
        progress: null,
        error: null,
        lastAnalysisTime: null
    })

    const abortControllerRef = useRef<AbortController | null>(null)
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load cached analysis data for current image
    useEffect(() => {
        const loadCachedData = () => {
            try {
                const cached = localStorage.getItem(`${ANALYSIS_CACHE_KEY}_${scanId}_${imageIndex}`)
                if (cached) {
                    const data = JSON.parse(cached)
                    setState(prev => ({
                        ...prev,
                        analysisHistory: data.history || [],
                        lastAnalysisTime: data.lastAnalysisTime || null
                    }))
                }
            } catch (error) {
                console.warn('Failed to load cached analysis data:', error)
            }
        }

        loadCachedData()
    }, [scanId, imageIndex])

    // Auto-load saved analysis result for the selected image from the database
    useEffect(() => {
        let cancelled = false
        const loadSavedAnalysis = async () => {
            try {
                console.log(`🔄 Loading analysis for scan ${scanId}, image ${imageIndex}`)
                const response = await api.get(`/api/scans/${scanId}/analysis-status?imageIndex=${imageIndex}`)
                const data = response.data?.data
                if (!data) {
                    console.log(`⚠️ No analysis data returned for image ${imageIndex}`)
                    return
                }

                if (cancelled) return

                console.log(`📊 Analysis status for image ${imageIndex}:`, data.analysisStatus)

                if (data.analysisStatus === 'completed') {
                    const analysis: AnalysisResult = {
                        id: `analysis_cached_${scanId}_${imageIndex}`,
                        scanId,
                        analysisType: 'unknown',
                        imageIndex,
                        status: 'completed',
                        confidence: data.overall_confidence ?? data.confidence,
                        detected_case: data.detected_case,
                        overall_confidence: data.overall_confidence ?? data.confidence,
                        confidence_scores: data.confidence_scores,
                        combined_image: data.combined_image,
                        converted_image: data.converted_image,
                        ct_to_mri: data.ct_to_mri,
                        mri_to_ct: data.mri_to_ct,
                        ssim: data.ssim,
                        medical_note: data.medical_note,
                        scan_type: data.scan_type || data.scan_type_original,
                        findings: data.detected_case || data.findings,
                        recommendations: data.medical_note || data.recommendations,
                        processingTime: data.processingTime,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        rawData: data
                    }
                    setState(prev => ({
                        ...prev,
                        currentAnalysis: analysis,
                        error: null,
                    }))
                } else {
                    // No analysis yet; clear currentAnalysis for this image
                    console.log(`🧹 Clearing analysis for image ${imageIndex} (status: ${data.analysisStatus})`)
                    setState(prev => ({
                        ...prev,
                        currentAnalysis: null,
                        error: null,
                    }))
                }
            } catch (error) {
                // Silently ignore; UI can remain empty until user runs analysis
            }
        }

        if (scanId) {
            loadSavedAnalysis()
        }

        return () => { cancelled = true }
    }, [scanId, imageIndex])

    // Save analysis data to cache for current image
    const saveToCache = useCallback((analysisData: Partial<AnalysisResult>) => {
        try {
            const cacheKey = `${ANALYSIS_CACHE_KEY}_${scanId}_${imageIndex}`
            const existing = localStorage.getItem(cacheKey)
            const data = existing ? JSON.parse(existing) : { history: [], lastAnalysisTime: null }

            data.history = data.history || []
            data.lastAnalysisTime = Date.now()

            // Update or add analysis to history
            const existingIndex = data.history.findIndex((a: AnalysisResult) => a.id === analysisData.id)
            if (existingIndex >= 0) {
                data.history[existingIndex] = { ...data.history[existingIndex], ...analysisData }
            } else {
                data.history.push(analysisData)
            }

            // Keep only last 10 analyses for this image
            data.history = data.history.slice(-10)

            localStorage.setItem(cacheKey, JSON.stringify(data))
        } catch (error) {
            console.warn('Failed to save analysis data to cache:', error)
        }
    }, [scanId, imageIndex])

    // Update progress with smooth animation
    const updateProgress = useCallback((progress: Partial<AnalysisProgress>) => {
        setState(prev => ({
            ...prev,
            progress: prev.progress ? { ...prev.progress, ...progress } : {
                stage: 'initializing',
                progress: 0,
                message: 'Initializing analysis...',
                ...progress
            }
        }))
    }, [])

    // Simulate realistic progress updates
    const simulateProgress = useCallback(() => {
        const stages = [
            { stage: 'initializing' as const, progress: 10, message: 'Initializing AI analysis...', duration: 2000 },
            { stage: 'uploading' as const, progress: 30, message: 'Uploading image to AI service...', duration: 3000 },
            { stage: 'processing' as const, progress: 70, message: 'AI is analyzing the image...', duration: 15000 },
            { stage: 'generating_report' as const, progress: 90, message: 'Generating analysis report...', duration: 3000 },
            { stage: 'completed' as const, progress: 100, message: 'Analysis completed successfully!', duration: 1000 }
        ]

        let currentStageIndex = 0
        const startTime = Date.now()

        const updateStage = () => {
            if (currentStageIndex >= stages.length) return

            const stage = stages[currentStageIndex]
            updateProgress({
                stage: stage.stage,
                progress: stage.progress,
                message: stage.message,
                estimatedTimeRemaining: Math.max(0, stages.slice(currentStageIndex).reduce((acc, s) => acc + s.duration, 0))
            })

            currentStageIndex++
            setTimeout(updateStage, stage.duration)
        }

        updateStage()
    }, [updateProgress])

    // Start analysis with robust error handling
    const startAnalysis = useCallback(async (analysisType: string, imageFile?: File, options?: { force?: boolean }) => {
        if (state.isRunning) {
            console.warn('Analysis already running')
            return
        }

        // Cancel any existing analysis
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        abortControllerRef.current = new AbortController()

        setState(prev => ({
            ...prev,
            isRunning: true,
            error: null,
            progress: {
                stage: 'initializing',
                progress: 0,
                message: 'Starting analysis...'
            }
        }))

        try {
            // Start progress simulation
            simulateProgress()

            // Create analysis record
            const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const analysis: AnalysisResult = {
                id: analysisId,
                scanId,
                analysisType,
                status: 'processing',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            setState(prev => ({
                ...prev,
                currentAnalysis: analysis
            }))

            // Start analysis via API
            const response = await api.post(`/api/scans/${scanId}/analyze`, {
                analysisType,
                imageIndex,
                imageFile: imageFile ? imageFile.name : null,
                force: !!options?.force
            }, {
                signal: abortControllerRef.current.signal
            })

            if (response.data.status === 'success' && response.data.data?.status === 'completed' && response.data.message === 'Using cached analysis result') {
                await pollAnalysisResults(analysisId)
                return
            }

            if (response.data.status === 'success') {
                // Poll for results
                await pollAnalysisResults(analysisId)
            } else {
                throw new Error(response.data.message || 'Failed to start analysis')
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Analysis cancelled by user')
                return
            }

            console.error('Analysis failed:', error)

            setState(prev => ({
                ...prev,
                error: error.message || 'Analysis failed',
                isRunning: false,
                progress: null,
                currentAnalysis: prev.currentAnalysis ? {
                    ...prev.currentAnalysis,
                    status: 'failed',
                    error: error.message || 'Analysis failed'
                } : null
            }))
        }
    }, [state.isRunning, scanId, simulateProgress])

    // Poll for analysis results
    const pollAnalysisResults = useCallback(async (analysisId: string) => {
        const maxPolls = 60 // 5 minutes max (5 second intervals)
        let pollCount = 0

        const poll = async (): Promise<void> => {
            if (pollCount >= maxPolls) {
                throw new Error('Analysis timeout - please try again')
            }

            try {
                const response = await api.get(`/api/scans/${scanId}/analysis-status?imageIndex=${imageIndex}`)
                const data = response.data?.data

                if (data?.analysisStatus === 'completed') {
                    // Analysis completed successfully
                    const completedAnalysis: AnalysisResult = {
                        id: analysisId,
                        scanId,
                        analysisType: state.currentAnalysis?.analysisType || 'unknown',
                        imageIndex: imageIndex,
                        status: 'completed',
                        confidence: data.overall_confidence ?? data.confidence,
                        detected_case: data.detected_case,
                        overall_confidence: data.overall_confidence ?? data.confidence,
                        confidence_scores: data.confidence_scores,
                        combined_image: data.combined_image,
                        converted_image: data.converted_image,
                        ct_to_mri: data.ct_to_mri,
                        mri_to_ct: data.mri_to_ct,
                        ssim: data.ssim,
                        medical_note: data.medical_note,
                        scan_type: data.scan_type || data.scan_type_original,
                        findings: data.detected_case || data.findings,
                        recommendations: data.medical_note || data.recommendations,
                        processingTime: data.processingTime,
                        createdAt: state.currentAnalysis?.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        rawData: data
                    }

                    setState(prev => ({
                        ...prev,
                        currentAnalysis: completedAnalysis,
                        analysisHistory: [completedAnalysis, ...prev.analysisHistory],
                        isRunning: false,
                        progress: null,
                        error: null,
                        retryCount: 0,
                        lastAnalysisTime: Date.now()
                    }))

                    saveToCache(completedAnalysis)
                    return

                } else if (data?.analysisStatus === 'failed') {
                    throw new Error(data.error || 'Analysis failed')
                }

                // Still processing, continue polling
                pollCount++
                setTimeout(poll, 5000) // Poll every 5 seconds

            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return
                }
                throw error
            }
        }

        await poll()
    }, [scanId, state.currentAnalysis, saveToCache])


    // Cancel analysis
    const cancelAnalysis = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
        }

        setState(prev => ({
            ...prev,
            isRunning: false,
            progress: null,
            error: null
        }))
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            error: null,
            retryCount: 0
        }))
    }, [])

    // Get analysis by type for current image
    const getAnalysisByType = useCallback((analysisType: string) => {
        return state.analysisHistory.find(analysis =>
            analysis.analysisType === analysisType &&
            analysis.status === 'completed' &&
            analysis.imageIndex === imageIndex
        )
    }, [state.analysisHistory, imageIndex])

    // Check if analysis is cached
    const isAnalysisCached = useCallback((analysisType: string) => {
        const cached = getAnalysisByType(analysisType)
        if (!cached || !state.lastAnalysisTime) return false

        // Consider cached if less than 1 hour old
        const oneHour = 60 * 60 * 1000
        return (Date.now() - state.lastAnalysisTime) < oneHour
    }, [getAnalysisByType, state.lastAnalysisTime])

    // Check if current image has any completed analysis
    const hasCompletedAnalysis = useCallback(() => {
        return state.analysisHistory.some(analysis =>
            analysis.imageIndex === imageIndex && analysis.status === 'completed'
        )
    }, [state.analysisHistory, imageIndex])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
        }
    }, [])

    return {
        ...state,
        startAnalysis,
        cancelAnalysis,
        clearError,
        getAnalysisByType,
        isAnalysisCached,
        hasCompletedAnalysis
    }
}
