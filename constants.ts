import { Multiplier } from './types';

// Standard Dartboard number order starting from top (20) clockwise
export const DARTBOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

// Heatmap colors: Custom sequence requested by user
// Green -> Yellow -> Orange -> Red -> Violet -> Black
export const HEATMAP_COLORS = {
  0: '#334155', // Fallback
  1: '#22c55e', // Green (Vert)
  2: '#facc15', // Yellow (Jaune)
  3: '#f97316', // Orange (Orange)
  4: '#ef4444', // Red (Rouge)
  5: '#8b5cf6', // Violet (Violet)
  6: '#000000', // Black (Noir)
};

export const MAX_THROWS_PER_TURN = 3;

export const getMultiplierLabel = (m: Multiplier): string => {
  switch (m) {
    case Multiplier.Double: return 'D';
    case Multiplier.Triple: return 'T';
    default: return '';
  }
};