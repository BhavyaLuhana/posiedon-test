import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser, logout as logoutApi } from '../services/api';

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

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};