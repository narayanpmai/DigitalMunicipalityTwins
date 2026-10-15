import axios from 'axios';
import { getTenantId } from './tenant';

// Get base URL from environment variables, fallback to localhost if not set
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the Tenant ID (Palika ID) to every request
apiClient.interceptors.request.use(
  (config) => {
    const tenantId = getTenantId();
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    } else {
      // For development/testing: fallback to a default if not selected
      config.headers['X-Tenant-ID'] = 'panchpokhari';
    }
    
    // If we have an auth token, attach it here as well
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // For example, if token expires
      if (error.response.status === 401) {
        // Handle logout or token refresh
        console.warn('Unauthorized access - maybe token expired?');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
