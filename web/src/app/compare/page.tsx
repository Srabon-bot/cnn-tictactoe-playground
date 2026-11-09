'use client';

import React, { useState, useEffect } from 'react';
import { ModelLevel } from '@/lib/engine/types';
import { fetchGameplay, fetchHistory, fetchMetrics, ModelGameplay, ModelHistory, ModelMetrics } from '@/lib/data';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { BarChart2, TrendingUp, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ComparePage() {
  const [metrics, setMetrics] = useState<Record<ModelLevel, ModelMetrics> | null>(null);
  const [history, setHistory] = useState<Record<ModelLevel, ModelHistory> | null>(null);
  const [gameplay, setGameplay] = useState<Record<ModelLevel, ModelGameplay> | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<'loss' | 'accuracy'>('accuracy');

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchHistory(), fetchGameplay()]).then(([m, h, g]) => {
      setMetrics(m);
      setHistory(h);
      setGameplay(g);
    });
  }, []);

  if (!metrics || !history || !gameplay) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm font-semibold text-zinc-500">
        Loading comparative models data...
      </div>
    );
  }

  // Format accuracy bar data
  const accuracyBarData = [
    {
      name: 'Beginner (Underfit)',
      Train: Number((metrics.underfit.train_acc * 100).toFixed(1)),
      Validation: Number((metrics.underfit.val_acc * 100).toFixed(1)),
      Test: Number((metrics.underfit.test_acc * 100).toFixed(1)),
    },
    {
      name: 'Memorizer (Overfit)',
      Train: Number((metrics.overfit.train_acc * 100).toFixed(1)),
      Validation: Number((metrics.overfit.val_acc * 100).toFixed(1)),
      Test: Number((metrics.overfit.test_acc * 100).toFixed(1)),
    },
    {
      name: 'Master (Stable)',
      Train: Number((metrics.stable.train_acc * 100).toFixed(1)),
      Validation: Number((metrics.stable.val_acc * 100).toFixed(1)),
      Test: Number((metrics.stable.test_acc * 100).toFixed(1)),
    },
  ];

  // Format gameplay distribution data
  const gameplayWdlData = [
    {
      name: 'Underfit vs Random',
      Wins: Number(((gameplay.underfit.random.wins / 1000) * 100).toFixed(1)),
      Draws: Number(((gameplay.underfit.random.draws / 1000) * 100).toFixed(1)),
      Losses: Number(((gameplay.underfit.random.losses / 1000) * 100).toFixed(1)),
    },
    {
      name: 'Overfit vs Random',
      Wins: Number(((gameplay.overfit.random.wins / 1000) * 100).toFixed(1)),
      Draws: Number(((gameplay.overfit.random.draws / 1000) * 100).toFixed(1)),
      Losses: Number(((gameplay.overfit.random.losses / 1000) * 100).toFixed(1)),
    },
    {
      name: 'Stable vs Random',
      Wins: Number(((gameplay.stable.random.wins / 1000) * 100).toFixed(1)),
      Draws: Number(((gameplay.stable.random.draws / 1000) * 100).toFixed(1)),
      Losses: Number(((gameplay.stable.random.losses / 1000) * 100).toFixed(1)),
    },
    {
      name: 'Stable vs Minimax',
      Wins: 0,
      Draws: Number(((gameplay.stable.minimax.draws / 200) * 100).toFixed(1)),
      Losses: Number(((gameplay.stable.minimax.losses / 200) * 100).toFixed(1)),
    },
  ];

  // Training curves alignment (max epochs)
  const maxEpochs = Math.max(
    history.underfit.accuracy.length,
    history.overfit.accuracy.length,
    history.stable.accuracy.length
  );

  const curveData = [];
  for (let ep = 0; ep < Math.min(maxEpochs, 60); ep++) {
    curveData.push({
      epoch: ep + 1,
      underfitVal: history.underfit.val_accuracy[ep] ? Number((history.underfit.val_accuracy[ep] * 100).toFixed(1)) : null,
      overfitVal: history.overfit.val_accuracy[ep] ? Number((history.overfit.val_accuracy[ep] * 100).toFixed(1)) : null,
      stableVal: history.stable.val_accuracy[ep] ? Number((history.stable.val_accuracy[ep] * 100).toFixed(1)) : null,
      underfitLoss: history.underfit.val_loss[ep] ? Number(history.underfit.val_loss[ep].toFixed(2)) : null,
      overfitLoss: history.overfit.val_loss[ep] ? Number(history.overfit.val_loss[ep].toFixed(2)) : null,
      stableLoss: history.stable.val_loss[ep] ? Number(history.stable.val_loss[ep].toFixed(2)) : null,
    });
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
          Side-by-Side Model Comparison
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Compare the three CNN architectures side-by-side using empirical validation curves, generalization drops, and game-play distributions.
        </p>
      </div>

      {/* Summary Comparison Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Empirical Metrics Summary Table
        </h2>
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="pb-3 pr-4">Model</th>
              <th className="pb-3 pr-4">Parameters</th>
              <th className="pb-3 pr-4">Practice Acc</th>
              <th className="pb-3 pr-4">Validation Acc</th>
              <th className="pb-3 pr-4">Test Acc</th>
              <th className="pb-3 pr-4">Generalization Gap</th>
              <th className="pb-3 pr-4">Raw Illegal Move Rate</th>
              <th className="pb-3">Missed Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
            <tr>
              <td className="py-3.5 font-bold text-amber-600 dark:text-amber-400">Beginner (Underfit)</td>
              <td className="py-3.5">191</td>
              <td className="py-3.5">{(metrics.underfit.train_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5">{(metrics.underfit.val_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5">{(metrics.underfit.test_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5 text-zinc-500">-0.9%</td>
              <td className="py-3.5 text-rose-600 dark:text-rose-400">{(metrics.underfit.illegal_rate * 100).toFixed(1)}%</td>
              <td className="py-3.5 text-rose-600 dark:text-rose-400">{(metrics.underfit.missed_win_rate * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td className="py-3.5 font-bold text-rose-600 dark:text-rose-400">Memorizer (Overfit)</td>
              <td className="py-3.5">687,625</td>
              <td className="py-3.5 font-bold text-emerald-600">{(metrics.overfit.train_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5">{(metrics.overfit.val_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5">{(metrics.overfit.test_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5 font-extrabold text-rose-600 dark:text-rose-400">+26.2%</td>
              <td className="py-3.5">{(metrics.overfit.illegal_rate * 100).toFixed(1)}%</td>
              <td className="py-3.5">{(metrics.overfit.missed_win_rate * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">Master (Stable)</td>
              <td className="py-3.5">93,833</td>
              <td className="py-3.5">{(metrics.stable.train_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5">{(metrics.stable.val_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5 font-extrabold text-emerald-600">{(metrics.stable.test_acc * 100).toFixed(1)}%</td>
              <td className="py-3.5 text-emerald-600">+1.6%</td>
              <td className="py-3.5 font-bold text-emerald-600">0.0%</td>
              <td className="py-3.5 text-emerald-600">{(metrics.stable.missed_win_rate * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Accuracy Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Train vs Validation vs Test Accuracy
            </h3>
            <p className="text-xs text-zinc-500">Notice the massive 26.2% drop for the Memorizer model on test boards.</p>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyBarData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" domain={[0, 105]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Train" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Validation" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Test" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gameplay Distribution Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Gameplay Outcomes Distribution
            </h3>
            <p className="text-xs text-zinc-500">Based on 1,000 games vs random play and 200 games vs minimax adversary.</p>
          </div>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gameplayWdlData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Wins" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Draws" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Losses" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Validation Curves Overlay Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Validation Curves Overlay
            </h3>
            <p className="text-xs text-zinc-500">Watch how the models diverge across epochs on unseen validation data.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setSelectedOverlay('accuracy')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedOverlay === 'accuracy'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Validation Accuracy
            </button>
            <button
              onClick={() => setSelectedOverlay('loss')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                selectedOverlay === 'loss'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Validation Loss
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} />
              <YAxis
                unit={selectedOverlay === 'accuracy' ? '%' : ''}
                domain={selectedOverlay === 'accuracy' ? [40, 100] : [0, 4.5]}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {selectedOverlay === 'accuracy' ? (
                <>
                  <Line type="monotone" dataKey="underfitVal" name="Underfit (Val Acc)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="overfitVal" name="Overfit (Val Acc)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="stableVal" name="Stable (Val Acc)" stroke="#10b981" strokeWidth={3} dot={false} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="underfitLoss" name="Underfit (Val Loss)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="overfitLoss" name="Overfit (Val Loss)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="stableLoss" name="Stable (Val Loss)" stroke="#10b981" strokeWidth={3} dot={false} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

