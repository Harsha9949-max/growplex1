import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [authStatus, setAuthStatus] = useState<{ isAllowed: boolean; role: string | null } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) {
      setAuthStatus({ isAllowed: false, role: null });
      return;
    }

    try {
      const cachedUser = JSON.parse(authData);
      if (!cachedUser || !cachedUser.id) {
        setAuthStatus({ isAllowed: false, role: null });
        return;
      }

      // If it is the hardcoded super-admin bypass, proceed directly with cache
      if (cachedUser.id === "super-admin-bypass") {
        const role = cachedUser.role || "Super Admin";
        if (allowedRoles && !allowedRoles.includes(role)) {
          setAuthStatus({ isAllowed: false, role });
        } else {
          setAuthStatus({ isAllowed: true, role });
        }
        return;
      }

      // Realtime subscription to the user doc in firestore for immediate reflection of new roles, status, and permissions
      const userDocRef = doc(db, "users", cachedUser.id);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const currentRole = userData.role;

          if (currentRole) {
            // Update localStorage in case roles/names are updated on the fly to keep active sessions in sync
            const updatedUser = { ...cachedUser, ...userData, id: docSnap.id };
            localStorage.setItem('adminAuth', JSON.stringify(updatedUser));

            if (allowedRoles && !allowedRoles.includes(currentRole)) {
              setAuthStatus({ isAllowed: false, role: currentRole });
            } else {
              setAuthStatus({ isAllowed: true, role: currentRole });
            }
          } else {
            // User exists but has no role assigned, revoke access immediately
            localStorage.removeItem('adminAuth');
            setAuthStatus({ isAllowed: false, role: null });
          }
        } else {
          // Admin account was deleted from the system, revoke access immediately
          localStorage.removeItem('adminAuth');
          setAuthStatus({ isAllowed: false, role: null });
        }
      }, (err) => {
        console.error("Error monitoring admin status:", err);
        // Fallback to cached role if Firestore is temporarily offline
        const role = cachedUser.role;
        if (role) {
          if (allowedRoles && !allowedRoles.includes(role)) {
            setAuthStatus({ isAllowed: false, role });
          } else {
            setAuthStatus({ isAllowed: true, role });
          }
        } else {
          setAuthStatus({ isAllowed: false, role: null });
        }
      });

      return () => unsubscribe();
    } catch (err) {
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

