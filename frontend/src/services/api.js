import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============ ADMIN AUTH APIs ============
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const completeAdminSetup = async (newEmail, newPassword) => {
  const response = await api.post('/auth/complete-admin-setup', { newEmail, newPassword });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// ============ LEAD SUBMISSION (Lightweight) ============
export const submitLead = async (leadData) => {
  const response = await api.post('/leads/submit', leadData);
  return response.data;
};

// ============ ADMIN CLIENT MANAGEMENT ============
export const getAllClients = async () => {
  const response = await api.get('/clients/all');
  return response.data;
};

export const getClientById = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const updateClientStatus = async (id, status, notes) => {
  const response = await api.put(`/clients/${id}/status`, { status, notes });
  return response.data;
};

export const approveLead = async (id, notes) => {
  const response = await api.post(`/admin/leads/${id}/approve`, { notes });
  return response.data;
};

export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};

export const getClientStats = async () => {
  const response = await api.get('/clients/stats/summary');
  return response.data;
};

// ============ CLIENT AUTH APIs ============
export const clientRegister = async (email, password) => {
  const response = await api.post('/client-auth/register', { email, password });
  return response.data;
};

export const clientLogin = async (email, password) => {
  const response = await api.post('/client-auth/login', { email, password });
  return response.data;
};

export const clientLogout = async () => {
  const response = await api.post('/client-auth/logout');
  return response.data;
};

export const getClientProfile = async () => {
  const response = await api.get('/client-auth/me');
  return response.data;
};

// Complete profile (first time - from Registered to Active)
export const completeClientProfile = async (profileData) => {
  const response = await api.put('/client-auth/profile/complete', profileData);
  return response.data;
};

// Update profile (editable fields)
export const updateClientProfile = async (profileData) => {
  const response = await api.put('/client-auth/profile', profileData);
  return response.data;
};

export default api;