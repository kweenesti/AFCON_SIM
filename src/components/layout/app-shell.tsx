
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
    // This effect should only run AFTER the initial loading is complete.
    if (isUserLoading) {
      return;
    }

    const isPublicPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/match/');

    // --- Logic for Unauthenticated Users ---
    if (!user) {
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }
    
    // --- Logic for Authenticated Users ---
    if (pathname === '/login' || pathname === '/register') {
      if (user.profile?.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
      return;
    }
    
    const isAdmin = user.profile?.role === 'admin';
    const isFederation = user.profile?.role === 'federation';

    // If a federation user tries to access admin-only pages, redirect them.
    if (isFederation && (pathname.startsWith('/admin') || pathname.startsWith('/schedule'))) {
      router.replace('/dashboard');
    }
    
    // If an admin is on the federation dashboard, redirect to admin.
    if (isAdmin && pathname.startsWith('/dashboard')) {
        router.replace('/admin');
    }

  }, [user, isUserLoading, pathname, router, auth]);

  // CRITICAL FIX: Do not render any protected content until authentication is resolved.
  if (isUserLoading) {
    return <AppShellSkeleton />;
  }

  const isPublicPage = ['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/match/');
  
  // For unauthenticated users, only render public pages. Otherwise, show skeleton until redirect happens.
  if (!user) {
    return isPublicPage ? <>{children}</> : <AppShellSkeleton />;
  }

  // If a logged-in user somehow lands on login/register, show skeleton until redirect.
  if (pathname === '/login' || pathname === '/register') {
    return <AppShellSkeleton />;
  }

  // User is authenticated, render the full shell
  const isAdmin = user.profile?.role === 'admin';

  const navItems = isAdmin
    ? [
        { href: '/admin', label: 'Admin', icon: UserCog },
        { href: '/schedule', label: 'Scheduler', icon: CalendarDays },
        { href: '/matches', label: 'Matches', icon: Swords },
        { href: '/tournament', label: 'Tournament', icon: Trophy },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/matches', label: 'Matches', icon: Swords },
        { href: '/tournament', label: 'Tournament', icon: Trophy },
      ];

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/login');
      });
    }
  };

  // Don't render the sidebar on the public homepage
  if (pathname === '/') {
    return <>{children}</>;
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
