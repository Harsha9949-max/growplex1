import {
  ConfirmationResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
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
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

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

  const setupRecaptcha = (containerId: string) => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      'size': 'invisible',
    });
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      setupRecaptcha('recaptcha-container');
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      if (!confirmationResult) throw new Error('No confirmation result found');
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      // Check if profile exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          phone: user.phoneNumber || '',
          username: user.phoneNumber || 'User',
          role: 'user',
          onboardingStatus: 'not_started',
          onboardingStep: 0,
          isDigitalAgreementSigned: false,
          wallets: { earned: 0, pending: 27, bonus: 0, savings: 0 },
          signingBonus: 27,
          createdAt: Timestamp.now(),
        };
        await setDoc(userDocRef, profile);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
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
        onboardingStatus: isAdminEmail ? 'completed' : 'not_started',
        onboardingStep: isAdminEmail ? 6 : 0,
        isDigitalAgreementSigned: isAdminEmail,
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
  };

  const updateOnboarding = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, {
      ...data,
      onboardingStatus: data.onboardingStep === 7 ? 'completed' : 'in_progress'
    }, { merge: true });
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
    sendOTP,
    verifyOTP,
    signInWithGoogle,
    updateOnboarding,
    logout,
  }), [currentUser, userProfile, loading, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      <div id="recaptcha-container"></div>
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
