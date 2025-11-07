'use client';

import React, { useState, useEffect } from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

// This component ensures Firebase is initialized only on the client.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  // useEffect only runs on the client, so we can safely set the state here.
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If it's not the client yet, don't render anything.
  // This prevents any server-side rendering of components that need Firebase.
  if (!isClient) {
    return null;
  }

  // Once we're on the client, we can initialize Firebase and provide it.
  const firebaseServices = initializeFirebase();

  return <FirebaseProvider {...firebaseServices}>{children}</FirebaseProvider>;
}
