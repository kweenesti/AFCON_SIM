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
    // CRITICAL FIX: Do not execute any logic until the authentication state is confirmed.
    if (isUserLoading) {
      return;
    }

    const publicPages = ['/', '/login', '/register'];
    const isPublicPage = publicPages.includes(pathname) || pathname.startsWith('/match/');

    // If the user is NOT logged in...
    if (!user) {
      // and they are not on a public page, redirect them to login.
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }

    // If the user IS logged in...
    const isAdmin = user.profile?.role === 'admin';
    const isFederation = user.profile?.role === 'federation';

    // and they are on a public-only page (like login), redirect them to their dashboard.
    if (pathname === '/login' || pathname === '/register') {
        router.replace(isAdmin ? '/admin' : '/dashboard');
        return;
    }
    
    // If the user is an admin but on a page only for federation users...
    if (isAdmin && pathname.startsWith('/dashboard')) {
        router.replace('/admin');
        return;
    }
    
    // If the user is a federation user but on a page only for admins...
    if (isFederation && pathname.startsWith('/admin')) {
        router.replace('/dashboard');
        return;
    }

  }, [user, isUserLoading, pathname, router]);


  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }
  };

  // While loading authentication state, show a full-page skeleton. This is key to preventing the redirect.
  if (isUserLoading) {
    return <AppShellSkeleton />;
  }
  
  // If not loading and not authenticated, render children for public pages (like login/register).
  if (!user) {
    return <>{children}</>;
  }

  // If we reach here, the user is logged in and auth state is confirmed. Render the full app shell.
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
