'use client';

import React from 'react';
import { GameFindings, ModelLevel, MoveAnalysis } from '@/lib/engine/types';
import { ModelMetrics } from '@/lib/data';
import { MoveTimeline } from './MoveTimeline';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Trophy, X } from 'lucide-react';
import Link from 'next/link';

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome: 'win' | 'loss' | 'draw';
  level: ModelLevel;
  moves: MoveAnalysis[];
  findings: GameFindings;
  metrics: ModelMetrics | null;
  explanationText: string;
  onPlayAgain: () => void;
}

export function PostGameModal({
  isOpen,
  onClose,
  outcome,
  level,
  moves,
  findings,
  metrics,
  explanationText,
  onPlayAgain,
}: PostGameModalProps) {
  if (!isOpen) return null;

  const outcomeDetails = {
    win: {
      title: 'Victory!',
      subtitle: 'You defeated the neural network!',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    },
    loss: {
      title: 'Game Over',
      subtitle: 'The AI prevailed this round.',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    },
    draw: {
      title: 'Stalemate!',
      subtitle: 'A well-matched contest ended in a draw.',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    },
  }[outcome];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className={`p-6 border-b ${outcomeDetails.bg} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
              <Trophy className={`h-7 w-7 ${outcomeDetails.color}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${outcomeDetails.color}`}>{outcomeDetails.title}</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{outcomeDetails.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Key Findings in this specific game */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Game-Specific AI Findings
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Missed Wins</span>
                <p className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  {findings.missedWins > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400">{findings.missedWins}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">0</span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Missed Blocks</span>
                <p className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  {findings.missedBlocks > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400">{findings.missedBlocks}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">0</span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Illegal Attempts</span>
                <p className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  {findings.illegalAttempts > 0 ? (
                    <span className="text-purple-600 dark:text-purple-400">{findings.illegalAttempts}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">0</span>
                  )}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Practice Boards</span>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {level === 'overfit' ? `${findings.familiarBoardsCount}/${findings.totalAIMoves}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Plain-Language Explanation of Why it happened */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Why Did the AI Play This Way?
            </h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {explanationText ||
                'This model learned based on its training capacity. Regularization and augmentation are necessary for neural nets to generalize to unseen positions.'}
            </p>
            {metrics && (
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 border-t border-indigo-100/60 dark:border-indigo-900/40">
                <span>Practice Accuracy: <strong>{(metrics.train_acc * 100).toFixed(0)}%</strong></span>
                <span>Unseen Board Accuracy: <strong>{(metrics.test_acc * 100).toFixed(0)}%</strong></span>
                <span>Generalization Gap: <strong>{((metrics.train_acc - metrics.test_acc) * 100).toFixed(0)}%</strong></span>
              </div>
            )}
          </div>

          {/* Move-by-move timeline with heatmaps */}
          <MoveTimeline moves={moves} modelLevel={level} />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/compare"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Compare all 3 neural networks side-by-side <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Review Board
            </button>
            <button
              onClick={onPlayAgain}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

