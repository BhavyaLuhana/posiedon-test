import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  clientLogin as apiClientLogin, 
  clientLogout as apiClientLogout,
  getClientProfile,
  clientRegister as apiClientRegister
} from '../services/api';
import { toast } from 'react-hot-toast';

const ClientAuthContext = createContext(null);

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getClientProfile();
      // The API returns { success: true, data: {...} }
      if (data && data.data) {
        setClient(data.data);
        setIsAuthenticated(true);
      } else if (data && data.id) {
        // Handle case where API returns user directly
        setClient(data);
        setIsAuthenticated(true);
      } else {
        setClient(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Not authenticated or error
      setClient(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // For unified login - accepts user data from API response
  const login = (userData) => {
    setClient(userData);
    setIsAuthenticated(true);
    toast.success('Client login successful!');
  };

  const clientLogin = async (email, password) => {
    try {
      const data = await apiClientLogin(email, password);
      // API returns { user: {...} }
      if (data && data.user) {
        setClient(data.user);
        setIsAuthenticated(true);
        toast.success('Client login successful!');
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const clientRegister = async (email, password) => {
    try {
      const data = await apiClientRegister(email, password);
      toast.success(data.message || 'Registration successful! Please login.');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const clientLogout = async () => {
    try {
      await apiClientLogout();
      setClient(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setClient(null);
      setIsAuthenticated(false);
      toast.error('Logout failed, but local session cleared');
    }
  };

  const updateClient = (updatedData) => {
    setClient(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    client,
    loading,
    isAuthenticated,
    login, // For unified login
    clientLogin,
    clientRegister,
    clientLogout,
    checkAuth,
    updateClient,
    // Aliases for backward compatibility
    user: client,
    logout: clientLogout,
    setUser: setClient,
    setIsAuthenticated,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
};

export default ClientAuthContext;