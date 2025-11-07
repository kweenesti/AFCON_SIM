
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
  const { user: authUser, isUserLoading: isAuthLoading, userError: authError } = useFirebase();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (authUser?.uid && firestore ? doc(firestore, 'users', authUser.uid) : null),
    [firestore, authUser?.uid]
  );
  
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useDoc<UserProfile>(userProfileRef);
  
  const [combinedUser, setCombinedUser] = useState<AuthUser | null>(null);
  
  // Overall loading state considers auth state and profile loading *if* a user is logged in
  const isLoading = isAuthLoading || (!!authUser && isProfileLoading);

  useEffect(() => {
    // Don't do anything until all loading is complete
    if (isLoading) {
      return; 
    }
    
    // If there's no authenticated user after loading, there's no combined user
    if (!authUser) {
      setCombinedUser(null);
      return;
    }

    // If we have an auth user and loading is done, construct the combined user object
    setCombinedUser({
        ...authUser,
        profile: userProfile || undefined,
    });

  }, [authUser, userProfile, isLoading]);

  return {
    user: combinedUser,
    isUserLoading: isLoading,
    userError: authError || profileError,
  };
};
