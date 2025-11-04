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
import { collection, serverTimestamp, query, orderBy, limit, writeBatch } from 'firebase/firestore';
import type { Federation, Tournament, Match } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { List, PlayCircle, Swords } from 'lucide-react';

export default function AdminPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [message, setMessage] = useState('');

  // Fetch all federations
  const federationsRef = useMemoFirebase(
    () => (user?.profile?.role === 'admin' ? collection(firestore, 'federations') : null),
    [firestore, user]
  );
  const { data: federations, isLoading: isFederationsLoading } = useCollection<Federation>(federationsRef);

  // Fetch the latest tournament
  const latestTournamentQuery = useMemoFirebase(
    () => user?.profile?.role === 'admin' ? query(collection(firestore, 'tournaments'), orderBy('createdAt', 'desc'), limit(1)) : null,
    [firestore, user]
  );
  const { data: tournaments, isLoading: isTournamentLoading } = useCollection<Tournament>(latestTournamentQuery);
  const tournament = tournaments?.[0];

   // Fetch matches for the current tournament
   const matchesQuery = useMemoFirebase(
    () => (tournament ? query(collection(firestore, 'matches'), where('tournamentId', '==', tournament.id)) : null),
    [firestore, tournament]
  );
  const { data: matches, isLoading: areMatchesLoading } = useCollection<Match>(matchesQuery);


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

  const generateQuarterFinals = async () => {
    if (!federations || federations.length !== 8 || !tournament || !firestore) {
      setMessage("Need 8 teams and a started tournament to generate matches.");
      return;
    }

    // Simple shuffle
    const shuffled = [...federations].sort(() => Math.random() - 0.5);
    const pairs = [
      shuffled.slice(0, 2),
      shuffled.slice(2, 4),
      shuffled.slice(4, 6),
      shuffled.slice(6, 8)
    ];

    const batch = writeBatch(firestore);
    const matchesCollection = collection(firestore, "matches");

    pairs.forEach(pair => {
      const matchDoc = doc(matchesCollection);
      batch.set(matchDoc, {
        tournamentId: tournament.id,
        stage: "quarter-finals",
        homeTeamId: pair[0].id,
        awayTeamId: pair[1].id,
        homeTeamName: pair[0].countryName,
        awayTeamName: pair[1].countryName,
        played: false,
        createdAt: serverTimestamp()
      });
    });

    await batch.commit();
    setMessage("Quarter-final matches generated!");
    toast({
        title: 'Matches Generated!',
        description: 'Quarter-final fixtures are now set.',
    });
  };

  const isLoading = isUserLoading || isFederationsLoading || isTournamentLoading || areMatchesLoading;

  if (isLoading && !user) {
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

  const hasTournamentStarted = !!tournament;
  const canStartTournament = (federations?.length ?? 0) === 8 && !hasTournamentStarted;
  const canGenerateMatches = hasTournamentStarted && (matches?.length ?? 0) === 0;

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
                Manage the tournament lifecycle.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
               <Button onClick={handleStartTournament} disabled={!canStartTournament} variant="accent">
                <PlayCircle className="mr-2" />
                Start Tournament (8 teams required)
              </Button>
              <Button onClick={generateQuarterFinals} disabled={!canGenerateMatches} variant="accent">
                <Swords className="mr-2" />
                Generate Quarter-Finals
              </Button>
              {message && <p className={`text-sm ${message.includes('Need') ? 'text-destructive' : 'text-primary'}`}>{message}</p>}
            </CardContent>
          </Card>

          {matches && matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {matches.map(match => (
                    <li key={match.id} className="flex justify-between items-center p-3 border rounded-lg">
                       <span className="font-medium">{match.homeTeamName}</span>
                       <span className="text-muted-foreground">vs</span>
                       <span className="font-medium">{match.awayTeamName}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </AppShell>
  );
}
