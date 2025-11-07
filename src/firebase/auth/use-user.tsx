
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
    if (isLoading) {
      return; 
    }
    
    if (!authUser) {
      setCombinedUser(null);
      return;
    }

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
