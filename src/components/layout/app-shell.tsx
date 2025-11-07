
'use client';

import React from 'react';
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

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/');
    });
  };

  const handleLogin = () => {
    router.push('/login');
  }

  const isRegistered = !!user;

  // Define navigation items based on user role
  let navItems = [];

  if (isRegistered) {
    if (user.profile?.role === 'admin') {
      navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/matches', label: 'Matches', icon: Swords },
        { href: '/tournament', label: 'Tournament', icon: Trophy },
        { href: '/schedule', label: 'Scheduler', icon: CalendarDays },
        { href: '/admin', label: 'Admin', icon: UserCog },
      ];
    } else {
      // Regular federation user
      navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/matches', label: 'Matches', icon: Swords },
        { href: '/tournament', label: 'Tournament', icon: Trophy },
      ];
    }
  } else {
    // Logged-out visitor
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
           {isRegistered ? (
             <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
             </Button>
           ) : (
             <Button variant="ghost" size="sm" onClick={handleLogin}>
                Sign In
             </Button>
           )}
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
