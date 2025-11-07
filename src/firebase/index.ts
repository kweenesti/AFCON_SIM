
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This function initializes Firebase and exports the SDKs.
// It's designed to be called once on the client side.
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // This is a safeguard, but the logic in AuthGuard should prevent this.
    throw new Error("Firebase cannot be initialized on the server.");
  }
  
  if (!getApps().length) {
    try {
      // First, try to initialize with App Hosting's auto-configuration
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          'Automatic initialization failed. Falling back to firebase config object.',
          e
        );
      }
      // If that fails (e.g., in local dev), use the hardcoded config.
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  
  return { firebaseApp, auth, firestore };
}

// Export the hooks and providers
export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './auth/use-user';
