
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Federation, Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePlayers, computeTeamRating } from '@/lib/generate-players';
import { SquadTable } from '@/components/team/squad-table';
import {
  useCollection,
  useMemoFirebase,
  useFirestore,
  updateDocumentNonBlocking,
  useUser,
  useDoc,
} from '@/firebase';
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Save, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const federationRef = useMemoFirebase(
    () => (user ? doc(firestore, 'federations', user.uid) : null),
    [firestore, user]
  );
  const { data: federation, isLoading: isFederationLoading } = useDoc<Federation>(federationRef);

  const playersRef = useMemoFirebase(
    () =>
      federation ? collection(firestore, 'federations', federation.id, 'players') : null,
    [firestore, federation]
  );
  const { data: existingSquad, isLoading: isSquadLoading } =
    useCollection<Player>(playersRef);

  // State for form inputs, initialized from props
  const [managerName, setManagerName] = useState('');
  const [squad, setSquad] = useState<Player[]>([]);

  useEffect(() => {
    // Only set the manager name if it's coming from the federation data and hasn't been set yet.
    if (federation && managerName === '') {
      setManagerName(federation.managerName);
    }
  }, [federation, managerName]);

  useEffect(() => {
    // Only set the squad from Firestore if the local squad is empty and the data has arrived.
    if (existingSquad && squad.length === 0) {
      setSquad(existingSquad);
    }
  }, [existingSquad, squad.length]);

  const teamRating = useMemo(() => computeTeamRating(squad), [squad]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleGenerateSquad = () => {
    const newSquad = generatePlayers(squad);
    setSquad(newSquad);
    const rating = computeTeamRating(newSquad);
    toast({
      title: 'Squad Generated!',
      description: `New team rating: ${rating}`,
    });
  };

  const handleSaveChanges = async () => {
    if (!user || !federation || !firestore) {
      toast({
        title: 'Error',
        description: 'You must be logged in and part of a federation.',
        variant: 'destructive',
      });
      return;
    }

    const federationRef = doc(firestore, 'federations', federation.id);
    
    // 1. Update manager name in federation document
    if (managerName !== federation.managerName) {
        updateDocumentNonBlocking(federationRef, { managerName });
    }

    // 2. Overwrite the players subcollection with the new squad
    const batch = writeBatch(firestore);
    const playersCollectionRef = collection(
      firestore,
      'federations',
      federation.id,
      'players'
    );

    // First, retrieve all existing player documents to delete them
    const existingPlayersSnapshot = await getDocs(playersCollectionRef);
    existingPlayersSnapshot.forEach(playerDoc => {
        batch.delete(playerDoc.ref);
    });

    // Set/overwrite each player document in the new squad
    squad.forEach((player) => {
      const playerDocRef = doc(playersCollectionRef, player.id);
      batch.set(playerDocRef, { ...player, federationId: federation.id });
    });

    await batch.commit();

    toast({
      title: 'Success!',
      description: 'Your team information has been saved.',
    });
  };

  const isLoading = isUserLoading || isFederationLoading || (federation && isSquadLoading);

  if (isLoading && !federation) {
    return (
      <AppShell>
        <div className="container mx-auto p-4 space-y-8">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!user || (!federation && !isFederationLoading)) {
     // This case handles when the query has run and returned no federations.
     // It could mean the federation document hasn't been created yet.
     // You might want to redirect to a setup page or show a specific message.
     // For now, we'll just prevent a crash.
     return (
        <AppShell>
            <main className="container mx-auto p-4 md:p-8">
                 <p>Federation data not found. Please re-register or contact support.</p>
            </main>
        </AppShell>
     )
  }

  if (!federation) return null;

  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <h1 className="font-headline text-3xl font-bold md:text-4xl">
            {federation.countryName} National Team Dashboard
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Update your manager and generate a new squad for the tournament.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager Name</Label>
                  <Input
                    id="manager"
                    placeholder="e.g., José Mourinho"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                  />
                </div>
                <Button onClick={handleGenerateSquad} variant="accent">
                  <Sparkles className="mr-2" />
                  Generate New Squad
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={handleSaveChanges}>
                  <Save className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck />
                Official Squad List
                {teamRating > 0 && (
                  <span className="text-lg font-medium text-muted-foreground">
                    (Rating: {teamRating})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SquadTable squad={squad} />
            </CardContent>
          </Card>
        </div>
      </main>
    </AppShell>
  );
}
