import axios from 'axios';

// Use relative URLs for Next.js API routes
const api = axios.create({
  baseURL: "",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
  updatePassword: (passwordData) => api.put('/api/auth/password', passwordData),
  refreshToken: () => api.post('/api/auth/refresh'),
};

// Patient API
export const patientAPI = {
  getAll: (params) => api.get('/api/patients', { params }),
  getById: (id) => api.get(`/api/patients/${id}`),
  create: (patientData) => api.post('/api/patients', patientData),
  update: (id, patientData) => api.put(`/api/patients/${id}`, patientData),
  delete: (id) => api.delete(`/api/patients/${id}`),
  search: (query) => api.get('/api/patients/search', { params: { q: query } }),
};

// Medical Scan API
export const scanAPI = {
  getAll: (params) => api.get('/api/scans', { params }),
  getById: (id) => api.get(`/api/scans/${id}`),
  create: (scanData) => api.post('/api/scans', scanData),
  update: (id, scanData) => api.put(`/api/scans/${id}`, scanData),
  delete: (id) => api.delete(`/api/scans/${id}`),
  uploadImage: (scanId, imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    return api.post(`/api/scans/${scanId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyze: (scanId) => api.post(`/api/scans/${id}/analyze`),
};

// Diagnosis API
export const diagnosisAPI = {
  getAll: (params) => api.get('/api/diagnoses', { params }),
  getById: (id) => api.get(`/api/diagnoses/${id}`),
  create: (diagnosisData) => api.post('/api/diagnoses', diagnosisData),
  update: (id, diagnosisData) => api.put(`/api/diagnoses/${id}`, diagnosisData),
  delete: (id) => api.delete(`/api/diagnoses/${id}`),
  getByPatient: (patientId) => api.get(`/api/patients/${patientId}/diagnoses`),
  getByScan: (scanId) => api.get(`/api/scans/${scanId}/diagnoses`),
};

// User Management API
export const userAPI = {
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (userData) => api.post('/api/users', userData),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`),
  updateRole: (id, roleData) => api.put(`/api/users/${id}/role`, roleData),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/api/analytics/dashboard'),
  getPatientStats: (params) => api.get('/api/analytics/patients', { params }),
  getScanStats: (params) => api.get('/api/analytics/scans', { params }),
  getDiagnosisStats: (params) => api.get('/api/analytics/diagnoses', { params }),
  getRevenueStats: (params) => api.get('/api/analytics/revenue', { params }),
};

// File Upload API
export const uploadAPI = {
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (fileId) => api.delete(`/api/upload/${fileId}`),
};

export default api;
