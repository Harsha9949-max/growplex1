import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}



const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If admin, they bypass onboarding
  if (isAdmin) {
    return <>{children}</>;
  }

  // Onboarding Redirection Logic for regular users
  const isOnOnboardingPage = location.pathname === '/onboarding';
  const hasCompletedOnboarding = userProfile?.onboardingStatus === 'completed';

  if (!hasCompletedOnboarding && !isOnOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  if (hasCompletedOnboarding && isOnOnboardingPage) {
     return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
