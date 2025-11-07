'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FilePlus,
  Home,
  LogOut,
  Swords,
  UserCog,
  CalendarDays,
  Trophy,
  LogIn,
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  // The single source of truth for role-based redirection.
  useEffect(() => {
    // Only run this logic when user loading is complete and we have a user object with a profile.
    if (!isUserLoading && user?.profile) {
      const isAdmin = user.profile.role === 'admin';
      const isPublicPage = ['/login', '/register'].includes(pathname) || pathname === '/';
      const isOnAdminPage = pathname.startsWith('/admin');
      const isOnDashboardPage = pathname.startsWith('/dashboard');

      if (isAdmin) {
        // If an admin is on any page that is NOT an admin-allowed page, redirect them to /admin.
        // Admin-allowed pages are /admin, /schedule, /matches, /tournament.
        if (!isOnAdminPage && !['/schedule', '/matches', '/tournament'].includes(pathname)) {
          router.replace('/admin');
        }
      } else { // Is a federation user
        // If a federation user is on an admin page, redirect them to their dashboard.
        if (isOnAdminPage || pathname.startsWith('/schedule')) {
          router.replace('/dashboard');
        }
      }
    }
  }, [user, isUserLoading, pathname, router]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/');
    });
  };

  const handleLogin = () => {
    router.push('/login');
  }

  const isRegistered = !!user;
  const isAdmin = user?.profile?.role === 'admin';

  let navItems = [];
  
  if (isAdmin) {
    navItems = [
      { href: '/admin', label: 'Admin', icon: UserCog },
      { href: '/schedule', label: 'Scheduler', icon: CalendarDays },
      { href: '/matches', label: 'Matches', icon: Swords },
      { href: '/tournament', label: 'Tournament', icon: Trophy },
    ];
  } else if (isRegistered) {
    // Regular federation user
    navItems = [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/matches', label: 'Matches', icon: Swords },
      { href: '/tournament', label: 'Tournament', icon: Trophy },
    ];
  } else {
    // Logged-out visitor
    navItems = [
      { href: '/register', label: 'Register', icon: FilePlus },
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
             {isUserLoading && (
              <div className="flex flex-col gap-2 p-2">
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-8 w-full" />
              </div>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {isRegistered ? (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : !isUserLoading ? (
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogin} tooltip="Sign In">
                  <LogIn />
                  <span>Sign In</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          ) : null}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          {/* Header content can be added here if needed */}
          <div />
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
