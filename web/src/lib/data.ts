import { ModelLevel } from './engine/types';

export interface ModelMetrics {
  train_acc: number;
  val_acc: number;
  test_acc: number;
  train_loss: number;
  val_loss: number;
  params: number;
  illegal_rate: number;
  missed_win_rate: number;
  missed_block_rate: number;
}

export interface OpponentStats {
  games: number;
  wins: number;
  draws: number;
  losses: number;
  model_moves: number;
  illegal: number;
  win_chances: number;
  missed_wins: number;
  block_chances: number;
  missed_blocks: number;
  illegal_rate: number;
  missed_win_rate: number;
  missed_block_rate: number;
}

export interface ModelGameplay {
  random: OpponentStats;
  minimax: OpponentStats;
  overall: OpponentStats;
}

export interface ModelHistory {
  loss: number[];
  val_loss: number[];
  accuracy: number[];
  val_accuracy: number[];
}

export interface SampleExplanations {
  models: Record<ModelLevel, string>;
  concepts: Record<string, string>;
}

export async function fetchMetrics(): Promise<Record<ModelLevel, ModelMetrics>> {
  const res = await fetch('/artifacts/data/metrics.json');
  return res.json();
}

export async function fetchHistory(): Promise<Record<ModelLevel, ModelHistory>> {
  const res = await fetch('/artifacts/data/history.json');
  return res.json();
}

export async function fetchGameplay(): Promise<Record<ModelLevel, ModelGameplay>> {
  const res = await fetch('/artifacts/data/gameplay_results.json');
  return res.json();
}

export async function fetchMemorizedBoards(): Promise<number[][]> {
  const res = await fetch('/artifacts/data/memorized_boards.json');
  return res.json();
}

export async function fetchSampleExplanations(): Promise<SampleExplanations> {
  const res = await fetch('/artifacts/data/sample_explanations.json');
  return res.json();
}

