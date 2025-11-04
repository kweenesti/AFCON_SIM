'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/components/layout/app-shell';
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import type { Federation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { List, PlayCircle } from 'lucide-react';

export default function AdminPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [message, setMessage] = useState('');

  const federationsRef = useMemoFirebase(
    () => (user?.profile?.role === 'admin' ? collection(firestore, 'federations') : null),
    [firestore, user]
  );
  
  const { data: federations, isLoading: isFederationsLoading } = useCollection<Federation>(federationsRef);

  useEffect(() => {
    if (!isUserLoading && (!user || user.profile?.role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleStartTournament = async () => {
    if (!federations) return;

    if (federations.length !== 8) {
      setMessage('Need exactly 8 teams to start the tournament.');
      toast({
        title: 'Error',
        description: 'Need exactly 8 teams to start the tournament.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!firestore) return;

    const tournamentsCollection = collection(firestore, "tournaments");
    addDocumentNonBlocking(tournamentsCollection, {
        started: true,
        teams: federations.map(f => f.id),
        stage: 'quarter-finals',
        createdAt: serverTimestamp(),
    });

    setMessage('Tournament created successfully!');
    toast({
      title: 'Success!',
      description: 'The tournament has been started.',
    });
  };

  const isLoading = isUserLoading || isFederationsLoading;

  if (isLoading) {
    return (
      <AppShell>
        <main className="container mx-auto p-4 md:p-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </AppShell>
    );
  }
  
  if (!user || user.profile?.role !== 'admin') {
      return null; // or a dedicated "access denied" component
  }

  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage the tournament and view registered teams.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List />
                Registered Federations
              </CardTitle>
              <CardDescription>
                A total of {federations?.length || 0} teams have registered for the tournament.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {federations && federations.length > 0 ? (
                 <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {federations.map(fed => (
                        <li key={fed.id} className="p-4 border rounded-lg text-center bg-card-foreground/5">
                            <span className="font-medium">{fed.countryName}</span>
                        </li>
                    ))}
                 </ul>
              ) : (
                <p>No teams have registered yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tournament Control</CardTitle>
              <CardDescription>
                Start the tournament once 8 teams have registered.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
               <Button onClick={handleStartTournament} disabled={federations?.length !== 8} variant="accent">
                <PlayCircle className="mr-2" />
                Start Tournament (8 teams required)
              </Button>
              {message && <p className={`text-sm ${message.includes('Need') ? 'text-destructive' : 'text-primary'}`}>{message}</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
