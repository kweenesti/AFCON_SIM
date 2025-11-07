
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Match, Tournament } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function BracketNode({ match }: { match: Match | undefined }) {
  if (!match) {
    return (
      <div className="flex items-center justify-center p-2 text-xs text-muted-foreground border border-dashed rounded-lg h-16">
        TBD
      </div>
    );
  }
  return (
    <Link href={`/match/${match.id}`} className="block p-2 border rounded-lg hover:bg-muted/50 transition-colors h-16">
      <div className="flex justify-between items-center text-sm">
        <span>{match.homeTeamName}</span>
        <span className="font-bold">{match.played ? match.homeScore : '-'}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span>{match.awayTeamName}</span>
        <span className="font-bold">{match.played ? match.awayScore : '-'}</span>
      </div>
       {match.played && match.winnerId === match.homeTeamId && <div className="font-bold text-primary text-xs">{match.homeTeamName} wins</div>}
       {match.played && match.winnerId === match.awayTeamId && <div className="font-bold text-primary text-xs">{match.awayTeamName} wins</div>}
    </Link>
  );
}


export default function TournamentPage() {
    const firestore = useFirestore();

    const latestTournamentQuery = useMemoFirebase(
      () => (firestore ? query(collection(firestore, 'tournaments'), orderBy('createdAt', 'desc'), limit(1)) : null),
      [firestore]
    );
    const { data: tournaments, isLoading: isTournamentLoading } = useCollection<Tournament>(latestTournamentQuery);
    const tournament = tournaments?.[0];
  
    const allMatchesQuery = useMemoFirebase(
      () => (tournament && firestore ? query(collection(firestore, 'matches'), orderBy('createdAt', 'asc')) : null),
      [firestore, tournament]
    );
    const { data: allMatches, isLoading: areMatchesLoading } = useCollection<Match>(allMatchesQuery);

    const matches = useMemo(() => {
        if (!allMatches || !tournament) return [];
        return allMatches.filter(m => m.tournamentId === tournament.id);
    }, [allMatches, tournament]);

    const isLoading = isTournamentLoading || areMatchesLoading;

    const quarterFinals = useMemo(() => matches?.filter(m => m.stage === 'quarter-finals') || [], [matches]);
    const semiFinals = useMemo(() => matches?.filter(m => m.stage === 'semi-finals') || [], [matches]);
    const final = useMemo(() => matches?.find(m => m.stage === 'final'), [matches]);

    const champion = useMemo(() => {
        if (final?.played) {
            return final.winnerId === final.homeTeamId ? final.homeTeamName : final.awayTeamName;
        }
        return null;
    }, [final]);

    const topScorers = useMemo(() => {
        if (!matches) return [];
        const scorerMap = new Map<string, { count: number; teamName: string }>();

        matches.forEach(match => {
            if(match.goals) {
                match.goals.forEach(goal => {
                    const teamName = goal.teamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName;
                    const existing = scorerMap.get(goal.playerName) || { count: 0, teamName: teamName };
                    scorerMap.set(goal.playerName, { ...existing, count: existing.count + 1 });
                });
            }
        });
        
        return Array.from(scorerMap.entries())
            .map(([playerName, data]) => ({
                playerName,
                goals: data.count,
                teamName: data.teamName,
            }))
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 10);

    }, [matches]);


    return (
        <main className="container mx-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
              <div className="text-center">
                  <h1 className="font-headline text-3xl font-bold md:text-4xl">
                      Tournament Bracket
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                      Follow the journey to crown the champion of Africa.
                  </p>
              </div>

              {isLoading && <Skeleton className="h-[500px] w-full" />}
              
              {!isLoading && !tournament && (
                    <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Trophy />
                              No Tournament Found
                          </CardTitle>
                          <CardDescription>An administrator has not started a tournament yet.</CardDescription>
                      </CardHeader>
                  </Card>
              )}

              {!isLoading && tournament && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Bracket Column */}
                      <div className="lg:col-span-2">
                          <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2"><Trophy /> Knockout Stage</CardTitle>
                              </CardHeader>
                              <CardContent className="flex justify-between items-center gap-4">
                                  {/* Quarter-Finals */}
                                  <div className="flex flex-col gap-4 w-full">
                                      <h3 className="font-semibold text-center text-muted-foreground">Quarter-Finals</h3>
                                      <BracketNode match={quarterFinals[0]} />
                                      <BracketNode match={quarterFinals[1]} />
                                      <BracketNode match={quarterFinals[2]} />
                                      <BracketNode match={quarterFinals[3]} />
                                  </div>
                                  {/* Semi-Finals */}
                                  <div className="flex flex-col gap-20 w-full">
                                        <h3 className="font-semibold text-center text-muted-foreground">Semi-Finals</h3>
                                      <BracketNode match={semiFinals[0]} />
                                      <BracketNode match={semiFinals[1]} />
                                  </div>
                                  {/* Final */}
                                  <div className="flex flex-col justify-center w-full">
                                      <h3 className="font-semibold text-center text-muted-foreground">Final</h3>
                                      <BracketNode match={final} />
                                  </div>
                              </CardContent>
                          </Card>
                      </div>
                      
                      {/* Champion & Top Scorers Column */}
                      <div className="space-y-8">
                          {champion && (
                                <Card className="bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
                                  <CardHeader className="text-center">
                                      <CardTitle className="text-2xl">CHAMPION</CardTitle>
                                      <CardDescription className="text-amber-100">Congratulations to the winner!</CardDescription>
                                  </CardHeader>
                                  <CardContent className="text-center">
                                      <p className="text-4xl font-bold">{champion}</p>
                                  </CardContent>
                              </Card>
                          )}

                          <Card>
                              <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                      Top Goal Scorers
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                              <TableHead>Player</TableHead>
                                              <TableHead>Team</TableHead>
                                              <TableHead className="text-right">Goals</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {topScorers.map(scorer => (
                                              <TableRow key={scorer.playerName}>
                                                  <TableCell>{scorer.playerName}</TableCell>
                                                  <TableCell>{scorer.teamName}</TableCell>
                                                  <TableCell className="text-right font-bold">{scorer.goals}</TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>
                                  </Table>
                              </CardContent>
                          </Card>
                      </div>

                  </div>
              )}
          </div>
        </main>
    );
}
