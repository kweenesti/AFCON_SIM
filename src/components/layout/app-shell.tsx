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
    if (isUserLoading) {
      return; 
    }

    const publicPages = ['/', '/login', '/register'];
    const isPublicPage = publicPages.includes(pathname) || pathname.startsWith('/match/');

    if (!user) {
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }

    const isAdmin = user.profile?.role === 'admin';
    const isFederation = user.profile?.role === 'federation';

    if (pathname === '/login' || pathname === '/register') {
        router.replace(isAdmin ? '/admin' : '/dashboard');
        return;
    }
    
    if (isAdmin) {
        const adminPages = ['/admin', '/schedule', '/matches', '/tournament'];
        const isAllowedAdminPage = adminPages.some(page => pathname.startsWith(page));

        if (pathname.startsWith('/dashboard') || (!isAllowedAdminPage && !isPublicPage)) {
            router.replace('/admin');
        }
        return;
    }
    
    if (isFederation) {
        if (pathname.startsWith('/admin') || pathname.startsWith('/schedule')) {
            router.replace('/dashboard');
        }
        return;
    }

  }, [user, isUserLoading, pathname, router]);

  if (isUserLoading) {
    return <AppShellSkeleton />;
  }
  
  const isPublicPage = ['/','/login', '/register'].includes(pathname) || pathname.startsWith('/match/');
  if (!user) {
    return isPublicPage ? <>{children}</> : <AppShellSkeleton />;
  }

  const isAdmin = user.profile?.role === 'admin';

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
