'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, query, orderBy, limit, writeBatch, doc, where } from 'firebase/firestore';
import type { Federation, Tournament, Match } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { List, PlayCircle, Swords, Zap, UserCog, RefreshCw, Bot } from 'lucide-react';
import { simulateMatchAction, restartTournamentAction, playMatchAction } from './actions';
import { AdminRoleForm } from './admin-role-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isUserLoading && user?.profile?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const federationsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'federations') : null),
    [firestore]
  );
  const { data: federations, isLoading: isFederationsLoading } = useCollection<Federation>(federationsRef);

  const latestTournamentQuery = useMemoFirebase(
    () => user?.profile?.role === 'admin' && firestore ? query(collection(firestore, 'tournaments'), orderBy('createdAt', 'desc'), limit(1)) : null,
    [firestore, user?.profile?.role]
  );
  const { data: tournaments, isLoading: isTournamentLoading, error: tournamentError } = useCollection<Tournament>(latestTournamentQuery);
  const tournament = tournaments?.[0];

   const matchesQuery = useMemoFirebase(
    () => (tournament && firestore ? query(collection(firestore, 'matches'), where('tournamentId', '==', tournament.id), orderBy('createdAt', 'asc')) : null),
    [firestore, tournament]
  );
  const { data: matches, isLoading: areMatchesLoading } = useCollection<Match>(matchesQuery);


  const handleStartTournament = async () => {
    if (!federations || !firestore) return;

    if (federations.length < 8) {
      setMessage('Need at least 8 teams to start the tournament.');
      toast({
        title: 'Error',
        description: 'Need at least 8 teams to start the tournament.',
        variant: 'destructive',
      });
      return;
    }
    
    const batch = writeBatch(firestore);
    const tournamentDocRef = doc(collection(firestore, 'tournaments'));
    
    const newTournament: Tournament = {
        id: tournamentDocRef.id,
        started: true,
        teams: federations.map(f => f.id),
        stage: 'quarter-finals',
        createdAt: serverTimestamp(),
    };
    
    batch.set(tournamentDocRef, newTournament);

    await batch.commit();

    setMessage('Tournament created successfully!');
    toast({
      title: 'Success!',
      description: 'The tournament has been started.',
    });
  };

  const generateQuarterFinals = async () => {
    if (!federations || federations.length < 8 || !tournament || !firestore) {
      setMessage("Need 8 teams and a started tournament to generate matches.");
      return;
    }

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
      const matchDocRef = doc(matchesCollection);
      batch.set(matchDocRef, {
        id: matchDocRef.id,
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
  
    const generateSemiFinals = async () => {
        if (!matches || !tournament || !firestore || !federations) return;
    
        const qfMatches = matches.filter(m => m.stage === 'quarter-finals');
        if (qfMatches.length !== 4) {
            setMessage("4 quarter-final matches must be generated first.");
            toast({ title: "Error", description: "4 quarter-final matches must be generated first.", variant: "destructive" });
            return;
        }

        const playedQf = qfMatches.filter(m => m.played);
        if (playedQf.length !== 4) {
            setMessage("All 4 quarter-final matches must be played first.");
            toast({ title: "Error", description: "All 4 quarter-final matches must be played first.", variant: "destructive" });
            return;
        }
    
        const winners = playedQf.map(m => {
            const winnerId = m.winnerId;
            return federations.find(f => f.id === winnerId);
        }).filter((f): f is Federation => !!f); 
    
        if (winners.length !== 4) {
            setMessage("Could not determine 4 unique winners from the matches played.");
            toast({ title: "Error", description: "Could not determine 4 unique winners.", variant: "destructive" });
            return;
        }
    
        const shuffled = [...winners].sort(() => Math.random() - 0.5);
        const pairs = [shuffled.slice(0, 2), shuffled.slice(2, 4)];
    
        const batch = writeBatch(firestore);
        const matchesCollection = collection(firestore, "matches");
    
        pairs.forEach(pair => {
            const matchDocRef = doc(matchesCollection);
            batch.set(matchDocRef, {
                id: matchDocRef.id,
                tournamentId: tournament.id,
                stage: "semi-finals",
                homeTeamId: pair[0].id,
                awayTeamId: pair[1].id,
                homeTeamName: pair[0].countryName,
                awayTeamName: pair[1].countryName,
                played: false,
                createdAt: serverTimestamp()
            });
        });
    
        await batch.commit();
        setMessage("Semi-final matches generated!");
        toast({ title: "Semi-Finals Generated!", description: "The semi-final fixtures are now set." });
    };

    const generateFinal = async () => {
        if (!matches || !tournament || !firestore || !federations) return;
    
        const sfMatches = matches.filter(m => m.stage === 'semi-finals');
        if (sfMatches.length !== 2) {
            setMessage("2 semi-final matches must be generated first.");
            toast({ title: "Error", description: "2 semi-final matches must be generated first.", variant: "destructive" });
            return;
        }

        const playedSf = sfMatches.filter(m => m.played);
        if (playedSf.length !== 2) {
            setMessage("All 2 semi-final matches must be played first.");
            toast({ title: "Error", description: "All 2 semi-final matches must be played first.", variant: "destructive" });
            return;
        }
    
        const winners = playedSf.map(m => {
            return federations.find(f => f.id === m.winnerId);
        }).filter((f): f is Federation => !!f);
    
        if (winners.length !== 2) {
            setMessage("Could not determine 2 unique winners from the semi-finals.");
            toast({ title: "Error", description: "Could not determine 2 unique winners.", variant: "destructive" });
            return;
        }
    
        const batch = writeBatch(firestore);
        const matchesCollection = collection(firestore, "matches");
        const matchDocRef = doc(matchesCollection);

        batch.set(matchDocRef, {
            id: matchDocRef.id,
            tournamentId: tournament.id,
            stage: "final",
            homeTeamId: winners[0].id,
            awayTeamId: winners[1].id,
            homeTeamName: winners[0].countryName,
            awayTeamName: winners[1].countryName,
            played: false,
            createdAt: serverTimestamp()
        });
    
        await batch.commit();
        setMessage("The Final is set!");
        toast({ title: "Final Generated!", description: "The final match is now set." });
    };


  const handleSimulateMatch = (match: Match) => {
    startTransition(async () => {
      const result = await simulateMatchAction(match.id, match.homeTeamId, match.awayTeamId);
       if (result.success) {
        toast({
          title: 'Match Simulated!',
          description: `The result for ${match.homeTeamName} vs ${match.awayTeamName} is in.`,
        });
      } else {
        toast({
          title: 'Simulation Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handlePlayMatch = (match: Match) => {
    startTransition(async () => {
      const result = await playMatchAction(match.id, match.homeTeamId, match.awayTeamId);
      if (result.success) {
        toast({
          title: 'Match Played!',
          description: `Commentary generated for ${match.homeTeamName} vs ${match.awayTeamName}.`,
        });
      } else {
        toast({
          title: 'Play Match Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };


  const handleRestartTournament = () => {
    startTransition(async () => {
        const result = await restartTournamentAction(tournament?.id);
        if (result.success) {
            toast({
                title: 'Tournament Restarted',
                description: 'All matches have been cleared.',
            });
            setMessage('Tournament has been restarted.');
        } else {
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            });
            setMessage(result.message);
        }
    });
  };

  if (isUserLoading) {
    return (
      <AppShell>
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton className="h-64 w-full max-w-4xl" />
        </div>
      </AppShell>
    );
  }

  if (user?.profile?.role !== 'admin') {
    // This check should be sufficient if useUser is reliable.
    // The redirect will happen in the useEffect hook.
    return (
       <AppShell>
        <div className="flex h-full w-full items-center justify-center">
           <p>Redirecting...</p>
        </div>
      </AppShell>
    );
  }
  
  const hasTournamentStarted = !!tournament;
  const canStartTournament = (federations?.length || 0) >= 8 && !hasTournamentStarted;
  
  const quarterFinals = matches?.filter(m => m.stage === 'quarter-finals') || [];
  const semiFinals = matches?.filter(m => m.stage === 'semi-finals') || [];
  const final = matches?.filter(m => m.stage === 'final') || [];
  
  const canGenerateMatches = hasTournamentStarted && quarterFinals.length === 0;
  const canGenerateSemis = quarterFinals.length === 4 && quarterFinals.every(m => m.played) && semiFinals.length === 0;
  const canGenerateFinal = semiFinals.length === 2 && semiFinals.every(m => m.played) && final.length === 0;

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
                <UserCog />
                Admin Actions
              </CardTitle>
              <CardDescription>
                Grant administrative privileges to other users.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AdminRoleForm />
            </CardContent>
          </Card>

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
              {isFederationsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : federations && federations.length > 0 ? (
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
                Manage the tournament lifecycle. You need at least 8 teams to start.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleStartTournament} disabled={!canStartTournament || isPending} variant="secondary">
                  <PlayCircle className="mr-2" />
                  Start Tournament
                </Button>
                <Button onClick={generateQuarterFinals} disabled={!canGenerateMatches || isPending} variant="secondary">
                  <Swords className="mr-2" />
                  Generate Quarter-Finals
                </Button>
                <Button onClick={generateSemiFinals} disabled={!canGenerateSemis || isPending} variant="secondary">
                  <Swords className="mr-2" />
                  Generate Semi-Finals
                </Button>
                <Button onClick={generateFinal} disabled={!canGenerateFinal || isPending} variant="secondary">
                  <Swords className="mr-2" />
                  Generate Final
                </Button>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!hasTournamentStarted || isPending}>
                      <RefreshCw className="mr-2" />
                      Restart Tournament
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all current tournament matches and reset the tournament state.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRestartTournament}>
                        Confirm Restart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {message && <p className={`mt-4 text-sm ${message.includes('Need') || message.includes('Could not') ? 'text-destructive' : 'text-primary'}`}>{message}</p>}
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
                    <li key={match.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                       <Link href={`/match/${match.id}`} className="flex-1 grid grid-cols-3 items-center text-center">
                         <span className="font-medium text-right">{match.homeTeamName}</span>
                          {match.played ? (
                            <span className="font-bold text-lg">{match.homeScore} - {match.awayScore}</span>
                          ) : (
                            <span className="text-muted-foreground">vs</span>
                          )}
                         <span className="font-medium text-left">{match.awayTeamName}</span>
                       </Link>
                       {!match.played && (
                        <div className="flex gap-2 ml-4">
                         <Button size="sm" variant="outline" onClick={() => handleSimulateMatch(match)} disabled={isPending}>
                           <Zap className="mr-2 h-4 w-4" />
                           {isPending ? '...' : 'Simulate'}
                         </Button>
                          <Button size="sm" variant="secondary" onClick={() => handlePlayMatch(match)} disabled={isPending}>
                           <Bot className="mr-2 h-4 w-4" />
                           {isPending ? '...' : 'Play'}
                         </Button>
                        </div>
                       )}
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
