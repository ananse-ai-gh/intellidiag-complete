// Use hybrid database service (SQLite for dev, Supabase for production)
export {
    hybridDb as db,
    getRow,
    getAll,
    runQuery,
    initDatabase
} from './hybridDatabase'

// Legacy compatibility - redirect to hybrid database
import { hybridDb } from './hybridDatabase'

// For backward compatibility with existing code
export const createUser = async (userData: any) => {
    return await hybridDb.createUser(userData)
}

export const getUserById = async (id: string) => {
    return await hybridDb.getUserById(id)
}

export const getUserByEmail = async (email: string) => {
    return await hybridDb.getUserByEmail(email)
}

export const updateUser = async (id: string, updates: any) => {
    return await hybridDb.updateUser(id, updates)
}

export const getAllUsers = async () => {
    return await hybridDb.getAllUsers()
}

export const createPatient = async (patientData: any) => {
    return await hybridDb.createPatient(patientData)
}

export const getPatientById = async (id: string) => {
    return await hybridDb.getPatientById(id)
}

export const updatePatient = async (id: string, updates: any) => {
    return await hybridDb.updatePatient(id, updates)
}

export const getAllPatients = async () => {
    return await hybridDb.getAllPatients()
}

export const deletePatient = async (id: string) => {
    return await hybridDb.deletePatient(id)
}

export const createScan = async (scanData: any) => {
    return await hybridDb.createScan(scanData)
}

export const getScanById = async (id: string) => {
    return await hybridDb.getScanById(id)
}

export const updateScan = async (id: string, updates: any) => {
    return await hybridDb.updateScan(id, updates)
}

export const getAllScans = async () => {
    return await hybridDb.getAllScans()
}

export const getScansByPatientId = async (patientId: string) => {
    return await hybridDb.getScansByPatientId(patientId)
}

export const deleteScan = async (id: string) => {
    return await hybridDb.deleteScan(id)
}

export const createAnalysis = async (analysisData: any) => {
    return await hybridDb.createAnalysis(analysisData)
}

export const getAnalysisById = async (id: string) => {
    return await hybridDb.getAnalysisById(id)
}

export const updateAnalysis = async (id: string, updates: any) => {
    return await hybridDb.updateAnalysis(id, updates)
}

export const getAllAnalyses = async () => {
    return await hybridDb.getAllAnalyses()
}

export const getAnalysesByScanId = async (scanId: string) => {
    return await hybridDb.getAnalysesByScanId(scanId)
}

export const getDashboardStats = async () => {
    return await hybridDb.getDashboardStats()
}

export const healthCheck = async () => {
    return await hybridDb.healthCheck()
}