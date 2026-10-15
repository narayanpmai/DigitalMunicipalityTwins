const API_URL = (typeof window !== 'undefined' && window.location.origin)
  ? '/api/v1'
  : 'http://localhost:3001/api/v1'; 

export const api = {
  getAuthToken: () => localStorage.getItem('p5_token'),
  
  headers: function() {
    const token = this.getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Dynamic Tenant Resolution
    let tenantId = localStorage.getItem('tenant_id');
    if (!tenantId && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Extract subdomain, e.g., 'kathmandu.domain.com' -> 'kathmandu'
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        tenantId = parts[0];
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        tenantId = 'panchpokhari'; // Default demo tenant for local dev
      } else {
        tenantId = 'default';
      }
    }
    
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }
    
    return headers;
  },

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...this.headers(), ...options.headers }
      });
      
      if (!response.ok) {
        let errorData;
        try { errorData = await response.json(); } catch(e) { errorData = { message: response.statusText }; }
        throw new Error(errorData.message || 'API Error');
      }
      
      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  },

  get: function(endpoint) { return this.request(endpoint, { method: 'GET' }); },
  post: function(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); },
  put: function(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); },
  delete: function(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};

window.api = api;

// Dynamic Tenant Branding Initialization
window.initTenantConfig = async function() {
  try {
    const settings = await window.api.get('/settings/public');
    const palikaName = settings['palika_name'] || 'पाँचपोखरी थाङपाल गाउँपालिका';
    const slogan = settings['slogan'] || 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका';
    
    document.title = `${palikaName} - Digital Twin`;
    
    // Update all elements with class .tenant-name
    document.querySelectorAll('.tenant-name').forEach(el => {
      el.textContent = palikaName;
    });
    
    // Update all elements with class .tenant-slogan
    document.querySelectorAll('.tenant-slogan').forEach(el => {
      el.textContent = slogan;
    });
  } catch (e) {
    console.error("Failed to load tenant configuration:", e);
  }
};
