'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LogOut,
  Swords,
  UserCog,
  CalendarDays,
  Trophy,
} from 'lucide-react';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '../icons/logo';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

function AppShellSkeleton() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-4xl space-y-8 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  useEffect(() => {
    // This effect now ONLY handles redirects AFTER loading is complete.
    if (isUserLoading) {
      return; // Do nothing while loading.
    }

    const publicPages = ['/', '/login', '/register'];
    const isPublicPage = publicPages.includes(pathname) || pathname.startsWith('/match/');

    // Handle users who are NOT logged in
    if (!user) {
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }

    // Handle users who ARE logged in
    const isAdmin = user.profile?.role === 'admin';
    const isFederation = user.profile?.role === 'federation';

    if (pathname === '/login' || pathname === '/register') {
        router.replace(isAdmin ? '/admin' : '/dashboard');
        return;
    }
    
    if (isAdmin && pathname.startsWith('/dashboard')) {
        router.replace('/admin');
        return;
    }
    
    if (isFederation && pathname.startsWith('/admin')) {
        router.replace('/dashboard');
        return;
    }

  }, [user, isUserLoading, pathname, router]);

  // STAGE 1: AUTHENTICATION IS LOADING
  // Show a full-page skeleton and do nothing else. This prevents any
  // other logic from running and causing a race condition.
  if (isUserLoading) {
    return <AppShellSkeleton />;
  }
  
  // STAGE 2: LOADING IS COMPLETE, BUT USER IS NOT LOGGED IN
  // For public pages, we can render the content directly.
  // For protected pages, the useEffect above will handle the redirect to /login.
  if (!user) {
    const isPublicPage = ['/','/login', '/register'].includes(pathname) || pathname.startsWith('/match/');
    return isPublicPage ? <>{children}</> : <AppShellSkeleton />; // Show skeleton while redirecting
  }

  // STAGE 3: LOADING IS COMPLETE, AND USER IS LOGGED IN
  // Render the full application shell with sidebar and content.
  const isAdmin = user?.profile?.role === 'admin';

  let navItems = [];

  if (isAdmin) {
    navItems = [
      { href: '/admin', label: 'Admin', icon: UserCog },
      { href: '/schedule', label: 'Scheduler', icon: CalendarDays },
      { href: '/matches', label: 'Matches', icon: Swords },
      { href: '/tournament', label: 'Tournament', icon: Trophy },
    ];
  } else {
    navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/matches', label: 'Matches', icon: Swords },
      { href: '/tournament', label: 'Tournament', icon: Trophy },
    ];
  }

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }
  };


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div />
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}


export function AppShell({ children }: { children: React.ReactNode }) {
  return (
      <AppShellContent>{children}</AppShellContent>
  );
}
