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

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'federation';
}

export interface Tournament {
  id: string;
  started: boolean;
  teams: string[];
  stage: 'quarter-finals' | 'semi-finals' | 'final';
  createdAt: any; // Using 'any' for Firestore's serverTimestamp
}
