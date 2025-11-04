'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Federation, Player } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SquadTable } from '@/components/team/squad-table';
import { Flag, User, Shield } from 'lucide-react';
import { useAuth, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const federationRef = useMemoFirebase(
    () => (auth.currentUser ? doc(firestore, 'federations', auth.currentUser.uid) : null),
    [firestore, auth.currentUser]
  );
  const { data: team, isLoading: isTeamLoading } = useDoc<Federation>(federationRef);

  const playersRef = useMemoFirebase(
    () => (auth.currentUser ? collection(firestore, 'federations', auth.currentUser.uid, 'players') : null),
    [firestore, auth.currentUser]
  );
  const { data: squad, isLoading: isSquadLoading } = useCollection<Player>(playersRef);


  useEffect(() => {
    if (!auth.currentUser && !isTeamLoading) {
      router.replace('/');
    }
  }, [auth.currentUser, isTeamLoading, router]);

  const isLoading = isTeamLoading || isSquadLoading;

  if (isLoading) {
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
          {team.countryName} National Team Dashboard
        </h1>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Country</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{team.countryName}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manager</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{team.managerName}</div>
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
              <div className="text-2xl font-bold">{team.representativeName}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Official Squad List</CardTitle>
          </CardHeader>
          <CardContent>
            <SquadTable squad={squad || []} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
