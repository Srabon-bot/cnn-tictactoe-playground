'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Board } from '@/lib/engine/types';
import { SameBoardComparison } from '@/components/SameBoardComparison';
import { LEVELS } from '@/lib/levels';
import { percent, useArtifacts } from '@/lib/useArtifacts';

const BOARD: Board = [-1, -1, 0, 0, 1, 0, 1, 1, 0];

function accuracyData(metrics: NonNullable<ReturnType<typeof useArtifacts>['data']>['metrics']) {
  return LEVELS.map((level) => {
    const row = metrics[level.id];
    return {
      name: level.name,
      Train: Number((row.train_acc * 100).toFixed(1)),
      Test: Number((row.test_acc * 100).toFixed(1)),
      'Test after mask': Number(((row.test_acc_masked ?? row.test_acc) * 100).toFixed(1)),
    };
  });
}

function gameplayData(gameplay: NonNullable<ReturnType<typeof useArtifacts>['data']>['gameplay']) {
  return LEVELS.map((level) => {
    const random = gameplay[level.id].random;
    return {
      name: `${level.name} vs random`,
      Wins: Number(((random.wins / random.games) * 100).toFixed(1)),
      Draws: Number(((random.draws / random.games) * 100).toFixed(1)),
      Losses: Number(((random.losses / random.games) * 100).toFixed(1)),
    };
  });
}

function curveData(history: NonNullable<ReturnType<typeof useArtifacts>['data']>['history']) {
  const longest = Math.max(...LEVELS.map((level) => history[level.id].val_accuracy.length));
  const rows = [];
  for (let epoch = 0; epoch < Math.min(longest, 60); epoch += 1) {
    rows.push({
      epoch: epoch + 1,
      Beginner: history.underfit.val_accuracy[epoch] !== undefined
        ? Number((history.underfit.val_accuracy[epoch] * 100).toFixed(1))
        : null,
      Memorizer: history.overfit.val_accuracy[epoch] !== undefined
        ? Number((history.overfit.val_accuracy[epoch] * 100).toFixed(1))
        : null,
      Steady: history.stable.val_accuracy[epoch] !== undefined
        ? Number((history.stable.val_accuracy[epoch] * 100).toFixed(1))
        : null,
    });
  }
  return rows;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="label">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {item.value}%
        </p>
      ))}
    </div>
  );
}

