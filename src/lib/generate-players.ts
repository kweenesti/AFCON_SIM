
'use client';

import { playerPositions, type PlayerPosition, type Player } from './types';

/**
 * Generates a random integer between min and max (inclusive).
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns A random integer.
 */
export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates ratings for a player based on their natural position.
 * @param naturalPosition The player's natural position.
 * @returns An object with ratings for each position.
 */
const generateRatings = (naturalPosition: PlayerPosition) => {
  const ratings: { [key: string]: number } = {};
  playerPositions.forEach((pos) => {
    const key = `${pos.toLowerCase()}Rating`;
    if (pos === naturalPosition) {
      ratings[key] = randInt(50, 100);
    } else {
      ratings[key] = randInt(0, 50);
    }
  });
  return {
    gkRating: ratings.gkRating,
    dfRating: ratings.dfRating,
    mdRating: ratings.mdRating,
    atRating: ratings.atRating,
  };
};

/**
 * Generates a balanced squad of 23 players with a fixed number of players for each position.
 * It can optionally reuse existing player IDs and names.
 * NOTE: This function uses client-side APIs (`crypto.randomUUID`, `Math.random`) and should only be run on the client.
 * @param existingSquad Optional. An array of existing players to reuse IDs and names from.
 * @returns An array of 23 player objects.
 */
export function generatePlayers(existingSquad?: Player[]): Player[] {
  const squad: Player[] = [];
  const squadComposition = [
    { position: 'GK', count: 3 },
    { position: 'DF', count: 8 },
    { position: 'MD', count: 8 },
    { position: 'AT', count: 4 },
  ];

  let playerIndex = 0;
  squadComposition.forEach(({ position, count }) => {
    for (let i = 0; i < count; i++) {
        const naturalPosition = position as PlayerPosition;
        const ratings = generateRatings(naturalPosition);
        const existingPlayer = existingSquad ? existingSquad[playerIndex] : null;

        squad.push({
            id: existingPlayer?.id || crypto.randomUUID(),
            federationId: existingPlayer?.federationId || '', // Will be overwritten
            name: existingPlayer?.name || `Player ${playerIndex + 1}`,
            naturalPosition: naturalPosition,
            ...ratings,
            isCaptain: existingPlayer?.isCaptain || false, // Preserve captain status
        });
        playerIndex++;
    }
  });

  // Simple shuffle of positions, but IDs and names are stable if existingSquad was provided
  for (let i = squad.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap the generated parts (position, ratings) but keep id, name, etc.
    const tempPos = squad[i].naturalPosition;
    const tempRatings = { gkRating: squad[i].gkRating, dfRating: squad[i].dfRating, mdRating: squad[i].mdRating, atRating: squad[i].atRating };

    squad[i].naturalPosition = squad[j].naturalPosition;
    squad[i].gkRating = squad[j].gkRating;
    squad[i].dfRating = squad[j].dfRating;
    squad[i].mdRating = squad[j].mdRating;
    squad[i].atRating = squad[j].atRating;

    squad[j].naturalPosition = tempPos;
    squad[j].gkRating = tempRatings.gkRating;
    squad[j].dfRating = tempRatings.dfRating;
    squad[j].mdRating = tempRatings.mdRating;
    squad[j].atRating = tempRatings.atRating;
  }

  return squad;
}


/**
 * Computes the average rating of a team based on players' natural positions.
 * @param players An array of player objects.
 * @returns The team's average rating.
 */
export function computeTeamRating(players: any[]) {
  if (!players || players.length === 0) {
    return 0;
  }
  let total = 0;
  players.forEach((p) => {
    const ratingKey = `${p.naturalPosition.toLowerCase()}Rating` as keyof typeof p;
    total += p[ratingKey] || 0;
  });
  return Number((total / players.length).toFixed(2));
}
