import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

// Attempt to load optional firebase-applet-config.json or environment config
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'email-verifier-demo.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'email-verifier-demo',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'email-verifier-demo.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456'
};

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
} catch (err) {
  console.warn('Firebase initialized in local-resilient mode:', err);
}

export { app, auth };
