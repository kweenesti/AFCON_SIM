'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Federation, Player } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generatePlayers, computeTeamRating } from '@/lib/generate-players';
import { SquadTable } from '@/components/team/squad-table';
import {
  useDoc,
  useCollection,
  useMemoFirebase,
  useFirestore,
  setDocumentNonBlocking,
  useUser,
} from '@/firebase';
import { doc, collection, writeBatch, deleteDoc } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Save, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  // State for form inputs
  const [managerName, setManagerName] = useState('');
  
  // State for generated squad
  const [squad, setSquad] = useState<Player[]>([]);
  const [teamRating, setTeamRating] = useState<number | null>(null);

  const federationRef = useMemoFirebase(
    () => (user ? doc(firestore, 'federations', user.uid) : null),
    [firestore, user]
  );
  const { data: federation, isLoading: isFederationLoading } = useDoc<Federation>(federationRef);

  const playersRef = useMemoFirebase(
    () => (user ? collection(firestore, 'federations', user.uid, 'players') : null),
    [firestore, user]
  );
  const { data: existingSquad, isLoading: isSquadLoading } = useCollection<Player>(playersRef);
  
  // Populate form and squad with existing data on load
  useEffect(() => {
    if (federation) {
      setManagerName(federation.managerName);
    }
    if(existingSquad) {
      setSquad(existingSquad);
      setTeamRating(computeTeamRating(existingSquad));
    }
  }, [federation, existingSquad]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleGenerateSquad = () => {
    // This function must only run on the client, which it does because it's an event handler.
    const newSquad = generatePlayers();
    setSquad(newSquad);
    const rating = computeTeamRating(newSquad);
    setTeamRating(rating);
    toast({
      title: 'Squad Generated!',
      description: `New team rating: ${rating}`,
    });
  };

  const handleSaveChanges = async () => {
    if (!user || !federation || !firestore) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
  
    try {
      // 1. Update manager name in federation document
      if (federationRef) {
        const newFederationData = { ...federation, managerName };
        setDocumentNonBlocking(federationRef, newFederationData, { merge: true });
      }
  
      // 2. Overwrite the players subcollection with the new squad
      const batch = writeBatch(firestore);
      const playersCollectionRef = collection(firestore, 'federations', user.uid, 'players');
  
      // First, delete existing players
      // We do this non-blockingly for UI responsiveness, though it's a series of operations
      (existingSquad || []).forEach(player => {
        const playerDocRef = doc(playersCollectionRef, player.id);
        // We can't use a non-blocking delete inside a batch, so we'll just delete directly
        // This is a quick operation so it's okay.
        batch.delete(playerDocRef);
      });
      
      // Then, add the new players
      squad.forEach(player => {
        // Since players from generatePlayers have a client-side UUID, we can use it
        const playerDocRef = doc(playersCollectionRef, player.id);
        batch.set(playerDocRef, { ...player, federationId: user.uid });
      });
  
      await batch.commit();
  
      toast({
        title: 'Success!',
        description: 'Your team information has been saved.',
      });
  
    } catch (error: any) {
      console.error("Save Error:", error);
      const permissionError = new FirestorePermissionError({
        path: `/federations/${user.uid}`,
        operation: 'write',
        requestResourceData: { managerName, squad }
      });
      errorEmitter.emit('permission-error', permissionError);

      toast({
        title: 'Save Failed',
        description: "Could not save your changes. Check permissions.",
        variant: 'destructive',
      });
    }
  };
  
  const isLoading = isUserLoading || isFederationLoading || isSquadLoading;
  
  if (isLoading) {
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

  if (!user || !federation) return null;
   
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
              <CardDescription>Update your manager and generate a new squad for the tournament.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager Name</Label>
                  <Input 
                    id="manager" 
                    placeholder="e.g., José Mourinho"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                  />
                </div>
                <Button onClick={handleGenerateSquad}>
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
                {teamRating && <span className="text-lg font-medium text-muted-foreground">(Rating: {teamRating})</span>}
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
