
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RegistrationForm } from '@/components/team/registration-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { placeholderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { AppShell } from '@/components/layout/app-shell';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // Redirect logged-in users to their dashboard.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const heroImage = placeholderImages.find((img) => img.id === 'hero-stadium');

  // Show a loading skeleton while checking for a user session.
  if (isUserLoading) {
    return (
      <AppShell>
        <div className="flex min-h-screen w-full items-center justify-center">
          <div className="w-full max-w-4xl space-y-8 p-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </AppShell>
    );
  }
  
  // If there's no user, show the public registration page.
  return (
    <AppShell>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-5">
            <Card className="overflow-hidden">
              <div className="relative h-48 w-full md:h-64">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-primary-foreground">
                  <h1 className="font-headline text-3xl font-bold md:text-5xl">
                    African Nations Tournament Simulator
                  </h1>
                  <p className="mt-2 max-w-2xl text-lg text-primary-foreground/80">
                    The future of African football is here. Register your
                    federation and build your dream team.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="md:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Register Your Federation
                </CardTitle>
                <CardDescription>
                  Already have an account?{' '}
                  <Link href="/login" className="underline">
                    Sign in here
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegistrationForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
