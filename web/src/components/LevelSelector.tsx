'use client';

import React from 'react';
import { ModelLevel } from '@/lib/engine/types';
import { Brain, Cpu, Sparkles } from 'lucide-react';

interface LevelSelectorProps {
  currentLevel: ModelLevel;
  onSelectLevel: (level: ModelLevel) => void;
  disabled?: boolean;
}

export function LevelSelector({ currentLevel, onSelectLevel, disabled = false }: LevelSelectorProps) {
  const levels = [
    {
      id: 'underfit' as ModelLevel,
      name: 'Beginner AI',
      subtitle: 'Underfitted CNN',
      analogy: 'Skimmed the textbook for 5 minutes',
      badge: 'Level 1: Weak',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      icon: Cpu,
      description: 'Barely learned the rules. Misses obvious wins, fails to block, and frequently guesses occupied cells.',
    },
    {
      id: 'overfit' as ModelLevel,
      name: 'Memorizer AI',
      subtitle: 'Overfitted CNN',
      analogy: "Memorized last year's exam questions",
      badge: 'Level 2: Overfit',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      icon: Brain,
      description: 'Memorized 60 training positions perfectly. Great on familiar boards, but helpless when moves shift to new boards.',
    },
    {
      id: 'stable' as ModelLevel,
      name: 'Master AI',
      subtitle: 'Stable & Regularized',
      analogy: 'Understood the underlying concepts',
      badge: 'Level 3: Optimal',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      icon: Sparkles,
      description: 'Trained with 8× symmetry augmentation and dropout. Generalizes across all boards; forces draws against minimax.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full max-w-4xl mx-auto">
      {levels.map(lvl => {
        const isSelected = currentLevel === lvl.id;
        const Icon = lvl.icon;

        return (
          <button
            key={lvl.id}
            disabled={disabled}
            onClick={() => onSelectLevel(lvl.id)}
            className={`flex flex-col text-left p-4 rounded-2xl border transition-all cursor-pointer ${
              isSelected
                ? 'border-indigo-600 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-md scale-[1.01]'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm text-zinc-900 dark:text-white">{lvl.name}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${lvl.badgeColor}`}>
                {lvl.badge}
              </span>
            </div>

            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              &quot;{lvl.analogy}&quot;
            </p>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
              {lvl.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

