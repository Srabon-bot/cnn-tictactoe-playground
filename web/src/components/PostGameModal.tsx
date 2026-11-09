'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GameFindings, ModelLevel, MoveAnalysis } from '@/lib/engine/types';
import { ModelGameplay, ModelHistory, ModelMetrics } from '@/lib/data';
import { LEVEL_BY_ID } from '@/lib/levels';
import { MoveTimeline } from './MoveTimeline';

interface PostGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome: 'win' | 'loss' | 'draw';
  level: ModelLevel;
  moves: MoveAnalysis[];
  findings: GameFindings;
  metrics: ModelMetrics | null;
  gameplay: Record<ModelLevel, ModelGameplay> | null;
  history: Record<ModelLevel, ModelHistory> | null;
  explanationText: string;
  onPlayAgain: () => void;
}

interface ChartPoint {
  epoch: number;
  train: number;
  validation: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="label">Epoch {label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {Math.round(item.value ?? 0)}%
        </p>
      ))}
    </div>
  );
}

function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

const OUTCOME_TITLE = {
  win: 'You won.',
  loss: 'The network won.',
  draw: 'A draw.',
} as const;

export function PostGameModal({
  isOpen,
  onClose,
  outcome,
  level,
  moves,
  findings,
  metrics,
  gameplay,
  history,
  explanationText,
  onPlayAgain,
}: PostGameModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const levelInfo = LEVEL_BY_ID[level];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const curve: ChartPoint[] =
    history?.[level].accuracy.map((value, index) => ({
      epoch: index + 1,
      train: value * 100,
      validation: (history[level].val_accuracy[index] ?? 0) * 100,
    })) ?? [];

  const modelGames = gameplay?.[level];

  return (
    <dialog
      ref={dialogRef}
      className="report-dialog"
      aria-labelledby="report-title"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="report-sheet">
        <div className="report-top">
          <div>
            <p className="label">
              Match report · {levelInfo.name} · {outcome === 'win' ? 'you took the game' : 'board complete'}
            </p>
            <h2 id="report-title">{OUTCOME_TITLE[outcome]}</h2>
          </div>
          <button type="button" className="report-close" onClick={onClose} aria-label="Close report">
            ✕
          </button>
        </div>

        <div className="report-body">
          <div className="report-grid">
            <div className="report-block">
              <h3>What happened this game</h3>
              <dl className="finding-list">
                <div className="finding">
                  <dt>Missed wins</dt>
                  <dd>{findings.missedWins}</dd>
                </div>
                <div className="finding">
                  <dt>Missed blocks</dt>
                  <dd>{findings.missedBlocks}</dd>
                </div>
                <div className="finding">
                  <dt>Occupied squares scored</dt>
                  <dd>{findings.illegalAttempts}</dd>
                </div>
                <div className="finding">
                  <dt>{level === 'overfit' ? 'Practice boards met' : 'Network moves'}</dt>
                  <dd>
                    {level === 'overfit'
                      ? `${findings.familiarBoardsCount} / ${findings.totalAIMoves}`
                      : findings.totalAIMoves}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="report-block">
              <h3>Why it played this way</h3>
              <p className="muted" style={{ fontSize: 'var(--text-sm)' }}>
                {explanationText ||
                  'This model learned what its training data allowed. The report above shows where those limits appeared.'}
              </p>
            </div>

            <div className="report-block">
              <h3>The model on its exam</h3>
              {metrics ? (
                <table className="report-table">
                  <tbody>
                    <tr>
                      <th>Practice boards</th>
                      <td className="num">{percent(metrics.train_acc)}</td>
                    </tr>
                    <tr>
                      <th>Held-out boards</th>
                      <td className="num">{percent(metrics.val_acc)}</td>
                    </tr>
                    <tr>
                      <th>Test boards</th>
                      <td className="num">{percent(metrics.test_acc)}</td>
                    </tr>
                    {metrics.test_acc_masked !== undefined ? (
                      <tr>
                        <th>Test, after mask</th>
                        <td className="num">{percent(metrics.test_acc_masked)}</td>
                      </tr>
                    ) : null}
                    <tr>
                      <th>Parameters</th>
                      <td className="num">{metrics.params.toLocaleString('en-US')}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="muted">Reading the measurements.</p>
              )}
            </div>

            <div className="report-block">
              <h3>Across all its games</h3>
              {modelGames ? (
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Opponent</th>
                      <th className="num">W / D / L</th>
                      <th className="num">Missed win</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Random</th>
                      <td className="num">
                        {modelGames.random.wins} / {modelGames.random.draws} / {modelGames.random.losses}
                      </td>
                      <td className="num">{percent(modelGames.random.missed_win_rate)}</td>
                    </tr>
                    <tr>
                      <th>Minimax</th>
                      <td className="num">
                        {modelGames.minimax.wins} / {modelGames.minimax.draws} / {modelGames.minimax.losses}
                      </td>
                      <td className="num">{percent(modelGames.minimax.missed_win_rate)}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="muted">Reading the game log.</p>
              )}
            </div>
          </div>

          {curve.length > 0 ? (
            <div className="report-block" style={{ marginTop: 'var(--space-lg)' }}>
              <h3>The training curve behind this game</h3>
              <div className="report-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curve} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                    <XAxis
                      dataKey="epoch"
                      tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--color-rule)' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="train"
                      name="Practice"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="validation"
                      name="Held-out"
                      stroke="var(--color-ink-2)"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          <div className="report-block" style={{ marginTop: 'var(--space-lg)' }}>
            <h3>Every network move</h3>
            <MoveTimeline moves={moves} modelLevel={level} />
          </div>
        </div>

        <div
          className="report-top"
          style={{ borderBottom: 0, borderTop: '1px solid var(--color-rule)', alignItems: 'center' }}
        >
          <Link href="/compare" className="text-link">
            Compare all three networks
          </Link>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--small" onClick={onClose}>
              Review the board
            </button>
            <button type="button" className="btn btn--primary btn--small" onClick={onPlayAgain}>
              Play again
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
