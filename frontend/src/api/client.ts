import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('p5_token');
};

const SYSTEM_SUBDOMAINS = ['www', 'digitaltwin', 'app', 'portal', 'admin', 'dashboard', 'api', 'dev', 'stage', 'smartptrm', 'localhost'];

export const getTenantId = (): string => {
  // 1. Try from stored user object (set at login from JWT)
  try {
    const storedUser = localStorage.getItem('p5_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const userTenant = parsed?.tenantSubdomain || parsed?.tenant_subdomain || parsed?.tenantId || parsed?.tenant_id || parsed?.subdomain;
      if (userTenant && userTenant !== 'all' && !SYSTEM_SUBDOMAINS.includes(userTenant.toLowerCase())) {
        return userTenant;
      }
    }
  } catch {}

  // 2. Use the explicitly selected tenant subdomain (set at login or palika switcher)
  const stored = localStorage.getItem('tenant_id');
  if (stored && stored !== 'all' && stored !== '' && !SYSTEM_SUBDOMAINS.includes(stored.toLowerCase())) {
    return stored;
  }

  // 3. Dynamic extraction from subdomain (for multi-subdomain deployments, e.g. gaushala.smartptrm.com)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 && !SYSTEM_SUBDOMAINS.includes(parts[0].toLowerCase())) {
      return parts[0];
    }
  }

  return 'panchpokhari'; // Default tenant
};

export const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 120000,
  });

  // Request Interceptor: Attach Auth Token & Tenant ID + URL Normalization
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['x-tenant-id'] = getTenantId();

      // Normalize relative paths so /api/v1 is always preserved
      if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
        let clean = config.url.replace(/^\/+/, '');
        if (clean.startsWith('api/v1/')) {
          clean = clean.slice('api/v1/'.length);
        } else if (clean.startsWith('api/')) {
          clean = clean.slice('api/'.length);
        }
        config.url = clean;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

// Utility to fix Mojibake (UTF-8 decoded as Latin-1 or CP437) strings
const cp437Map = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\x0c\r\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■\xa0";

const fixMojibakeString = (str: string): string => {
  // First, try standard Latin-1 mojibake fix
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    // If it fails (e.g., contains CP437 characters like α (U+03B1)), try CP437 fix
    try {
      let isCP437 = true;
      let bytes = new Uint8Array(str.length);
      for(let i=0; i<str.length; i++) {
        let b = cp437Map.indexOf(str[i]);
        if(b === -1) {
          isCP437 = false;
          break;
        }
        bytes[i] = b;
      }
      if (isCP437 && typeof TextDecoder !== 'undefined') {
        const decoded = new TextDecoder('utf-8', {fatal: true}).decode(bytes);
        if (decoded && decoded !== str) return decoded;
      }
    } catch (err) {
      // Ignore TextDecoder errors
    }
    return str; // Return original if all fixes fail (it's already correct text)
  }
};

const fixMojibake = (data: any): any => {
  if (typeof data === 'string') {
    return fixMojibakeString(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => fixMojibake(item));
  }
  if (data !== null && typeof data === 'object') {
    const newData: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = fixMojibake(data[key]);
      }
    }
    return newData;
  }
  return data;
};

  // Response Interceptor: Handle Global API Errors and Fix Mojibake
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.data) {
        response.data = fixMojibake(response.data);
      }
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Unauthorized request - session may have expired.');
        toast.error('सेसन समाप्त भयो। कृपया फेरि लगइन गर्नुहोस्।', { id: 'session-expired' });
      } else if (error.response?.status === 403) {
        toast.error('तपाईंलाई यो कार्य गर्न अनुमति छैन।', { id: 'forbidden' });
      } else if (error.response?.status >= 500) {
        toast.error('सर्भरमा समस्या आयो। कृपया केही समयपछि प्रयास गर्नुहोस्।', { id: 'server-error' });
      } else if (!error.response) {
        toast.error('इन्टरनेट जडान वा सर्भरसँग सम्पर्क हुन सकेन।', { id: 'network-error' });
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const apiClient = createApiClient();

// Helper wrapper for typed API requests
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

export default api;
