// Use Supabase profiles database service
export {
    db,
    getRow,
    getAll,
    runQuery,
    initDatabase
} from './supabaseProfilesDatabase'

// Legacy compatibility functions
import { db } from './supabaseProfilesDatabase'

export const getProfileById = async (id: string) => {
    return await db.getProfileById(id)
}

export const createProfile = async (profileData: any) => {
    return await db.createProfile(profileData)
}

export const updateProfile = async (id: string, updates: any) => {
    return await db.updateProfile(id, updates)
}

export const getAllProfiles = async () => {
    return await db.getAllProfiles()
}

export const getPatientById = async (id: string) => {
    return await db.getPatientById(id)
}

export const createPatient = async (patientData: any) => {
    return await db.createPatient(patientData)
}

export const updatePatient = async (id: string, updates: any) => {
    return await db.updatePatient(id, updates)
}

export const getAllPatients = async () => {
    return await db.getAllPatients()
}

export const getScanById = async (id: string) => {
    return await db.getScanById(id)
}

export const createScan = async (scanData: any) => {
    return await db.createScan(scanData)
}

export const updateScan = async (id: string, updates: any) => {
    return await db.updateScan(id, updates)
}

export const getAllScans = async () => {
    return await db.getAllScans()
}

export const getScansByPatientId = async (patientId: string) => {
    return await db.getScansByPatientId(patientId)
}

export const getAnalysisById = async (id: string) => {
    return await db.getAnalysisById(id)
}

export const createAnalysis = async (analysisData: any) => {
    return await db.createAnalysis(analysisData)
}

export const updateAnalysis = async (id: string, updates: any) => {
    return await db.updateAnalysis(id, updates)
}

export const getAllAnalyses = async () => {
    return await db.getAllAnalyses()
}

export const getAnalysesByScanId = async (scanId: string) => {
    return await db.getAnalysesByScanId(scanId)
}

export const getDashboardStats = async () => {
    return await db.getDashboardStats()
}

export const healthCheck = async () => {
    return await db.healthCheck()
}