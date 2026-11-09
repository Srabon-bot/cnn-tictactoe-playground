'use client';

import { useEffect, useState } from 'react';
import { ModelLevel } from './engine/types';
import {
  fetchGameplay,
  fetchHistory,
  fetchMetrics,
  ModelGameplay,
  ModelHistory,
  ModelMetrics,
} from './data';

export interface ArtifactData {
  metrics: Record<ModelLevel, ModelMetrics>;
  history: Record<ModelLevel, ModelHistory>;
  gameplay: Record<ModelLevel, ModelGameplay>;
}

/**
 * Load the numbers the models actually produced.
 *
 * Every page reads the same JSON the notebook exports, so a retrained model changes
 * the site without anyone editing a sentence by hand.
 */
export function useArtifacts() {
  const [data, setData] = useState<ArtifactData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchMetrics(), fetchHistory(), fetchGameplay()])
      .then(([metrics, history, gameplay]) => {
        if (active) {
          setData({ metrics, history, gameplay });
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'The measurements could not load.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { data, error };
}

export function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function params(value: number): string {
  return value.toLocaleString('en-US');
}

export function record(stats: { wins: number; draws: number; losses: number }): string {
  return `${stats.wins} / ${stats.draws} / ${stats.losses}`;
}
