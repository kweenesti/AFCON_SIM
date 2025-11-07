
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

  useEffect(() => {
    if (isAuthLoading) {
      return; 
    }
    
    if (!authUser) {
      setCombinedUser(null);
      return;
    }

    if (isProfileLoading) {
        return;
    }

    setCombinedUser({
        ...authUser,
        profile: userProfile || undefined,
    });

  }, [authUser, userProfile, isAuthLoading, isProfileLoading]);

  const isLoading = isAuthLoading || (!!authUser && isProfileLoading);

  return {
    user: combinedUser,
    isUserLoading: isLoading,
    userError: authError || profileError,
  };
};
