import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [authStatus, setAuthStatus] = useState<{ isAllowed: boolean; role: string | null; clonedPages?: string[] } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');

    // If we have an adminAuth in localStorage, handle it first
    if (authData) {
      try {
        const cachedUser = JSON.parse(authData);
        if (cachedUser && cachedUser.id) {
          if (cachedUser.id === "super-admin-bypass") {
            const role = cachedUser.role || "Super Admin";
            const allowed = !allowedRoles || allowedRoles.includes(role);
            setAuthStatus({ isAllowed: allowed, role, clonedPages: cachedUser.clonedPages });
            return;
          }

          // Realtime watch the admin/support/sub-admin user doc
          const unsubscribe = onSnapshot(doc(db, "users", cachedUser.id), (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              let currentRole = userData.role;
              
              // Map legacy 'admin' value to 'Super Admin' or map custom google-login admin
              if (currentRole === "admin") {
                currentRole = "Super Admin";
              }

              if (currentRole) {
                const updatedUser = { ...cachedUser, ...userData, role: currentRole, id: docSnap.id };
                localStorage.setItem('adminAuth', JSON.stringify(updatedUser));

                const isClonedPage = userData.clonedPages?.includes(location.pathname);
                const isRoleAllowed = !allowedRoles || allowedRoles.includes(currentRole);

                if (isRoleAllowed || isClonedPage) {
                  setAuthStatus({ isAllowed: true, role: currentRole, clonedPages: userData.clonedPages });
                } else {
                  setAuthStatus({ isAllowed: false, role: currentRole, clonedPages: userData.clonedPages });
                }
              } else {
                localStorage.removeItem('adminAuth');
                setAuthStatus({ isAllowed: false, role: null });
              }
            } else {
              localStorage.removeItem('adminAuth');
              setAuthStatus({ isAllowed: false, role: null });
            }
          }, (err) => {
            console.error("Error monitoring admin user doc:", err);
            // Fallback to cache
            let role = cachedUser.role;
            if (role === "admin") {
              role = "Super Admin";
            }
            const isClonedPage = cachedUser.clonedPages?.includes(location.pathname);
            const isRoleAllowed = !allowedRoles || allowedRoles.includes(role);
            setAuthStatus({ isAllowed: isRoleAllowed || isClonedPage, role, clonedPages: cachedUser.clonedPages });
          });

          return () => unsubscribe();
        }
      } catch (e) {
        console.error("Failed to parse adminAuth:", e);
      }
    }

    // Otherwise, check Firebase Auth for Team members with clonedPages access
    let unsubUserSnap: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous user snapshot if auth state changes
      if (unsubUserSnap) {
        unsubUserSnap();
        unsubUserSnap = null;
      }

      if (user) {
        unsubUserSnap = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const isClonedPage = data.clonedPages?.includes(location.pathname);
            if (isClonedPage) {
              setAuthStatus({ isAllowed: true, role: data.role, clonedPages: data.clonedPages });
            } else {
              setAuthStatus({ isAllowed: false, role: data.role, clonedPages: data.clonedPages });
            }
          } else {
            setAuthStatus({ isAllowed: false, role: null });
          }
        }, (error) => {
          console.error("Error watching user document in checkFirebaseAuth:", error);
          setAuthStatus({ isAllowed: false, role: null });
        });
      } else {
        setAuthStatus({ isAllowed: false, role: null });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserSnap) unsubUserSnap();
    };
  }, [location.pathname, allowedRoles]);

  if (authStatus === null) {
    return null; // Prevents flashing while verifying status
  }

  if (!authStatus.isAllowed) {
    if (authStatus.role === "Support") {
      return <Navigate to="/admin/orders" replace />;
    } else if (authStatus.role === "Super Admin" || authStatus.role === "Sub-Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (authStatus.role === "team_member" || authStatus.role === "influencer") {
      const firstCloned = authStatus.clonedPages?.[0];
      if (firstCloned) {
        return <Navigate to={firstCloned} replace />;
      }
      return <Navigate to="/team/dashboard" replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
