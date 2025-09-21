import axios from "axios";
import { supabase } from "@/lib/supabase";

// Use relative URLs for Next.js API routes
const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Sign out from Supabase on 401 error
      if (typeof window !== 'undefined') {
        await supabase.auth.signOut();
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/api/auth/login", credentials),
  register: (userData: any) => api.post("/api/auth/register", userData),
  getMe: () => api.get("/api/auth/me"),
  updateProfile: (profileData: any) =>
    api.put("/api/auth/profile", profileData),
  updatePassword: (passwordData: any) =>
    api.put("/api/auth/password", passwordData),
};

export const patientsAPI = {
  getAll: (params?: any) => api.get("/api/patients", { params }),
  getById: (id: string) => api.get(`/api/patients/${id}`),
  create: (patientData: any) => api.post("/api/patients", patientData),
  update: (id: string, patientData: any) =>
    api.put(`/api/patients/${id}`, patientData),
  delete: (id: string) => api.delete(`/api/patients/${id}`),
  search: (query: string) =>
    api.get("/api/patients/search", { params: { q: query } }),
};

export const scansAPI = {
  getAll: (params?: any) => api.get("/api/scans", { params }),
  getById: (id: string) => api.get(`/api/scans/${id}`),
  create: (scanData: any) => api.post("/api/scans", scanData),
  update: (id: string, scanData: any) =>
    api.put(`/api/scans/${id}`, scanData),
  delete: (id: string) => api.delete(`/api/scans/${id}`),
  uploadImage: (scanId: string, imageData: any) => {
    const formData = new FormData();
    formData.append("image", imageData);
    return api.post(`/api/scans/${scanId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  analyze: (scanId: string) => api.post(`/api/scans/${scanId}/analyze`),
  getAnalysisStatus: (scanId: string) => api.get(`/api/scans/${scanId}/analysis-status`),
};

export const diagnosesAPI = {
  getAll: (params?: any) => api.get("/api/diagnoses", { params }),
  getById: (id: string) => api.get(`/api/diagnoses/${id}`),
  create: (diagnosisData: any) => api.post("/api/diagnoses", diagnosisData),
  update: (id: string, diagnosisData: any) =>
    api.put(`/api/diagnoses/${id}`, diagnosisData),
  delete: (id: string) => api.delete(`/api/diagnoses/${id}`),
  getByPatient: (patientId: string) =>
    api.get(`/api/patients/${patientId}/diagnoses`),
  getByScan: (scanId: string) => api.get(`/api/scans/${scanId}/diagnoses`),
};

export const usersAPI = {
  getAll: (params?: any) => api.get("/api/users", { params }),
  getById: (id: string) => api.get(`/api/users/${id}`),
  create: (userData: any) => api.post("/api/users", userData),
  update: (id: string, userData: any) =>
    api.put(`/api/users/${id}`, userData),
  delete: (id: string) => api.delete(`/api/users/${id}`),
};

export const analyticsAPI = {
  getPatientStats: (params?: any) =>
    api.get("/api/analytics/patients", { params }),
  getScanStats: (params?: any) => api.get("/api/analytics/scans", { params }),
  getDiagnosisStats: (params?: any) =>
    api.get("/api/analytics/diagnoses", { params }),
  getRevenueStats: (params?: any) =>
    api.get("/api/analytics/revenue", { params }),
};

export const uploadAPI = {
  uploadFile: (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    return api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteFile: (fileId: string) => api.delete(`/api/upload/${fileId}`),
};

export default api;
