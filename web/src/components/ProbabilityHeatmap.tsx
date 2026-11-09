"use client";

import React from "react";
import { Board } from "@/lib/engine/types";

interface ProbabilityHeatmapProps {
  board: Board;
  probabilities: number[];
  chosenMove?: number;
  optimalMoves?: number[];
  title?: string;
  className?: string;
  compact?: boolean;
}

/**
 * The network's nine-cell distribution, drawn as a shallow bed of cells.
 * The accent fill is the probability; the number is the same value in type.
 */
export function ProbabilityHeatmap({
  board,
  probabilities,
  chosenMove,
  optimalMoves,
  title,
  className = "",
  compact = false,
}: ProbabilityHeatmapProps) {
  const valid = probabilities.length === 9 ? probabilities : new Array(9).fill(0);

  return (
    <div className={className}>
      {title ? <p className="label">{title}</p> : null}
      <div
        className="heat"
        role="img"
        aria-label="The model's probability for each open cell"
        style={{ maxWidth: compact ? 190 : 280, marginTop: title ? 6 : 0 }}
      >
        {Array.from({ length: 9 }).map((_, index) => {
          const cell = board[index];
          const occupied = cell !== 0;
          const probability = Math.max(0, Math.min(1, valid[index] ?? 0));
          const isChosen = chosenMove === index;
          const isOptimal = optimalMoves?.includes(index) ?? false;

          return (
            <div
              key={index}
              className="heat-cell"
              data-chosen={isChosen ? "true" : undefined}
              data-optimal={isOptimal ? "true" : undefined}
              data-mark={cell === 1 ? "x" : cell === -1 ? "o" : undefined}
              style={{ ["--heat" as string]: occupied ? 0 : probability }}
            >
              {occupied ? (cell === 1 ? "X" : "O") : `${Math.round(probability * 100)}%`}
            </div>
          );
        })}
      </div>
    </div>
  );
}
