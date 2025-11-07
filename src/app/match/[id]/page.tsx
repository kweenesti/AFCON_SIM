
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Match, Goal } from '@/lib/types';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Shield, Goal as GoalIcon, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MatchPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();
  
  const matchRef = useMemoFirebase(
    () => (id && firestore ? doc(firestore, 'matches', id) : null),
    [firestore, id]
  );
  const { data: match, isLoading, error } = useDoc<Match>(matchRef);

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

  const sortedGoals = match.goals?.sort((a, b) => a.minute - b.minute) || [];

  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <div className="mx-auto max-w-3xl space-y-8">
           <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-4">
                  <CardTitle className="font-headline text-4xl font-bold tracking-tight lg:text-5xl">
                      {match.homeTeamName} vs {match.awayTeamName}
                  </CardTitle>
                </div>
                <p className="text-xl text-muted-foreground">
                    {match.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                {match.played && (
                    <Badge variant={match.playedType === 'played' ? 'default' : 'secondary'}>
                        {match.playedType === 'played' ? 'AI Commentary' : 'Simulated'}
                    </Badge>
                )}
            </div>
            {match.played ? (
                <>
                <Card className="text-center">
                    <CardHeader>
                        <CardDescription>Final Score</CardDescription>
                        <CardTitle className="text-6xl font-bold">
                            {match.homeScore} - {match.awayScore}
                        </CardTitle>
                    </CardHeader>
                    {sortedGoals.length > 0 && (
                      <CardContent>
                          <h3 className="text-lg font-semibold mt-4 mb-2 flex items-center justify-center gap-2">
                              <GoalIcon /> Goal Scorers
                          </h3>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead className="text-center">Minute</TableHead>
                                      <TableHead>Player</TableHead>
                                      <TableHead className="text-right">Team</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {sortedGoals.map((goal: Goal, index: number) => (
                                      <TableRow key={index}>
                                          <TableCell className="text-center font-mono">{goal.minute}'</TableCell>
                                          <TableCell>{goal.playerName}</TableCell>
                                          <TableCell className="text-right">
                                              {goal.teamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </CardContent>
                    )}
                </Card>

                {match.playedType === 'played' && match.commentary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot /> AI Match Commentary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-xs">
                            {match.commentary}
                        </CardContent>
                    </Card>
                )}
                </>

            ) : (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Clock />
                            Match Not Yet Played
                        </CardTitle>
                        <CardDescription>The result will be available after the match is played or simulated by an admin.</CardDescription>
                    </CardHeader>
                </Card>
            )}
        </div>
      </main>
    </AppShell>
  );
}
