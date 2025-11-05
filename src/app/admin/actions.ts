
'use server';

import { getFirestore, collection, query, where, getDocs, writeBatch, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, DocumentData, collectionGroup } from 'firebase/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import type { Federation, Match, Player, Team, Tournament } from '@/lib/types';
import { simulateMatch } from '@/lib/simulate-match';
import { getAuth } from 'firebase-admin/auth';


export async function grantAdminRole(prevState: any, formData: FormData) {
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return { message: 'Email is required.', success: false };
  }

  try {
    const adminApp = await initializeAdminApp();
    const firestore = getFirestore(adminApp);
    const auth = getAuth(adminApp);
    
    const userRecord = await auth.getUserByEmail(email);
    
    if (!userRecord) {
        return { message: `User with email ${email} not found.`, success: false };
    }

    const userDocRef = doc(firestore, 'users', userRecord.uid);
    await updateDoc(userDocRef, { role: 'admin' });

    return { message: `Successfully granted admin role to ${email}.`, success: true };
  } catch (error: any) {
    console.error('Error granting admin role:', error);
    return { message: error.message || 'An unexpected error occurred.', success: false };
  }
}

export async function simulateMatchAction(matchId: string, homeTeamId: string, awayTeamId: string) {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);

        // Fetch home team data
        const homeTeamDoc = await getDoc(doc(firestore, 'federations', homeTeamId));
        if (!homeTeamDoc.exists()) throw new Error(`Home team ${homeTeamId} not found`);
        const homeTeamData = homeTeamDoc.data() as Federation;
        const homePlayersSnap = await getDocs(collection(firestore, 'federations', homeTeamId, 'players'));
        const homeSquad = homePlayersSnap.docs.map(d => d.data() as Player);
        const homeTeam: Team = { ...homeTeamData, id: homeTeamDoc.id, squad: homeSquad };
        
        // Fetch away team data
        const awayTeamDoc = await getDoc(doc(firestore, 'federations', awayTeamId));
        if (!awayTeamDoc.exists()) throw new Error(`Away team ${awayTeamId} not found`);
        const awayTeamData = awayTeamDoc.data() as Federation;
        const awayPlayersSnap = await getDocs(collection(firestore, 'federations', awayTeamId, 'players'));
        const awaySquad = awayPlayersSnap.docs.map(d => d.data() as Player);
        const awayTeam: Team = { ...awayTeamData, id: awayTeamDoc.id, squad: awaySquad };

        // Simulate match
        const result = simulateMatch(homeTeam, awayTeam);

        // Update match document
        const matchRef = doc(firestore, 'matches', matchId);
        await updateDoc(matchRef, {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerId: result.winnerId,
            played: true,
            goals: result.goals,
        });

        return { success: true, message: `Match ${matchId} simulated.`, winnerId: result.winnerId };
    } catch (error: any) {
        console.error('Error simulating match:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function restartTournamentAction(tournamentId: string | undefined): Promise<{ success: boolean; message: string }> {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);
        const batch = writeBatch(firestore);

        // 1. Delete all matches for the tournament
        const matchesQuery = query(collection(firestore, 'matches'), where('tournamentId', '==', tournamentId));
        const matchesSnapshot = await getDocs(matchesQuery);
        matchesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // 2. Delete the tournament document itself
        if (tournamentId) {
             const tournamentRef = doc(firestore, 'tournaments', tournamentId);
             batch.delete(tournamentRef);
        }

        await batch.commit();

        return { success: true, message: 'Tournament has been successfully restarted.' };
    } catch (error: any) {
        console.error('Error restarting tournament:', error);
        return { success: false, message: error.message || 'Could not restart the tournament.' };
    }
}
