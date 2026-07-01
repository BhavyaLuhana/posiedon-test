import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser, logout as logoutApi, login as loginApi } from '../services/api';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // Access token likely expired (401) — try a silent refresh
      // using the httpOnly refresh token cookie before giving up.
      if (error.response?.status === 401) {
        try {
          await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
          // Refresh succeeded — retry fetching the user once
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        } catch (refreshError) {
          // Refresh token itself is invalid/expired — genuinely logged out
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
      }

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // For unified login - accepts user data from API response
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    toast.success('Admin login successful!');
  };

  const adminLogin = async (email, password) => {
    try {
      const data = await loginApi({ email, password });
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success('Admin login successful!');
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    login, // For unified login
    adminLogin,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};