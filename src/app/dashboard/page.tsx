'use client';

import { useEffect, useMemo, useTransition } from 'react';
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
  useUser,
  useDoc,
  updateDocumentNonBlocking,
} from '@/firebase';
import { doc, collection, writeBatch, getDocs } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Save, ShieldCheck } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';

export default function DashboardPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [isSaving, startSaving] = useTransition();
  const [isGenerating, startGenerating] = useTransition();

  const federationRef = useMemoFirebase(
    () => (user?.uid ? doc(firestore, 'federations', user.uid) : null),
    [firestore, user?.uid]
  );
  const { data: federation, isLoading: isFederationLoading } =
    useDoc<Federation>(federationRef);

  const playersRef = useMemoFirebase(
    () =>
      federation?.id
        ? collection(firestore, 'federations', federation.id, 'players')
        : null,
    [firestore, federation?.id]
  );
  const { data: squad, isLoading: isSquadLoading } =
    useCollection<Player>(playersRef);

  const formMethods = useForm({
    values: {
      managerName: federation?.managerName || '',
    },
  });

  const { register } = formMethods;

  const teamRating = useMemo(() => computeTeamRating(squad || []), [squad]);

  const handleGenerateSquad = () => {
    startGenerating(async () => {
      if (!firestore || !federation || !squad) return;

      const newSquad = generatePlayers(squad);
      const batch = writeBatch(firestore);
      const playersCollectionRef = collection(
        firestore,
        'federations',
        federation.id,
        'players'
      );

      const existingPlayersSnapshot = await getDocs(playersCollectionRef);
      existingPlayersSnapshot.forEach((playerDoc) => {
        batch.delete(playerDoc.ref);
      });

      newSquad.forEach((player) => {
        const playerDocRef = doc(playersCollectionRef);
        batch.set(playerDocRef, { ...player, id: playerDocRef.id });
      });

      try {
        await batch.commit();
        const rating = computeTeamRating(newSquad);
        toast({
          title: 'Squad Generated!',
          description: `New team rating: ${rating}`,
        });
      } catch (error: any) {
        toast({
          title: 'Error Generating Squad',
          description: error.message || 'Could not generate a new squad.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleSaveChanges = (formData: { managerName: string }) => {
    startSaving(() => {
      if (!user || !federation || !firestore) {
        toast({
          title: 'Error',
          description: 'You must be logged in and part of a federation.',
          variant: 'destructive',
        });
        return;
      }

      const federationDocRef = doc(firestore, 'federations', federation.id);
      
      updateDocumentNonBlocking(federationDocRef, { managerName: formData.managerName });

      toast({
        title: 'Success!',
        description: 'Your team information has been saved.',
      });
    });
  };
  
  // While user data is loading, or if the user is an admin (and will be redirected by AppShell), show a loader.
  if (isUserLoading || user?.profile?.role === 'admin') {
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

  // After loading, if there's no user, or no federation data for a non-admin user
  if (!user || (!federation && !isFederationLoading)) {
    return (
      <AppShell>
        <main className="container mx-auto p-4 md:p-8">
           <Card>
            <CardHeader>
                <CardTitle>Federation Data Not Found</CardTitle>
                <CardDescription>Your team data could not be found. If you have not registered your team yet, please do so from the homepage.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.push('/')}>Go to Homepage</Button>
            </CardContent>
           </Card>
        </main>
      </AppShell>
    );
  }
  
  // Prevents rendering flickering for federation users while their data loads.
  if (isFederationLoading || !federation) {
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


  return (
    <AppShell>
      <main className="container mx-auto p-4 md:p-8">
        <FormProvider {...formMethods}>
          <form
            key={federation.id} // Add key to ensure form re-initializes on data load
            onSubmit={formMethods.handleSubmit(handleSaveChanges)}
            className="space-y-8"
          >
            <h1 className="font-headline text-3xl font-bold md:text-4xl">
              {federation.countryName} National Team Dashboard
            </h1>

            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Update your manager and generate a new squad for the
                  tournament.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager Name</Label>
                    <Input
                      id="manager"
                      placeholder="e.g., José Mourinho"
                      {...register('managerName')}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerateSquad}
                    variant="secondary"
                    disabled={isGenerating}
                  >
                    <Sparkles className="mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate New Squad'}
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="submit" disabled={isSaving}>
                    <Save className="mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
                <SquadTable squad={squad || []} />
              </CardContent>
            </Card>
          </form>
        </FormProvider>
      </main>
    </AppShell>
  );
}
