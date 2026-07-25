import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from '../lib/firebase';
import { UserProfile, getUserProfile, updateUserProfile, registerDeviceSession } from '../lib/userProfile';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  deviceError: string | null;
  refreshProfile: () => Promise<void>;
  updatePlan: (plan: 'free' | 'pro') => Promise<void>;
  incrementRuns: () => Promise<void>;
  saveGeminiKey: (key: string) => Promise<void>;
  markTourSeen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginWithGoogle: async () => null,
  signOut: async () => {},
  isAdmin: false,
  deviceError: null,
  refreshProfile: async () => {},
  updatePlan: async () => {},
  incrementRuns: async () => {},
  saveGeminiKey: async () => {},
  markTourSeen: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const loadProfileForUser = async (u: User) => {
    // 1. Session check for max 2 devices
    const sessionRes = await registerDeviceSession(u.uid, navigator.userAgent);
    if (sessionRes.sessionRejected) {
      setDeviceError('Your account is already active on 2 other devices. Maximum 2 concurrent device sessions allowed.');
    } else {
      setDeviceError(null);
    }

    // 2. Load profile
    const p = await getUserProfile(u.uid, u.email);
    setProfile(p);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadProfileForUser(currentUser);
      } else {
        setProfile(null);
        setDeviceError(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid, user.email);
      setProfile(p);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const u = await signInWithGoogle();
      setUser(u);
      if (u) await loadProfileForUser(u);
      return u;
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        console.warn('Sign-in popup was closed before completion.');
        return null;
      }
      console.error('Google Auth Error:', err);
      return null;
    }
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    setProfile(null);
    setDeviceError(null);
  };

  const updatePlan = async (newPlan: 'free' | 'pro') => {
    if (!user) return;
    await updateUserProfile(user.uid, { plan: newPlan });
    setProfile(prev => prev ? { ...prev, plan: newPlan } : null);
  };

  const incrementRuns = async () => {
    if (!user || !profile) return;
    const nextRuns = (profile.runsUsed || 0) + 1;
    await updateUserProfile(user.uid, { runsUsed: nextRuns });
    setProfile(prev => prev ? { ...prev, runsUsed: nextRuns } : null);
  };

  const saveGeminiKey = async (key: string) => {
    if (!user) return;
    await updateUserProfile(user.uid, { customGeminiKey: key });
    setProfile(prev => prev ? { ...prev, customGeminiKey: key } : null);
  };

  const markTourSeen = async () => {
    if (!user) return;
    await updateUserProfile(user.uid, { tourSeen: true });
    setProfile(prev => prev ? { ...prev, tourSeen: true } : null);
  };

  const isAdmin = Boolean(user?.email && user.email.includes('admin'));

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithGoogle,
        signOut,
        isAdmin,
        deviceError,
        refreshProfile,
        updatePlan,
        incrementRuns,
        saveGeminiKey,
        markTourSeen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

