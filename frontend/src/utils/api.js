import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Auth0 token to every request
let getTokenFn = null;
export function setTokenGetter(fn) {
  getTokenFn = fn;
}

api.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    try {
      const token = await getTokenFn();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Token unavailable — request will fail with 401 if protected
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'An unexpected error occurred';
    return Promise.reject(new Error(msg));
  }
);

// Auth
export const authAPI = {
  callback: (data) => api.post('/auth/callback', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  completeOnboarding: () => api.put('/auth/onboarding'),
};

// Contracts
export const contractsAPI = {
  create: (data) => api.post('/contracts', data),
  list: (params) => api.get('/contracts', { params }),
  get: (id) => api.get(`/contracts/${id}`),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
  send: (id) => api.post(`/contracts/${id}/send`),
  getStatus: (id) => api.get(`/contracts/${id}/status`),
  resend: (id) => api.post(`/contracts/${id}/resend`),
  download: (id) => api.post(`/contracts/${id}/download`),
  preview: (id) => api.get(`/contracts/${id}/preview`),
};

// Vehicles
export const vehiclesAPI = {
  lookup: (vin) => api.get('/vehicles/lookup', { params: { vin } }),
  fuelEconomy: (year, make, model) => api.get('/vehicles/fuel-economy', { params: { year, make, model } }),
  photo: (year, make, model) => api.get('/vehicles/photo', { params: { year, make, model } }),
};

// Calculator
export const calculatorAPI = {
  calculate: (data) => api.post('/calculator', data),
};

// Marketplace listings
export const listingsAPI = {
  browse: (params) => api.get('/listings', { params }),
  get: (id) => api.get(`/listings/${id}`),
  mine: () => api.get('/listings/mine'),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  setStatus: (id, status) => api.put(`/listings/${id}/status`, { status }),
  delete: (id) => api.delete(`/listings/${id}`),
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateKyc: (id, kyc_status) => api.put(`/admin/users/${id}/kyc`, { kyc_status }),
  getContracts: (params) => api.get('/admin/contracts', { params }),
  getStats: () => api.get('/admin/stats'),
};

export default api;
