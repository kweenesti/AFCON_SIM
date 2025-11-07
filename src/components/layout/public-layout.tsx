
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogIn,
  Swords,
  UserPlus,
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
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '../icons/logo';
import { Button } from '../ui/button';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/register', label: 'Register', icon: UserPlus },
    { href: '/login', label: 'Sign In', icon: LogIn },
    { href: '/matches', label: 'Matches', icon: Swords },
    { href: '/tournament', label: 'Tournament', icon: Trophy },
  ];

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
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:justify-end">
          <SidebarTrigger className="md:hidden" />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
         <footer className="border-t bg-muted py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} African Nations Tournament. All Rights Reserved.
            </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