export default function ComparePage() {
  const { data, error } = useArtifacts();

  return (
    <main>
      <div className="container">
        <div className="page-head">
          <h1 className="display">The same game, three ways</h1>
          <p className="lead">
            All three networks learned the same task from the same data, with different amounts
            of capacity and practice. These are the differences that matter.
          </p>
        </div>

        {error ? (
          <p role="alert" className="note-block" style={{ marginTop: 'var(--space-xl)' }}>
            {error}
          </p>
        ) : !data ? (
          <p className="muted" style={{ paddingBlock: 'var(--space-xl)' }}>
            Reading the measurements.
          </p>
        ) : (
          <>
            <section className="section section--tight" aria-labelledby="figures-title">
              <div className="section-head">
                <h2 id="figures-title">Three measurements, side by side</h2>
                <p className="section-note">
                  Top-choice accuracy asks for a legal, optimal first answer. The post-mask score
                  discards occupied cells before choosing, which is how the game is actually
                  played.
                </p>
              </div>
              {LEVELS.map((level) => {
                const row = data.metrics[level.id];
                return (
                  <div className="figure-row" key={level.id}>
                    <h2>{level.name}</h2>
                    <p className="figure-note">{level.role}. {level.analogy}</p>
                    <div className="figures">
                      <div>
                        <span className="figure-value">{percent(row.test_acc)}</span>
                        <span className="figure-label">test top choice</span>
                      </div>
                      <div>
                        <span className="figure-value">
                          {percent(row.test_acc_masked ?? row.test_acc)}
                        </span>
                        <span className="figure-label">test after mask</span>
                      </div>
                      <div>
                        <span className="figure-value">{row.params.toLocaleString('en-US')}</span>
                        <span className="figure-label">parameters</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="section section--tight" aria-labelledby="table-title">
              <div className="section-head section-head--wide">
                <h2 id="table-title">Every number in one table</h2>
                <p className="section-note">
                  Illegal is the network&apos;s raw first choice landing on an occupied cell.
                  Missed win is measured across all evaluated games.
                </p>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Model</th>
                      <th scope="col">Practice</th>
                      <th scope="col">Validation</th>
                      <th scope="col">Test</th>
                      <th scope="col">Test after mask</th>
                      <th scope="col">Gap</th>
                      <th scope="col">Illegal</th>
                      <th scope="col">Missed win</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEVELS.map((level) => {
                      const row = data.metrics[level.id];
                      const gap = row.train_acc - row.test_acc;
                      return (
                        <tr key={level.id}>
                          <th scope="row">{level.name}</th>
                          <td className="num">{percent(row.train_acc)}</td>
                          <td className="num">{percent(row.val_acc)}</td>
                          <td className="num">{percent(row.test_acc)}</td>
                          <td className="num">{percent(row.test_acc_masked ?? row.test_acc)}</td>
                          <td className="num">{`${gap >= 0 ? '+' : ''}${(gap * 100).toFixed(1)}`}</td>
                          <td className="num">{percent(row.illegal_rate)}</td>
                          <td className="num">{percent(row.missed_win_rate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="section section--tight" aria-labelledby="accuracy-title">
              <div className="section-head">
                <h2 id="accuracy-title">Accuracy, and what the mask hides</h2>
                <p className="section-note">
                  On these labels, always taking the first empty cell already scores about 59%.
                  The mask is generous; the top-choice score is the honest one.
                </p>
              </div>
              <div className="chart-panel">
                <div className="chart-panel-head">
                  <h3>Train and test accuracy</h3>
                  <span className="label">Per cent of boards</span>
                </div>
                <div className="chart-panel-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accuracyData(data.metrics)} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--color-rule)' }} />
                      <YAxis domain={[0, 105]} unit="%" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-paper-2)' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Train" fill="var(--color-ink-2)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Test" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Test after mask" fill="var(--color-accent-soft)" stroke="var(--color-accent-2)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="section section--tight" aria-labelledby="games-title">
              <div className="section-head">
                <h2 id="games-title">1,000 games against random play</h2>
                <p className="section-note">
                  Wins, draws and losses. The Steady model is the only one that never loses this
                  set; it also draws every one of its 200 games against minimax.
                </p>
              </div>
              <div className="chart-panel">
                <div className="chart-panel-head">
                  <h3>Share of games</h3>
                  <span className="label">Random opponent</span>
                </div>
                <div className="chart-panel-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gameplayData(data.gameplay)} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--color-rule)' }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-paper-2)' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Wins" stackId="games" fill="var(--color-accent)" />
                      <Bar dataKey="Draws" stackId="games" fill="var(--color-paper-3)" stroke="var(--color-rule)" />
                      <Bar dataKey="Losses" stackId="games" fill="var(--color-error)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="section section--tight" aria-labelledby="curves-title">
              <div className="section-head">
                <h2 id="curves-title">Validation accuracy over training</h2>
                <p className="section-note">
                  The Memorizer peaks and then drifts. The Beginner never climbs. The Steady
                  model keeps rising and holds.
                </p>
              </div>
              <div className="chart-panel">
                <div className="chart-panel-head">
                  <h3>Held-out boards, epoch by epoch</h3>
                  <span className="label">Top-choice accuracy</span>
                </div>
                <div className="chart-panel-body">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curveData(data.history)} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                      <XAxis dataKey="epoch" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--color-rule)' }} />
                      <YAxis domain={[0, 100]} unit="%" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="Beginner" stroke="var(--color-muted)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Memorizer" stroke="var(--color-error)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Steady" stroke="var(--color-accent)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="section" aria-labelledby="same-board-title">
              <SameBoardComparison
                board={BOARD}
                mover={-1}
                title="One board, three answers"
                caption="O can finish the game at cell 3. The three networks read the same position differently, and the heat map is computed live from their exported weights."
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
