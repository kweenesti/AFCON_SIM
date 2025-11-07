'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

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
      isAuthPage ||
      pathname === '/' ||
      pathname.startsWith('/tournament') ||
      pathname.startsWith('/match');

    if (!user) {
      if (!isPublicPage) {
        router.replace('/'); // Redirect to home page if not logged in and not on a public page
      }
      return;
    }

    const isAdmin = user.profile?.role === 'admin';
    const validAdminPaths = ['/admin', '/schedule', '/matches', '/tournament'];

    if (isAuthPage) {
      router.replace(isAdmin ? '/admin' : '/dashboard');
      return;
    }
    
    if (isAdmin && !validAdminPaths.some(p => pathname.startsWith(p))) {
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

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/tournament') ||
    pathname.startsWith('/match');
    
  if (isPublicRoute && !user) {
    return <>{children}</>;
  }

  if (!user && !isPublicRoute) {
    return <FullPageLoading />;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <FullPageLoading />;
  }

  return <AuthGuardContent>{children}</AuthGuardContent>;
}
