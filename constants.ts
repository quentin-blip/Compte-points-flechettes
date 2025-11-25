import { Multiplier } from './types';

// Standard Dartboard number order starting from top (20) clockwise
export const DARTBOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

// Heatmap colors: Pastel variants of the requested sequence
// Green -> Yellow -> Orange -> Red -> Violet -> Black
export const HEATMAP_COLORS = {
  0: '#cbd5e1', // Fallback
  1: '#86efac', // Pastel Green (Green 300)
  2: '#fde047', // Pastel Yellow (Yellow 300)
  3: '#fdba74', // Pastel Orange (Orange 300)
  4: '#fca5a5', // Pastel Red (Red 300)
  5: '#d8b4fe', // Pastel Violet (Violet 300)
  6: '#000000', // Black (Noir - Strict)
};

export const MAX_THROWS_PER_TURN = 3;

export const getMultiplierLabel = (m: Multiplier): string => {
  switch (m) {
    case Multiplier.Double: return 'D';
    case Multiplier.Triple: return 'T';
    default: return '';
  }
};