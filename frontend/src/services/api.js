import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


//! SURAJ DID THIS CHANGE
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/user/register', userData),
    login: (credentials) => api.post('/user/login', credentials),
    // Google Auth
    googleLogin: () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    },
    checkAuthStatus: () => api.get('/auth/status'),
};

//! TANISHA DID THIS CHANGE

// Files API
export const filesAPI = {
    upload: (formData) => api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getMyFiles: () => api.get('/files/my-files'),
    shareFile: (uuid, recipientEmail) => api.post(`/files/share/${uuid}`, { recipientEmail }),
    getFileInfo: (uuid) => api.get(`/files/info/${uuid}`),
    downloadFile: (uuid) => api.get(`/files/download/${uuid}`, {
        responseType: 'blob',
    }),
};

export default api;