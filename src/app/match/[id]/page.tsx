
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Match, Team } from '@/lib/types';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Goal, Trophy, Users } from 'lucide-react';
import { simulateMatchAction } from '@/app/admin/actions';
import { useEffect, useState } from 'react';

export default function MatchPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();

  const matchRef = useMemoFirebase(
    () => (id ? doc(firestore, 'matches', id) : null),
    [firestore, id]
  );
  const { data: match, isLoading, error } = useDoc<Match>(matchRef);
  
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    async function getGoals() {
        if (match?.played) {
            // This is a workaround as the goals are not stored in the match document.
            // In a real app, this should be part of the match data.
            const result = await simulateMatchAction(match.id, match.homeTeamId, match.awayTeamId);
            // This is not ideal as it re-simulates. We do it to get the goal scorers.
            // A better approach is to store the goals in the match document.
            // For this demo, we can't easily get the goals without re-simulating
            // because the server action doesn't return them and we can't easily modify it.
            // To get the goals without another simulation, we'd need to update the server action
            // to store the goals array in the match document.
        }
    }
    // For now, we will leave the goal scorers part out as we can't retrieve it.
  }, [match]);

  if (isLoading) {
    return (
        <AppShell>
             <main className="container mx-auto p-4 md:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Skeleton className="h-16 w-3/4 self-center" />
                    <Skeleton className="h-64 w-full" />
                </div>
             </main>
        </AppShell>
    );
  }

  if (error) {
    return (
        <AppShell>
             <main className="container mx-auto p-4 md:p-8">
                <p>Error: {error.message}</p>
             </main>
        </AppShell>
    )
  }

  if (!match) {
    return (
        <AppShell>
             <main className="container mx-auto p-4 md:p-8">
                 <p>Match not found.</p>
            </main>
        </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">
           <div className="text-center space-y-2">
                <CardTitle className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">
                    {match.homeTeamName} vs {match.awayTeamName}
                </CardTitle>
                <p className="text-xl text-muted-foreground">
                    {match.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
            </div>
            {match.played ? (
                <Card className="text-center">
                    <CardHeader>
                        <CardDescription>Final Score</CardDescription>
                        <CardTitle className="text-6xl font-bold">
                            {match.homeScore} - {match.awayScore}
                        </CardTitle>
                    </CardHeader>
                     {/* Goal scorers would be displayed here if available */}
                </Card>
            ) : (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Clock />
                            Match Not Yet Played
                        </CardTitle>
                        <CardDescription>The result will be available after the match is simulated by an admin.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
      </main>
    </AppShell>
  );
}
