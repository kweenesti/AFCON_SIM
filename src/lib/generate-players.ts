
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
      // Higher rating for natural position
      ratings[key] = randInt(50, 100);
    } else {
      // Lower rating for other positions
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
 * Generates a squad of 23 players.
 * It can optionally reuse existing player IDs and names.
 * NOTE: This function uses client-side APIs (`crypto.randomUUID`, `Math.random`) and should only be run on the client.
 * @param existingSquad Optional. An array of existing players to reuse IDs and names from.
 * @returns An array of 23 player objects.
 */
export function generatePlayers(existingSquad?: Player[]): Player[] {
  const squad: Player[] = [];
  const SQUAD_SIZE = 23;

  for (let i = 0; i < SQUAD_SIZE; i++) {
    const existingPlayer = existingSquad ? existingSquad[i] : null;
    
    // Assign a random position for each player
    const naturalPosition = playerPositions[randInt(0, playerPositions.length - 1)];
    const ratings = generateRatings(naturalPosition);

    squad.push({
        id: existingPlayer?.id || crypto.randomUUID(),
        federationId: existingPlayer?.federationId || '', // Will be overwritten
        name: existingPlayer?.name || `Player ${i + 1}`,
        naturalPosition: naturalPosition,
        ...ratings,
        isCaptain: existingPlayer?.isCaptain || false, // Preserve captain status
    });
  }

  // Ensure there is at least one captain if the squad is new
  if (!existingSquad && squad.length > 0) {
      const captainIndex = randInt(0, squad.length - 1);
      squad[captainIndex].isCaptain = true;
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
