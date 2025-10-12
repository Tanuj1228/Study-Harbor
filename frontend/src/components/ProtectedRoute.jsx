// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-20 text-indigo-600 text-lg">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect non-admin users away from admin pages
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;