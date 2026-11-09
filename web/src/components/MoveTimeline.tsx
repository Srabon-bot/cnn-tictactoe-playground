'use client';

import React, { useState } from 'react';
import { MoveAnalysis } from '@/lib/engine/types';
import { ProbabilityHeatmap } from './ProbabilityHeatmap';

interface MoveTimelineProps {
  moves: MoveAnalysis[];
  modelLevel: string;
}

function cellName(index: number): string {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  return `row ${row}, column ${column}`;
}

export function MoveTimeline({ moves, modelLevel }: MoveTimelineProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(moves.length > 0 ? moves.length - 1 : null);

  if (moves.length === 0) {
    return (
      <p className="muted" style={{ paddingBlock: 'var(--space-lg)' }}>
        No network moves yet. Put a mark on the board and its first answer will appear here.
      </p>
    );
  }

  return (
    <ul className="timeline">
      {moves.map((move, index) => {
        const open = openIndex === index;
        const flagged = move.isMissedWin || move.isMissedBlock;
        const confidence = move.probabilities[move.move] ?? 0;

        return (
          <li className="timeline-item" key={index}>
            <button
              type="button"
              className="timeline-summary"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className="timeline-move">Move {index + 1}</span>
              <span className="timeline-title">
                Cell {move.move + 1}
                <span className="muted" style={{ fontWeight: 400 }}>
                  {' '}
                  · {cellName(move.move)}
                </span>
              </span>
              <span className="timeline-flags">
                {move.isMissedWin ? <span>Missed win</span> : null}
                {move.isMissedBlock ? <span>Missed block</span> : null}
                {move.wasUnmaskedIllegal ? <span>Occupied square scored</span> : null}
                {!flagged && !move.wasUnmaskedIllegal ? <span>Clean move</span> : null}
                {modelLevel === 'overfit' ? (
                  <span>{move.isMemorizedBoard ? 'Practice board' : 'New board'}</span>
                ) : null}
              </span>
            </button>

            {open ? (
              <div className="timeline-detail">
                <ProbabilityHeatmap
                  board={move.board}
                  probabilities={move.probabilities}
                  chosenMove={move.move}
                  title="The nine scores before masking"
                  compact
                />
                <div className="stack-sm">
                  <p>
                    The network gave this cell {Math.round(confidence * 100)}% of its
                    probability. The highest legal score decides the move.
                  </p>
                  {move.isMissedWin ? (
                    <p>
                      It could have finished the game on this turn and chose another cell.
                    </p>
                  ) : null}
                  {move.isMissedBlock ? (
                    <p>
                      One block would have stopped your line. It scored a different cell
                      instead.
                    </p>
                  ) : null}
                  {move.wasUnmaskedIllegal ? (
                    <p>
                      Its top score landed on a square that was already taken. The game
                      engine masked that cell out so the move stayed legal.
                    </p>
                  ) : null}
                  {modelLevel === 'overfit' ? (
                    <p>
                      {move.isMemorizedBoard
                        ? 'This position was in the sixty practice boards.'
                        : 'This position was not in its sixty practice boards.'}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
