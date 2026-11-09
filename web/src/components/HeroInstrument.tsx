'use client';

import React, { useEffect, useState } from 'react';
import { Board, Player } from '@/lib/engine/types';
import { loadModel, NeuralNetworkModel } from '@/lib/engine/inference';

const HERO_BOARD: Board = [-1, -1, 0, 0, 1, 0, 1, 1, 0];
const HERO_MOVER: Player = -1;

/**
 * The hero's instrument: the steady network's live read of one mid-game board.
 * The numbers are computed from the exported weights in the browser, not stored.
 */
export function HeroInstrument() {
  const [model, setModel] = useState<NeuralNetworkModel | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    loadModel('stable')
      .then((loaded) => {
        if (active) setModel(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const evaluation = model?.evaluateMove(HERO_BOARD, HERO_MOVER, 'steady') ?? null;
  const probabilities = evaluation?.probabilities ?? new Array(9).fill(0);
  const chosen = evaluation?.chosenMove ?? null;
  const topScore = chosen === null ? null : probabilities[chosen];

  return (
    <div className="hero-instrument panel" aria-label="The steady network's live reading of a board">
      <div className="panel-body">
        <div className="instrument-meta">
          <span>Steady network</span>
          <span>Mid-game · O to move</span>
        </div>

        <div className="heat" role="img" aria-label="Probability for each open cell" style={{ marginTop: 12 }}>
          {HERO_BOARD.map((cell, index) => {
            const occupied = cell !== 0;
            const probability = Math.max(0, Math.min(1, probabilities[index] ?? 0));
            return (
              <div
                key={index}
                className="heat-cell"
                data-mark={cell === 1 ? 'x' : cell === -1 ? 'o' : undefined}
                data-chosen={chosen === index ? 'true' : undefined}
                style={{ ['--heat' as string]: occupied ? 0 : probability }}
              >
                {occupied ? (cell === 1 ? 'X' : 'O') : `${Math.round(probability * 100)}%`}
              </div>
            );
          })}
        </div>

        <div className="instrument-foot">
          <div>
            <span className="label" style={{ display: 'block' }}>
              Top score
            </span>
            <strong className="instrument-value">
              {chosen === null
                ? failed
                  ? 'Weights unavailable'
                  : 'Reading…'
                : `Cell ${chosen + 1} · ${Math.round((topScore ?? 0) * 100)}%`}
            </strong>
          </div>
          <span className="legend">
            <span className="legend-swatch" aria-hidden="true" />
            Nine cells, nine scores
          </span>
        </div>
      </div>
    </div>
  );
}
