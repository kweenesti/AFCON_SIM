
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
    // Wait until the authentication status is fully resolved before doing any redirects.
    if (isUserLoading) {
      return;
    }

    const publicPages = ['/', '/login', '/register'];
    const isPublicPage = publicPages.includes(pathname);

    // If user is not logged in, redirect to login page if not already on a public page.
    if (!user) {
      if (!isPublicPage) {
        router.replace('/login');
      }
      return;
    }

    // If user is logged in and on a public page, redirect them to their respective dashboard.
    if (isPublicPage) {
      router.replace(user.profile?.role === 'admin' ? '/admin' : '/dashboard');
      return;
    }
    
    // If the user is an admin, ensure they are on an admin-accessible page.
    if (user.profile?.role === 'admin') {
      const isAdminPage = ['/admin', '/schedule', '/matches', '/tournament'].some(p => pathname.startsWith(p));
      if (!isAdminPage) {
        router.replace('/admin');
      }
    } 
    // If the user is a federation member, ensure they are on a federation-accessible page.
    else if (user.profile?.role === 'federation') {
      const isFederationPage = ['/dashboard', '/matches', '/tournament'].some(p => pathname.startsWith(p));
      if (!isFederationPage) {
        router.replace('/dashboard');
      }
    }

  }, [user, isUserLoading, pathname, router]);

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/');
      });
    }
  };

  if (isUserLoading) {
    return <AppShellSkeleton />;
  }

  // A user must be logged in to see any page with the AppShell.
  // The redirection logic above handles unauthenticated users.
  if (!user) {
    // Render a skeleton or nothing while redirecting.
    return <AppShellSkeleton />;
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
                    isActive={pathname.startsWith(item.href)}
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
  // This outer component acts as a boundary.
  // It ensures FirebaseClientProvider has mounted before its children try to access the context.
  return (
      <AppShellContent>{children}</AppShellContent>
  );
}
