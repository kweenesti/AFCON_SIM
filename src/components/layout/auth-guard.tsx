'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { AppShell } from './app-shell';
import { PublicLayout } from './public-layout';

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
    const isPublicPage =
      pathname === '/' ||
      pathname.startsWith('/tournament') ||
      pathname.startsWith('/match');

    if (!user) {
      // User is not logged in
      if (!isAuthPage && !isPublicPage) {
        // If trying to access a protected page, redirect to home
        router.replace('/');
      }
    } else {
      // User is logged in
      const isAdmin = user.profile?.role === 'admin';

      if (isAuthPage) {
        // If on an auth page, redirect to the correct dashboard
        router.replace(isAdmin ? '/admin' : '/dashboard');
        return;
      }

      if (isAdmin && !(pathname.startsWith('/admin') || pathname.startsWith('/schedule') || pathname.startsWith('/matches') || pathname.startsWith('/tournament'))) {
         router.replace('/admin');
         return;
      }

       if (!isAdmin && (pathname.startsWith('/admin') || pathname.startsWith('/schedule'))) {
        router.replace('/dashboard');
      }
    }
  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading) {
    return <FullPageLoading />;
  }
  
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/tournament') ||
    pathname.startsWith('/match');

  if (!user && isPublicRoute) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  if (!user && (pathname === '/login' || pathname === '/register')) {
    return <>{children}</>;
  }
  
  if (!user) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  return <AppShell>{children}</AppShell>;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // While waiting for the client to mount, we can show a loader
  // to prevent any flash of unstyled or incorrect content.
  if (!isClient) {
    return <FullPageLoading />;
  }

  return <AuthGuardContent>{children}</AuthGuardContent>;
}
