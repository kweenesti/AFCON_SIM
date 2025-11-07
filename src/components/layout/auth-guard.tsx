'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
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

export function AuthGuard({ children }: { children: ReactNode }) {
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
        const isFederation = user.profile?.role === 'federation';
        
        if (isAuthPage) {
             if (isAdmin) {
                router.replace('/admin');
            } else {
                router.replace('/dashboard');
            }
            return;
        }

        if (isAdmin && pathname.startsWith('/dashboard')) {
            router.replace('/admin');
            return;
        }

        if (isFederation && (pathname.startsWith('/admin') || pathname.startsWith('/schedule'))) {
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

    return <AppShell>{children}</AppShell>;
}
