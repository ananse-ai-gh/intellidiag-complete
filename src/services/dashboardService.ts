import api from './api';

export interface DashboardData {
    overview: {
        totalPatients: number;
        totalScans: number;
        pendingScans: number;
        completedScans: number;
        criticalCases: number;
        activeCases: number;
    };
    recentScans: Array<{
        id: number;
        scanId: string;
        patientFirstName: string;
        patientLastName: string;
        patientId: string;
        scanType: string;
        bodyPart: string;
        status: string;
        priority: string;
        createdAt: string;
        confidence?: number;
        aiFindings?: string;
        aiStatus?: string;
    }>;
    recentCases: Array<{
        scanId: string;
        status: string;
        priority: string;
        scanType: string;
        bodyPart: string;
        createdAt: string;
        patientFirstName: string;
        patientLastName: string;
        patientId: string;
    }>;
    aiModelStats: Array<{
        scanType: string;
        totalScans: number;
        avgConfidence: number;
        avgProcessingTime: number;
        completedAnalyses: number;
        scansToday: number;
    }>;
    scansByStatus: Array<{
        status: string;
        count: number;
    }>;
    scansByType: Array<{
        scanType: string;
        count: number;
    }>;
    monthlyTrends: Array<{
        month: string;
        count: number;
    }>;
    lastViewedScan?: {
        id: number;
        scanId: string;
        patientFirstName: string;
        patientLastName: string;
        patientId: string;
        scanType: string;
        bodyPart: string;
        status: string;
        priority: string;
        createdAt: string;
        confidence?: number;
        aiFindings?: string;
        aiStatus?: string;
    };
}

export const dashboardService = {
    async getDashboardData(): Promise<DashboardData> {
        try {
            console.log('Fetching dashboard data...');
            const response = await api.get('/api/dashboard');
            console.log('Dashboard data received:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);

            // Provide more detailed error information
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                throw new Error('No response from server. Please check if the server is running.');
            } else {
                console.error('Request setup error:', error.message);
                throw new Error(`Request failed: ${error.message}`);
            }
        }
    },

    async getAnalytics() {
        try {
            const response = await api.get('/api/analytics');
            return response.data;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    },

    async getPatients(page = 1, limit = 10, search = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search })
            });
            const response = await api.get(`/api/patients?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    async getScans(page = 1, limit = 10, search = '', status = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(search && { search }),
                ...(status && { status })
            });
            const response = await api.get(`/api/scans?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching scans:', error);
            throw error;
        }
    }
};
