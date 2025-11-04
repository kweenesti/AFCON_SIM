
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Match, Tournament } from '@/lib/types';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';


export default function MatchesPage() {
    const firestore = useFirestore();

    // Fetch the latest tournament
    const latestTournamentQuery = useMemoFirebase(
      () => query(collection(firestore, 'tournaments'), orderBy('createdAt', 'desc'), limit(1)),
      [firestore]
    );
    const { data: tournaments, isLoading: isTournamentLoading } = useCollection<Tournament>(latestTournamentQuery);
    const tournament = tournaments?.[0];
  
     // Fetch matches for the current tournament
     const matchesQuery = useMemoFirebase(
      () => (tournament ? query(collection(firestore, 'matches'), where('tournamentId', '==', tournament.id), orderBy('createdAt', 'asc')) : null),
      [firestore, tournament]
    );
    const { data: matches, isLoading: areMatchesLoading } = useCollection<Match>(matchesQuery);

    const isLoading = isTournamentLoading || areMatchesLoading;

    return (
        <AppShell>
             <main className="container mx-auto p-4 md:p-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="text-center">
                        <h1 className="font-headline text-3xl font-bold md:text-4xl">
                        Tournament Matches
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                        View the fixtures and results from the tournament.
                        </p>
                    </div>

                    {isLoading && (
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-8 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && (!matches || matches.length === 0) && (
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy />
                                    Quarter-Finals
                                </CardTitle>
                                <CardDescription>No matches have been generated for this tournament yet.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-muted-foreground">Check back soon!</p>
                            </CardContent>
                        </Card>
                    )}

                    {matches && matches.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy />
                                    {matches[0].stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </CardTitle>
                                <CardDescription>Click a match to see more details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                {matches.map(match => (
                                    <li key={match.id}>
                                        <Link href={`/match/${match.id}`} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <span className="font-medium text-lg">{match.homeTeamName}</span>
                                            {match.played ? (
                                                <span className="font-bold text-2xl">{match.homeScore} - {match.awayScore}</span>
                                            ) : (
                                                <span className="text-muted-foreground">vs</span>
                                            )}
                                            <span className="font-medium text-lg">{match.awayTeamName}</span>
                                        </Link>
                                    </li>
                                ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </AppShell>
    )
}
