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
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    // Overall loading is true if auth is loading or if we have an auth user but are still loading their profile.
    const isLoading = isAuthLoading || (!!authUser && isProfileLoading);
    setIsUserLoading(isLoading);

    if (!isLoading) {
      if (authUser) {
        setCombinedUser({
          ...authUser,
          profile: userProfile || undefined,
        });
      } else {
        setCombinedUser(null);
      }
    }
  }, [authUser, userProfile, isAuthLoading, isProfileLoading]);


  return {
    user: combinedUser,
    isUserLoading: isUserLoading,
    userError: authError || profileError,
  };
};
