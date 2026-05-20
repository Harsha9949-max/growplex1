import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser: user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  if (user.email !== "marateyh@gmail.com" && user.email !== process.env.VITE_ADMIN_EMAIL_OVERRIDE) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
