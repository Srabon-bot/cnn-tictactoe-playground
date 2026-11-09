'use client';

import React, { useState } from 'react';
import { MoveAnalysis } from '@/lib/engine/types';
import { ProbabilityHeatmap } from './ProbabilityHeatmap';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';

interface MoveTimelineProps {
  moves: MoveAnalysis[];
  modelLevel: string;
}

export function MoveTimeline({ moves, modelLevel }: MoveTimelineProps) {
  const [expandedMoveIndex, setExpandedMoveIndex] = useState<number | null>(moves.length > 0 ? moves.length - 1 : null);

  if (moves.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400">
        No AI moves made yet. Make your first move on the board!
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          AI Decision Timeline ({moves.length} moves)
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Click any move to view 3×3 heatmap</span>
      </div>

      <div className="space-y-2.5">
        {moves.map((m, index) => {
          const isExpanded = expandedMoveIndex === index;
          const hasIssue = m.isMissedWin || m.isMissedBlock || m.wasUnmaskedIllegal;

          return (
            <div
              key={index}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setExpandedMoveIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold">
                    #{index + 1}
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Chose Cell <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{m.move}</span>
                  </span>

                  {/* Memorized tag for Overfit AI */}
                  {modelLevel === 'overfit' && (
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        m.isMemorizedBoard
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      {m.isMemorizedBoard ? 'Familiar Practice Board' : 'Unseen New Board'}
                    </span>
                  )}

                  {/* Findings Badges */}
                  {m.isMissedWin && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                      <AlertCircle className="h-2.5 w-2.5" /> Missed Immediate Win
                    </span>
                  )}
                  {m.isMissedBlock && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5" /> Missed Threat Block
                    </span>
                  )}
                  {m.wasUnmaskedIllegal && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Chose Occupied Square (Masked Out)
                    </span>
                  )}
                  {!hasIssue && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Solid Move
                    </span>
                  )}
                </div>

                <div className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
                    <ProbabilityHeatmap
                      board={m.board}
                      probabilities={m.probabilities}
                      chosenMove={m.move}
                      title="Model Probabilities Before Masking"
                      compact={true}
                    />

                    <div className="max-w-xs text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                      <p className="font-semibold text-zinc-900 dark:text-white">What the AI saw:</p>
                      <p>
                        The AI evaluated the 9 squares from its perspective. The highest probability legal square was{' '}
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Cell {m.move}</span>{' '}
                        ({(m.probabilities[m.move] * 100).toFixed(1)}% confidence).
                      </p>
                      {m.isMissedWin && (
                        <p className="text-rose-600 dark:text-rose-400 font-medium">
                          ⚠️ Educational Note: The AI could have won the game on this turn, but failed to detect the 3-in-a-row winning opportunity.
                        </p>
                      )}
                      {m.isMissedBlock && (
                        <p className="text-rose-600 dark:text-rose-400 font-medium">
                          ⚠️ Educational Note: You had two marks aligned, but the AI failed to block your line.
                        </p>
                      )}
                      {m.wasUnmaskedIllegal && (
                        <p className="text-purple-600 dark:text-purple-400 font-medium">
                          ℹ️ The raw neural net gave its highest score to a square that was already taken. The game engine masked it out to force a legal move.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

