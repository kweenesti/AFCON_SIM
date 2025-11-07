'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, initializeFirebase, FirebaseProvider as InternalFirebaseProvider, useFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell } from './app-shell';

function FullPageLoading() {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-full max-w-4xl space-y-8 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
}

function AuthGuardContent({ children }: { children: ReactNode }) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isUserLoading) {
            return; // Do nothing while loading
        }

        const isAuthPage = pathname === '/login' || pathname === '/register';
        const isPublicPage = isAuthPage || pathname === '/';

        if (!user) {
            if (!isPublicPage) {
                router.replace('/login');
            }
            return;
        }

        const isAdmin = user.profile?.role === 'admin';
        
        if (isAuthPage) {
             if (isAdmin) {
                router.replace('/admin');
            } else {
                router.replace('/dashboard');
            }
            return;
        }

        if (isAdmin && pathname === '/dashboard') {
            router.replace('/admin');
            return;
        }

        if (!isAdmin && (pathname.startsWith('/admin') || pathname.startsWith('/schedule'))) {
            router.replace('/dashboard');
        }

    }, [user, isUserLoading, pathname, router]);

    if (isUserLoading) {
        return <FullPageLoading />;
    }

    const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';
    if(isPublicPage && !user) {
        return <>{children}</>;
    }
    
    if(!user && !isPublicPage) {
        return <FullPageLoading />;
    }

    // At this point, user is loaded and is not on a public-only page
    return <AppShell>{children}</AppShell>;
}


export function AuthGuard({ children }: { children: ReactNode }) {
  // This state check ensures we don't try to render anything on the server.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Render nothing on the server
  }

  return <AuthGuardContent>{children}</AuthGuardContent>;
}

export function FirebaseProvider({children}: {children: ReactNode}) {
    const firebaseServices = initializeFirebase();
    return (
        <InternalFirebaseProvider {...firebaseServices}>
            {children}
        </InternalFirebaseProvider>
    )
}
