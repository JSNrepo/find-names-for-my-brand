import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  plan: 'free' | 'pro';
  runsUsed: number;
  customGeminiKey?: string;
  tourSeen: boolean;
  sessions: {
    deviceId: string;
    lastSeen: string;
    userAgent: string;
  }[];
}

export function getDeviceId(): string {
  let devId = localStorage.getItem('findnames_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem('findnames_device_id', devId);
  }
  return devId;
}

export async function getUserProfile(uid: string, email?: string | null): Promise<UserProfile> {
  const defaultProfile: UserProfile = {
    uid,
    email: email || null,
    plan: 'free',
    runsUsed: Number(localStorage.getItem(`findnames_runs_${uid}`) || 0),
    customGeminiKey: localStorage.getItem(`findnames_gemini_key_${uid}`) || '',
    tourSeen: localStorage.getItem(`findnames_tour_seen_${uid}`) === 'true',
    sessions: []
  };

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<UserProfile>;
      return {
        ...defaultProfile,
        ...data,
        plan: data.plan === 'pro' ? 'pro' : 'free',
        runsUsed: typeof data.runsUsed === 'number' ? data.runsUsed : defaultProfile.runsUsed,
        customGeminiKey: data.customGeminiKey || defaultProfile.customGeminiKey,
        tourSeen: typeof data.tourSeen === 'boolean' ? data.tourSeen : defaultProfile.tourSeen,
        sessions: data.sessions || []
      };
    } else {
      // Initialize new user doc in Firestore
      await setDoc(userDocRef, defaultProfile, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore user profile lookup fallback to local storage:', err);
    // Check local storage only as offline fallback
    const localPlan = localStorage.getItem(`findnames_plan_${uid}`);
    if (localPlan === 'pro') {
      defaultProfile.plan = 'pro';
    }
  }

  return defaultProfile;
}

export async function registerDeviceSession(uid: string, userAgentStr: string): Promise<{ success: boolean; activeDevicesCount: number; sessionRejected?: boolean }> {
  // Device limiting checks completely removed per open-source requirements
  return { success: true, activeDevicesCount: 1, sessionRejected: false };
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  // Sync to localStorage
  if (updates.plan) localStorage.setItem(`findnames_plan_${uid}`, updates.plan);
  if (typeof updates.runsUsed === 'number') localStorage.setItem(`findnames_runs_${uid}`, String(updates.runsUsed));
  if (typeof updates.customGeminiKey === 'string') localStorage.setItem(`findnames_gemini_key_${uid}`, updates.customGeminiKey);
  if (typeof updates.tourSeen === 'boolean') localStorage.setItem(`findnames_tour_seen_${uid}`, String(updates.tourSeen));

  // Sync to Firestore
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, updates, { merge: true });
  } catch (e) {
    console.warn('Failed syncing updates to Firestore:', e);
  }
}
