import { ModelLevel } from './engine/types';

export interface LevelInfo {
  id: ModelLevel;
  name: string;
  role: string;
  analogy: string;
  blurb: string;
}

export const LEVELS: LevelInfo[] = [
  {
    id: 'underfit',
    name: 'Beginner',
    role: 'Too little capacity',
    analogy: 'Skimmed the book for five minutes.',
    blurb:
      'Two filters and a handful of passes. It misses wins it can see and often scores a square that is already taken.',
  },
  {
    id: 'overfit',
    name: 'Memorizer',
    role: 'Too little practice',
    analogy: "Memorised last year's answers.",
    blurb:
      'Trained on sixty boards until it knows them perfectly. Move one mark and it is suddenly on unfamiliar ground.',
  },
  {
    id: 'stable',
    name: 'Steady',
    role: 'The rules, learned',
    analogy: 'Understood the ideas, not the answers.',
    blurb:
      'Trained on the whole set with symmetry augmentation and dropout. At play time it averages the board over its eight symmetries and takes a forced win or block.',
  },
];

export const LEVEL_BY_ID: Record<ModelLevel, LevelInfo> = {
  underfit: LEVELS[0],
  overfit: LEVELS[1],
  stable: LEVELS[2],
};
