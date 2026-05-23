export enum Multiplier {
  Single = 1,
  Double = 2,
  Triple = 3,
}

export interface Throw {
  playerId: string;
  legId: number;
  scoreValue: number;
  multiplier: Multiplier;
  totalPoints: number;
  isBust: boolean;
  isWin: boolean;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  wins: number;
}

export enum GameStatus {
  Setup,
  Playing,
  Summary,
}

export enum GameMode {
  Match = 'MATCH',
  Training = 'TRAINING'
}

export interface GameConfig {
  mode: GameMode;
  startingScore: number;
  totalLegs: number;
  players: Player[];
  trainingConfig?: {
    targetZones: number[];
    maxDarts: number;
  };
}

export interface GameState {
  status: GameStatus;
  currentLeg: number;
  currentPlayerIndex: number;
  legStarterIndex: number;
  turnThrows: Throw[];
  history: Throw[];
  scoreAtStartOfTurn: number;
  finishedPlayerIds: string[]; 
}