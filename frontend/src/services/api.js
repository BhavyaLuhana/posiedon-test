import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth APIs
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

// Client APIs
export const createClient = async (clientData) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

export const getAllClients = async () => {
  const response = await api.get('/clients');
  return response.data;
};

export const getClientById = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const updateClient = async (id, clientData) => {
  const response = await api.put(`/clients/${id}`, clientData);
  return response.data;
};

export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};

export const clientApi = {
  submitForm: (data) => api.post('/clients/submit', data),
  getAllClients: () => api.get('/clients/all'),
  getClientById: (id) => api.get(`/clients/${id}`),
  updateStatus: (id, status) => api.put(`/clients/${id}/status`, { status }),
};

export default api;