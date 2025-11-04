
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
 * Generates a squad of 23 players with random names, positions, and ratings.
 * NOTE: This function uses client-side APIs (`crypto.randomUUID`, `Math.random`) and should only be run on the client.
 * @returns An array of 23 player objects.
 */
export function generatePlayers() {
  const arr: any[] = [];
  for (let i = 0; i < 23; i++) {
    const naturalPosition =
      playerPositions[Math.floor(Math.random() * playerPositions.length)];
    const ratings = generateRatings(naturalPosition);
    arr.push({
      id: crypto.randomUUID(),
      name: `Player ${i + 1}`,
      naturalPosition: naturalPosition,
      ...ratings,
      isCaptain: false,
    });
  }
  return arr;
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
