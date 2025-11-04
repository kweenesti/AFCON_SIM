export type PlayerPosition = 'GK' | 'DF' | 'MD' | 'AT';

export const playerPositions: PlayerPosition[] = ['GK', 'DF', 'MD', 'AT'];

export type PlayerRatings = {
  [key in PlayerPosition]: number;
};

export interface Player {
  id: string;
  name: string;
  naturalPosition: PlayerPosition;
  isCaptain: boolean;
  ratings: PlayerRatings;
}

export interface Team {
  country: string;
  representative: string;
  manager: string;
  squad: Player[];
}
