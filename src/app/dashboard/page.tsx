'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Team } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SquadTable } from '@/components/team/squad-table';
import { Flag, MapPin, User, Shield } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTeam = localStorage.getItem('teamData');
    if (!savedTeam) {
      router.replace('/');
    } else {
      setTeam(JSON.parse(savedTeam));
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!team) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="space-y-8">
        <h1 className="font-headline text-3xl font-bold md:text-4xl">
          {team.country} National Team Dashboard
        </h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Country</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{team.country}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manager</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{team.manager}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Federation Rep.
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{team.representative}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Official Squad List</CardTitle>
          </CardHeader>
          <CardContent>
            <SquadTable squad={team.squad} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
