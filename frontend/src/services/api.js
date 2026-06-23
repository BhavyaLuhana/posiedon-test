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

// ============ AUTH APIs ============
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

// ============ CLIENT APIs ============
// These match the actual routes defined in server.js.
// (Removed an older duplicate set of client functions that pointed at
// routes which don't exist on the backend — /clients, /clients/:id PUT,
// etc. — and were causing 404s.)

export const submitClientForm = async (clientData) => {
  const response = await api.post('/clients/submit', clientData);
  return response.data;
};

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

export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};

export const getClientStats = async () => {
  const response = await api.get('/clients/stats/summary');
  return response.data;
};

export default api;