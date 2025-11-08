// FILE: src/services/api.ts

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const jwtToken = localStorage.getItem('jwt_token');
    
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('linkedin_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // === THIS IS THE MISSING FUNCTION ===
  startAgent: async (niche: string) => {
    // The apiClient interceptor automatically adds the JWT token
    const response = await apiClient.post('/agent/start', { niche });
    return response.data;
  },
  // ====================================

  // Posts
  createPost: async (platform: string, content: string, imageData?: string) => {
    const response = await apiClient.post('/api/posts', {
      platform,
      content,
      image_data: imageData,
    });
    return response.data;
  },

  getPostCount: async () => {
    const response = await apiClient.get('/api/posts/count');
    return response.data;
  },

  getRecentPosts: async (limit: number = 10) => {
    const response = await apiClient.get('/api/posts/recent', {
      params: { limit },
    });
    return response.data;
  },

  getPostsByPlatform: async (platform: string, limit: number = 10) => {
    const response = await apiClient.get(`/api/posts/platform/${platform}`, {
      params: { limit },
    });
    return response.data;
  },

  getPostStats: async () => {
    const response = await apiClient.get('/api/posts/stats');
    return response.data;
  },

  // Summary
  getSummary: async () => {
    const response = await apiClient.get('/api/summary');
    return response.data;
  },

  updateSummary: async (field: 'total_completed' | 'total_failed', increment: number = 1) => {
    const response = await apiClient.put(`/api/summary/${field}`, null, {
      params: { increment },
    });
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  // Current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/me');
    return response.data;
  },
};

export default apiClient;