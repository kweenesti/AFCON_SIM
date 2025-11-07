
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
      () => (firestore ? query(collection(firestore, 'tournaments'), orderBy('createdAt', 'desc'), limit(1)) : null),
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

    const quarterFinals = useMemo(() => matches?.filter(m => m.stage === 'quarter-finals') || [], [matches]);
    const semiFinals = useMemo(() => matches?.filter(m => m.stage === 'semi-finals') || [], [matches]);
    const final = useMemo(() => matches?.filter(m => m.stage === 'final') || [], [matches]);

    const renderMatchList = (matchList: Match[], title: string) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy />
                    {title}
                </CardTitle>
                {matchList.length === 0 && <CardDescription>Matches have not been generated for this stage yet.</CardDescription>}
            </CardHeader>
            {matchList.length > 0 && (
                <CardContent>
                    <ul className="space-y-2">
                        {matchList.map(match => (
                            <li key={match.id}>
                                <Link href={`/match/${match.id}`} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <span className="font-medium text-lg text-right w-2/5 truncate">{match.homeTeamName}</span>
                                    {match.played ? (
                                        <span className="font-bold text-2xl">{match.homeScore} - {match.awayScore}</span>
                                    ) : (
                                        <span className="text-muted-foreground">vs</span>
                                    )}
                                    <span className="font-medium text-lg text-left w-2/5 truncate">{match.awayTeamName}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            )}
        </Card>
    );

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
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-8 w-1/3" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <Skeleton className="h-8 w-1/3" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {!isLoading && !tournament && (
                         <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy />
                                    No Tournament Found
                                </CardTitle>
                                <CardDescription>An administrator has not started a tournament yet.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-center text-muted-foreground">Check back soon!</p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && tournament && (
                       <div className="space-y-6">
                            {renderMatchList(final, 'Final')}
                            {renderMatchList(semiFinals, 'Semi-Finals')}
                            {renderMatchList(quarterFinals, 'Quarter-Finals')}
                       </div>
                    )}
                </div>
            </main>
        </AppShell>
    )
}
