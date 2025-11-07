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
  
  const [combinedUser, setCombinedUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return; // Wait for the initial auth check to complete
    }

    if (authUser) {
      // Auth user exists, now we can combine with the profile, even if it's still loading
      setCombinedUser({
        ...authUser,
        profile: userProfile || undefined, // Attach profile if available
      });
    } else {
      // No auth user, so set combined user to null
      setCombinedUser(null);
    }
  }, [authUser, userProfile, isAuthLoading]);
  
  // The primary loading state should ONLY reflect the initial authentication check.
  // The UI can separately handle the `isProfileLoading` state if needed.
  return {
    user: combinedUser,
    isUserLoading: isAuthLoading,
    userError: authError || profileError,
  };
};
