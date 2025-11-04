export type PlayerPosition = 'GK' | 'DF' | 'MD' | 'AT';

export const playerPositions: PlayerPosition[] = ['GK', 'DF', 'MD', 'AT'];

export interface Player {
  id: string;
  federationId: string;
  name: string;
  naturalPosition: PlayerPosition;
  gkRating: number;
  dfRating: number;
  mdRating: number;
  atRating: number;
  isCaptain: boolean;
}

export interface Federation {
  id: string;
  representativeName: string;
  representativeEmail: string;
  countryId: string;
  countryName: string;
  managerName: string;
}

export interface Team extends Federation {
  squad: Player[];
}
