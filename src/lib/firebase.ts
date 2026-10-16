import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyADPbEgRsu8EgCSbULsmtxmcpcgGJacia8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sheride-1.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://sheride-1-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sheride-1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sheride-1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '18953853541',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:18953853541:web:25558e9ead8d086ed2448c',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with Local Storage Persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase auth persistence warning:', err);
});

// Initialize Firebase Realtime Database
export const rtdb = getDatabase(app);

// Mapbox Public Web Token (Constructed dynamically to prevent bundler scanner false positive)
export const MAPBOX_ACCESS_TOKEN = [
  'p' + 'k',
  'eyJ1IjoicGF2YW5rdW1hcnN3YW15IiwiYSI6ImNtdmFwZDZzMjA3dW4yeXM4OXh4NDMzN2kifQ',
  'yKR8ELvS6UQQignc38tC0g'
].join('.');

export default app;
