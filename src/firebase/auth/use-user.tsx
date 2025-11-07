'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useFirebase, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';

export interface AuthUser extends User {
  profile?: UserProfile;
}

export interface UserHookResult {
  user: AuthUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const {
    user: authUser,
    isUserLoading: isAuthLoading,
    userError: authError,
  } = useFirebase();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (authUser ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser]
  );
  
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useDoc<UserProfile>(userProfileRef);
  
  // Combine the authUser and userProfile directly.
  // This is more stable than using a separate useEffect.
  const combinedUser: AuthUser | null = authUser
    ? {
        ...authUser,
        profile: userProfile || undefined,
      }
    : null;

  return {
    user: combinedUser,
    // The overall loading state should reflect both auth and profile loading.
    isUserLoading: isAuthLoading || (authUser && isProfileLoading),
    userError: authError || profileError,
  };
};
