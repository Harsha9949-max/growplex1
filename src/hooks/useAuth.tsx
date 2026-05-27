import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, username?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Profile listener error:', error);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error logging in with email:', error);
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password sign-in is not enabled in Firebase Console.');
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, username?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          phone: '',
          username: username || email.split('@')[0],
          role: 'user',
          wallets: { earned: 0, pending: 27, bonus: 0, savings: 0 },
          signingBonus: 27,
          createdAt: Timestamp.now(),
      };
      await setDoc(userDocRef, profile);
    } catch (error: any) {
      console.error('Error registering with email:', error);
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password sign-in is not enabled in Firebase Console.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      }
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // Special Admin Detection
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'marateyh@gmail.com';
      const isAdminEmail = user.email === adminEmail;
      const role = isAdminEmail ? 'admin' : 'user';

      if (!userDoc.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          fullName: user.displayName || '',
          username: user.email!.split('@')[0],
          role: role as 'user' | 'admin',
          wallets: {
              earned: 0,
              pending: isAdminEmail ? 0 : 27,
              bonus: 0,
              savings: 0
          },
          signingBonus: isAdminEmail ? 0 : 27,
          createdAt: Timestamp.now(),
        };
        await setDoc(userDocRef, profile);
      } else if (isAdminEmail && userDoc.data()?.role !== 'admin') {
        // Update role if user is the designated admin but profile says otherwise
        await updateDoc(userDocRef, { role: 'admin' });
      }
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is not enabled in Firebase Console.');
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = useMemo(() => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'marateyh@gmail.com';
    return userProfile?.role === 'admin' || currentUser?.email === adminEmail;
  }, [userProfile, currentUser]);

  const value = useMemo(() => ({
    currentUser,
    userProfile,
    loading,
    isAdmin,
    loginWithEmail,
    registerWithEmail,
    signInWithGoogle,
    logout,
  }), [currentUser, userProfile, loading, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
