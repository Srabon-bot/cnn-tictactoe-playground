"use client";

import React from "react";
import { Board, CellValue } from "@/lib/engine/types";

interface BoardProps {
  board: Board;
  onCellClick: (index: number) => void;
  disabled?: boolean;
  winningLine?: [number, number, number] | null;
  lastMoveIndex?: number | null;
}

function cellLabel(cell: CellValue, index: number): string {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  const mark = cell === 1 ? "X" : cell === -1 ? "O" : "empty";
  return `Row ${row}, column ${column}, ${mark}`;
}

export function BoardComponent({
  board,
  onCellClick,
  disabled = false,
  winningLine = null,
  lastMoveIndex = null,
}: BoardProps) {
  return (
    <div className="board" role="group" aria-label="Tic-tac-toe board">
      {board.map((cell: CellValue, index: number) => {
        const isWinningCell = winningLine?.includes(index) ?? false;
        const isLastMove = lastMoveIndex === index;

        return (
          <button
            key={index}
            type="button"
            className="board-cell"
            onClick={() => onCellClick(index)}
            disabled={disabled || cell !== 0}
            aria-label={cellLabel(cell, index)}
            data-mark={cell === 1 ? "x" : cell === -1 ? "o" : undefined}
            data-win={isWinningCell ? "true" : undefined}
            data-last={isLastMove ? "true" : undefined}
          >
            {cell === 1 ? "X" : cell === -1 ? "O" : null}
          </button>
        );
      })}
    </div>
  );
}
