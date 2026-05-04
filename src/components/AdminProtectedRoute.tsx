import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [authStatus, setAuthStatus] = useState<{ isAllowed: boolean; role: string | null } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        if (user && user.role) {
          if (allowedRoles && !allowedRoles.includes(user.role)) {
             // Authenticated but not authorized for this specific route
             setAuthStatus({ isAllowed: false, role: user.role });
          } else {
             setAuthStatus({ isAllowed: true, role: user.role });
          }
        } else {
           setAuthStatus({ isAllowed: false, role: null });
        }
      } catch (err) {
        setAuthStatus({ isAllowed: false, role: null });
      }
    } else {
      setAuthStatus({ isAllowed: false, role: null });
    }
  }, [location.pathname, allowedRoles]);

  if (authStatus === null) {
      return null;
  }

  if (!authStatus.isAllowed) {
    if (authStatus.role === "Support") {
      return <Navigate to="/admin/orders" replace />;
    } else if (authStatus.role) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

