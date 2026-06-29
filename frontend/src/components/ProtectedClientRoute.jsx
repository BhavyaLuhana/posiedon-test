import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';

const ProtectedClientRoute = ({ children, requireProfileComplete = false }) => {
  const { isAuthenticated, loading, client } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/client-login" replace />;
  }

  // If profile completion is required and not complete
  if (requireProfileComplete && client && !client.profileComplete) {
    return <Navigate to="/client-profile/complete" replace />;
  }

  return children;
};

export default ProtectedClientRoute;