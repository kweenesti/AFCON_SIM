'use client';
import { useFirebase } from '@/firebase/provider';

export interface UserAuthHookResult {
  user: any;
  isUserLoading: boolean;
  userError: Error | null;
}
export const useUser = (): UserAuthHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
