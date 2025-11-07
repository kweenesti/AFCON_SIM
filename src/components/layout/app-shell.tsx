
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FilePlus,
  Home,
  LogOut,
  Swords,
  UserCog,
  CalendarDays,
  Trophy
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

  const handleLogout = () => {
    signOut(auth);
    router.push('/');
  };

  const isRegistered = !isUserLoading && !!user;

  // Render a loading state until the user's auth status is confirmed.
  // This prevents the redirect loop caused by flickering auth state.
  if (isUserLoading) {
    return (
       <SidebarProvider>
         <Sidebar>
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent className="p-2">
               <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </SidebarContent>
         </Sidebar>
         <SidebarInset>
            <header className="flex h-12 items-center justify-start gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
              <SidebarTrigger className="md:hidden" />
            </header>
            <div className="flex-1 overflow-auto p-8">
               <Skeleton className="h-64 w-full" />
            </div>
         </SidebarInset>
       </SidebarProvider>
    );
  }

  // Base navigation for all users (including logged-out)
  let navItems = [
    { href: '/', label: 'Register', icon: FilePlus },
    { href: '/matches', label: 'Matches', icon: Swords },
    { href: '/tournament', label: 'Tournament', icon: Trophy },
  ];

  if (isRegistered) {
    if (user?.profile?.role === 'admin') {
      navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/matches', label: 'Matches', icon: Swords },
        { href: '/tournament', label: 'Tournament', icon: Trophy },
        { href: '/schedule', label: 'Scheduler', icon: CalendarDays },
        { href: '/admin', label: 'Admin', icon: UserCog },
      ];
    } else { // Federation user
      navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/matches', label: 'Matches', icon: Swords },
        { href: '/tournament', label: 'Tournament', icon: Trophy },
      ];
    }
  } else { // Logged-out user
     navItems = [
        { href: '/', label: 'Register', icon: FilePlus },
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
          {isRegistered && (
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
                  <LogOut />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-start gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Get Help
          </Button>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
