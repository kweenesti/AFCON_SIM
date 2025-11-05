
'use client';

import { playerPositions, type PlayerPosition } from './types';

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
 * NOTE: This function uses client-side APIs (`crypto.randomUUID`, `Math.random`) and should only be run on the client.
 * @returns An array of 23 player objects.
 */
export function generatePlayers() {
  const squad: any[] = [];
  const squadComposition = [
    { position: 'GK', count: 3 },
    { position: 'DF', count: 8 },
    { position: 'MD', count: 8 },
    { position: 'AT', count: 4 },
  ];

  let playerNumber = 1;
  squadComposition.forEach(comp => {
    for (let i = 0; i < comp.count; i++) {
        const naturalPosition = comp.position as PlayerPosition;
        const ratings = generateRatings(naturalPosition);
        squad.push({
            id: crypto.randomUUID(),
            name: `Player ${playerNumber++}`,
            naturalPosition: naturalPosition,
            ...ratings,
            isCaptain: false,
        });
    }
  });

  // Shuffle the squad to randomize player order in the list
  for (let i = squad.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [squad[i], squad[j]] = [squad[j], squad[i]];
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
