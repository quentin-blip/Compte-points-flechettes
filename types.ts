export enum Multiplier {
  Single = 1,
  Double = 2,
  Triple = 3,
}

export interface Throw {
  playerId: string;
  legId: number;
  scoreValue: number; // The raw number (e.g., 20)
  multiplier: Multiplier;
  totalPoints: number; // value * multiplier
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

export interface GameConfig {
  startingScore: number;
  totalLegs: number;
  players: Player[];
}

export interface GameState {
  status: GameStatus;
  currentLeg: number;
  currentPlayerIndex: number;
  turnThrows: Throw[]; // Throws in the current turn (max 3)
  history: Throw[]; // All throws in the game
  scoreAtStartOfTurn: number;
}
