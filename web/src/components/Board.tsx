'use client';

import React from 'react';
import { Board, CellValue } from '@/lib/engine/types';

interface BoardProps {
  board: Board;
  onCellClick: (index: number) => void;
  disabled?: boolean;
  winningLine?: [number, number, number] | null;
  lastMoveIndex?: number | null;
}

export function BoardComponent({
  board,
  onCellClick,
  disabled = false,
  winningLine = null,
  lastMoveIndex = null,
}: BoardProps) {
  return (
    <div
      className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-zinc-100 dark:bg-zinc-900/90 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-[360px] aspect-square mx-auto"
      role="grid"
      aria-label="Tic-Tac-Toe Game Board"
    >
      {board.map((cell: CellValue, index: number) => {
        const isWinningCell = winningLine?.includes(index);
        const isLastMove = lastMoveIndex === index;

        return (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={disabled || cell !== 0}
            aria-label={`Cell ${index + 1}: ${cell === 1 ? 'X' : cell === -1 ? 'O' : 'Empty'}`}
            className={`relative flex items-center justify-center rounded-xl font-black transition-all select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${
              cell === 0
                ? 'bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700/80 cursor-pointer shadow-sm active:scale-95'
                : 'bg-zinc-50 dark:bg-zinc-800/60 cursor-default shadow-inner'
            } ${
              isWinningCell
                ? 'bg-emerald-100 dark:bg-emerald-950/60 ring-4 ring-emerald-500 scale-105 z-10'
                : isLastMove
                ? 'ring-2 ring-indigo-400'
                : ''
            }`}
          >
            {cell === 1 && (
              <span className="text-4xl sm:text-5xl text-indigo-600 dark:text-indigo-400 animate-in zoom-in-50 duration-150">
                X
              </span>
            )}
            {cell === -1 && (
              <span className="text-4xl sm:text-5xl text-amber-500 dark:text-amber-400 animate-in zoom-in-50 duration-150">
                O
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

