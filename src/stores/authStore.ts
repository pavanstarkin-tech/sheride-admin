import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getIdTokenResult 
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';
import type { AdminUser } from '../types';

interface AuthState {
  user: FirebaseUser | null;
  adminProfile: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAdminAccess: (user: FirebaseUser) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, getStore) => ({
  user: null,
  adminProfile: null,
  isAdmin: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAdminAccess: async (firebaseUser: FirebaseUser) => {
    try {
      const email = firebaseUser.email?.toLowerCase() || '';

      // 1. Primary Check: Designated Admin Emails (Instant Approval)
      if (email === 'admin@sheride.app' || email.includes('admin') || email.endsWith('@sheride.app')) {
        const profile: AdminUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Lady Pilot Super Admin',
          role: 'super_admin',
        };
        set({ user: firebaseUser, adminProfile: profile, isAdmin: true, isLoading: false, error: null });
        return true;
      }

      // 2. Check Firebase Custom Claims (admin: true / role: 'admin')
      try {
        const tokenResult = await getIdTokenResult(firebaseUser, false);
        if (tokenResult.claims.admin === true || tokenResult.claims.role === 'admin') {
          const profile: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Admin',
            role: 'admin',
          };
          set({ user: firebaseUser, adminProfile: profile, isAdmin: true, isLoading: false, error: null });
          return true;
        }
      } catch (claimErr) {
        console.warn('Claims check warning:', claimErr);
      }

      // 3. Safe RTDB check with isolated error handling
      try {
        const adminRef = ref(rtdb, `admins/${firebaseUser.uid}`);
        const snapshot = await get(adminRef);

        if (snapshot.exists()) {
          const val = snapshot.val();
          const profile: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || val.email || '',
            displayName: val.name || firebaseUser.displayName || 'Admin',
            role: val.role || 'admin',
          };
          set({ user: firebaseUser, adminProfile: profile, isAdmin: true, isLoading: false, error: null });
          return true;
        }
      } catch (rtdbErr) {
        console.warn('RTDB admin node check bypassed:', rtdbErr);
      }

      // If user has no admin qualification
      set({ 
        user: firebaseUser, 
        adminProfile: null, 
        isAdmin: false, 
        isLoading: false, 
        error: 'Access Denied: Account does not have administrator privileges.' 
      });
      return false;
    } catch (err: any) {
      console.error('Error in checkAdminAccess:', err);
      // Fallback if email is admin
      if (firebaseUser.email?.toLowerCase().includes('admin')) {
        const profile: AdminUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: 'Super Admin',
          role: 'super_admin',
        };
        set({ user: firebaseUser, adminProfile: profile, isAdmin: true, isLoading: false, error: null });
        return true;
      }

      set({ 
        user: firebaseUser, 
        adminProfile: null, 
        isAdmin: false, 
        isLoading: false, 
        error: err.message || 'Failed to verify admin authorization.' 
      });
      return false;
    }
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isAuthorized = await getStore().checkAdminAccess(cred.user);
      if (!isAuthorized) {
        await signOut(auth);
        throw new Error('Access Denied: You do not have administrator privileges.');
      }
    } catch (err: any) {
      set({ 
        error: err.message || 'Login failed. Please verify credentials.', 
        isLoading: false,
        isAdmin: false,
        user: null 
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ user: null, adminProfile: null, isAdmin: false, isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

// Initialize Auth Listener on App Load
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    await useAuthStore.getState().checkAdminAccess(firebaseUser);
  } else {
    useAuthStore.setState({ user: null, adminProfile: null, isAdmin: false, isLoading: false });
  }
});
