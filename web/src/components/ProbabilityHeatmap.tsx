'use client';

import React from 'react';
import { Board } from '@/lib/engine/types';

interface ProbabilityHeatmapProps {
  board: Board;
  probabilities: number[];
  chosenMove?: number;
  optimalMoves?: number[];
  title?: string;
  className?: string;
  compact?: boolean;
}

export function ProbabilityHeatmap({
  board,
  probabilities,
  chosenMove,
  optimalMoves,
  title,
  className = '',
  compact = false,
}: ProbabilityHeatmapProps) {
  // Normalize or clamp probabilities to [0, 1]
  const validProbs = probabilities.length === 9 ? probabilities : new Array(9).fill(0);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <h4 className="mb-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 text-center">
          {title}
        </h4>
      )}
      <div
        className={`grid grid-cols-3 gap-1.5 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 ${
          compact ? 'w-44 h-44' : 'w-60 h-60'
        }`}
        role="region"
        aria-label="3x3 Model Probability Heatmap"
      >
        {Array.from({ length: 9 }).map((_, idx) => {
          const cellVal = board[idx];
          const isOccupied = cellVal !== 0;
          const prob = validProbs[idx] ?? 0;
          const isChosen = chosenMove === idx;
          const isOptimal = optimalMoves?.includes(idx);

          // Color scale: Blue tint proportional to probability
          const alpha = Math.min(Math.max(prob, 0.05), 0.95);
          const bgStyle = isOccupied
            ? undefined
            : { backgroundColor: `rgba(59, 130, 246, ${alpha})` };

          return (
            <div
              key={idx}
              style={bgStyle}
              className={`relative flex flex-col items-center justify-center rounded-lg transition-all ${
                isOccupied
                  ? 'bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500'
                  : prob > 0.45 ? 'text-white font-bold' : 'text-zinc-900 dark:text-zinc-100 font-medium'
              } ${
                isChosen
                  ? 'ring-4 ring-rose-500 shadow-md z-10'
                  : isOptimal
                  ? 'ring-2 ring-emerald-500'
                  : ''
              }`}
            >
              {isOccupied ? (
                <span className={compact ? 'text-xl font-black' : 'text-3xl font-black'}>
                  {cellVal === 1 ? 'X' : 'O'}
                </span>
              ) : (
                <>
                  <span className={compact ? 'text-[10px]' : 'text-xs'}>
                    {(prob * 100).toFixed(0)}%
                  </span>
                  {isChosen && (
                    <span className="absolute bottom-1 text-[8px] uppercase tracking-tighter font-extrabold text-rose-600 dark:text-rose-400">
                      CHOSEN
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

