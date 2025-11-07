
'use server';
import 'dotenv/config';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import type { Federation, Player, Team } from '@/lib/types';
import { simulateMatch } from '@/lib/simulate-match';
import { getAuth } from 'firebase-admin/auth';
import { generateMatchCommentary } from '@/ai/flows/generate-match-commentary';


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

    const userDocRef = firestore.collection('users').doc(userRecord.uid);
    await userDocRef.update({ role: 'admin' });

    return { message: `Successfully granted admin role to ${email}.`, success: true };
  } catch (error: any) {
    console.error('Error granting admin role:', error);
    return { message: error.message || 'An unexpected error occurred.', success: false };
  }
}

async function getTeamData(firestore: FirebaseFirestore.Firestore, teamId: string): Promise<Team> {
    const teamDocRef = firestore.collection('federations').doc(teamId);
    const teamDoc = await teamDocRef.get();
    
    if (!teamDoc.exists) throw new Error(`Team ${teamId} not found`);
    
    const teamData = teamDoc.data() as Federation;
    
    const playersSnap = await teamDocRef.collection('players').get();
    const squad = playersSnap.docs.map(d => {
        const playerData = d.data();
        // Ensure the federationId is correctly mapped
        return {
            ...playerData,
            federationId: teamId, // Explicitly set the correct federationId
        } as Player;
    });
    
    return { ...teamData, id: teamDoc.id, squad };
}

export async function simulateMatchAction(matchId: string, homeTeamId: string, awayTeamId: string) {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);

        const homeTeam = await getTeamData(firestore, homeTeamId);
        const awayTeam = await getTeamData(firestore, awayTeamId);

        const result = simulateMatch(homeTeam, awayTeam);

        const matchRef = firestore.collection('matches').doc(matchId);
        const updatedMatchData = {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerId: result.winnerId,
            played: true,
            playedType: 'simulated' as const,
            goals: result.goals,
        };
        await matchRef.update(updatedMatchData);
        
        return { success: true, message: `Match ${matchId} simulated.`, winnerId: result.winnerId };
    } catch (error: any) {
        console.error('Error simulating match:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

export async function playMatchAction(matchId: string, homeTeamId: string, awayTeamId: string) {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);

        const homeTeam = await getTeamData(firestore, homeTeamId);
        const awayTeam = await getTeamData(firestore, awayTeamId);
        
        const result = await generateMatchCommentary({ homeTeam, awayTeam });
        
        if (!result) {
            throw new Error('AI failed to generate match commentary.');
        }

        const matchRef = firestore.collection('matches').doc(matchId);
        const updatedMatchData = {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerId: result.winnerId,
            played: true,
            playedType: 'played' as const,
            goals: result.goals,
            commentary: result.commentary,
        };
        await matchRef.update(updatedMatchData);

        return { success: true, message: `Match ${matchId} played with commentary.` };
    } catch (error: any) {
        console.error('Error playing match:', error);
        return { success: false, message: error.message || 'An unexpected error occurred while playing the match.' };
    }
}

export async function restartTournamentAction(tournamentId: string | undefined): Promise<{ success: boolean; message: string }> {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);
        const batch = firestore.batch();

        if (tournamentId) {
            const matchesQuery = firestore.collection('matches').where('tournamentId', '==', tournamentId);
            const matchesSnapshot = await matchesQuery.get();
            matchesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        if (tournamentId) {
             const tournamentRef = firestore.collection('tournaments').doc(tournamentId);
             batch.delete(tournamentRef);
        }

        // Also clear all federations
        const federationsQuery = firestore.collection('federations');
        const federationsSnapshot = await federationsQuery.get();
        for (const doc of federationsSnapshot.docs) {
            const playersRef = doc.ref.collection('players');
            const playersSnapshot = await playersRef.get();
            playersSnapshot.forEach(playerDoc => {
                batch.delete(playerDoc.ref);
            });
            batch.delete(doc.ref);
        }

        await batch.commit();

        return { success: true, message: 'Tournament has been successfully restarted.' };
    } catch (error: any) {
        console.error('Error restarting tournament:', error);
        return { success: false, message: error.message || 'Could not restart the tournament.' };
    }
}
