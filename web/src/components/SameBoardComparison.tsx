'use client';

import React, { useEffect, useState } from 'react';
import { Board, ModelLevel, Player } from '@/lib/engine/types';
import { bestMoves } from '@/lib/engine/rules';
import { loadModel, NeuralNetworkModel } from '@/lib/engine/inference';
import { ProbabilityHeatmap } from './ProbabilityHeatmap';
import { LEVELS } from '@/lib/levels';

interface SameBoardComparisonProps {
  board: Board;
  mover: Player;
  title: string;
  caption: string;
}

/**
 * Ask all three networks the same question in the browser and show their answers
 * side by side. Nothing here is a stored claim: the probabilities are computed live
 * from the exported weights, so the comparison cannot drift from the models.
 */
export function SameBoardComparison({ board, mover, title, caption }: SameBoardComparisonProps) {
  const [models, setModels] = useState<Record<ModelLevel, NeuralNetworkModel> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all(LEVELS.map((level) => loadModel(level.id)))
      .then(([underfit, overfit, stable]) => {
        if (active) setModels({ underfit, overfit, stable });
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Model weights could not load.');
      });
    return () => {
      active = false;
    };
  }, []);

  const optimal = bestMoves(board, mover);

  return (
    <section aria-labelledby="same-board-heading">
      <div className="section-head section-head--wide">
        <h2 id="same-board-heading">{title}</h2>
        <p className="section-note">{caption}</p>
      </div>
      {error ? (
        <p role="alert" className="note-block">
          {error}
        </p>
      ) : !models ? (
        <p className="muted">Reading the three sets of weights.</p>
      ) : (
        <div className="same-board-grid">
          {LEVELS.map((level) => {
            const evaluation = models[level.id].evaluateMove(board, mover);
            const named =
              evaluation.chosenMove === optimal[0]
                ? 'same as minimax'
                : optimal.includes(evaluation.chosenMove)
                  ? 'also optimal'
                  : 'not optimal here';
            return (
              <div className="same-board-card" key={level.id}>
                <h3>{level.name}</h3>
                <p className="muted" style={{ fontSize: 'var(--text-sm)', minHeight: '2.8em' }}>
                  Scores cell {evaluation.chosenMove + 1} at{' '}
                  {Math.round(evaluation.probabilities[evaluation.chosenMove] * 100)}%.{' '}
                  {named}.
                </p>
                <ProbabilityHeatmap
                  board={board}
                  probabilities={evaluation.probabilities}
                  chosenMove={evaluation.chosenMove}
                  optimalMoves={optimal}
                  compact
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
