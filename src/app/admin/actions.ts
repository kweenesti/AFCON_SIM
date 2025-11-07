
'use server';
import 'dotenv/config';

import { getFirestore, collection, query, where, getDocs, writeBatch, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, DocumentData, collectionGroup } from 'firebase/firestore';
import { initializeAdminApp } from '@/lib/firebase-admin';
import type { Federation, Match, Player, Team, Tournament } from '@/lib/types';
import { simulateMatch } from '@/lib/simulate-match';
import { getAuth } from 'firebase-admin/auth';
import { generateMatchCommentary } from '@/ai/flows/generate-match-commentary';
import { sendMatchResultEmail } from '@/lib/email';


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

async function getTeamData(firestore: DocumentData, teamId: string): Promise<Team> {
    const teamDoc = await getDoc(doc(firestore, 'federations', teamId));
    if (!teamDoc.exists()) throw new Error(`Team ${teamId} not found`);
    const teamData = teamDoc.data() as Federation;
    const playersSnap = await getDocs(collection(firestore, 'federations', teamId, 'players'));
    const squad = playersSnap.docs.map(d => d.data() as Player);
    return { ...teamData, id: teamDoc.id, squad };
}

export async function simulateMatchAction(matchId: string, homeTeamId: string, awayTeamId: string) {
    try {
        const adminApp = await initializeAdminApp();
        const firestore = getFirestore(adminApp);

        const homeTeam = await getTeamData(firestore, homeTeamId);
        const awayTeam = await getTeamData(firestore, awayTeamId);

        const result = simulateMatch(homeTeam, awayTeam);

        const matchRef = doc(firestore, 'matches', matchId);
        const updatedMatchData = {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerId: result.winnerId,
            played: true,
            playedType: 'simulated' as const,
            goals: result.goals,
        };
        await updateDoc(matchRef, updatedMatchData);
        
        const fullMatchData: Match = {
            id: matchId,
            homeTeamId,
            awayTeamId,
            homeTeamName: homeTeam.countryName,
            awayTeamName: awayTeam.countryName,
            tournamentId: '', 
            stage: 'quarter-finals',
            played: true,
            createdAt: serverTimestamp(),
            ...updatedMatchData
        };

        await sendMatchResultEmail({ recipientEmail: homeTeam.representativeEmail, match: fullMatchData });
        await sendMatchResultEmail({ recipientEmail: awayTeam.representativeEmail, match: fullMatchData });

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

        const matchRef = doc(firestore, 'matches', matchId);
        const updatedMatchData = {
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerId: result.winnerId,
            played: true,
            playedType: 'played' as const,
            goals: result.goals,
            commentary: result.commentary,
        };
        await updateDoc(matchRef, updatedMatchData);
        
        const fullMatchData: Match = {
            id: matchId,
            homeTeamId,
            awayTeamId,
            homeTeamName: homeTeam.countryName,
            awayTeamName: awayTeam.countryName,
            tournamentId: '',
            stage: 'quarter-finals',
            played: true,
            createdAt: serverTimestamp(),
            ...updatedMatchData
        };

        await sendMatchResultEmail({ recipientEmail: homeTeam.representativeEmail, match: fullMatchData });
        await sendMatchResultEmail({ recipientEmail: awayTeam.representativeEmail, match: fullMatchData });

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
        const batch = writeBatch(firestore);

        if (tournamentId) {
            const matchesQuery = query(collection(firestore, 'matches'), where('tournamentId', '==', tournamentId));
            const matchesSnapshot = await getDocs(matchesQuery);
            matchesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
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
