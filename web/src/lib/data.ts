import { ModelLevel } from './engine/types';

export interface ModelMetrics {
  train_acc: number;
  val_acc: number;
  test_acc: number;
  train_acc_masked?: number;
  val_acc_masked?: number;
  test_acc_masked?: number;
  train_loss: number;
  val_loss: number;
  params: number;
  illegal_rate: number;
  missed_win_rate: number;
  missed_block_rate: number;
  policy?: 'plain' | 'steady';
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
  accuracy_masked?: number[];
  val_accuracy_masked?: number[];
}

export interface SampleExplanations {
  models: Record<ModelLevel, string>;
  concepts: Record<string, string>;
}

export interface AcceptanceCheck {
  name: string;
  target: string;
  result: string;
  passed: boolean;
}

export interface AcceptanceReport {
  generated_at: string;
  runtime_seconds: number;
  notebook?: { executed_cells: number; code_cells: number; error_cells: number };
  reproducibility: { passed: boolean; detail: string; measured?: boolean };
  metrics?: Record<ModelLevel, Partial<ModelMetrics>>;
  gameplay?: Record<ModelLevel, { random: Partial<OpponentStats>; minimax: Partial<OpponentStats> }>;
  checks: AcceptanceCheck[];
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchMetrics(): Promise<Record<ModelLevel, ModelMetrics>> {
  return getJson('/artifacts/data/metrics.json');
}

export function fetchHistory(): Promise<Record<ModelLevel, ModelHistory>> {
  return getJson('/artifacts/data/history.json');
}

export function fetchGameplay(): Promise<Record<ModelLevel, ModelGameplay>> {
  return getJson('/artifacts/data/gameplay_results.json');
}

export function fetchMemorizedBoards(): Promise<number[][]> {
  return getJson('/artifacts/data/memorized_boards.json');
}

export function fetchSampleExplanations(): Promise<SampleExplanations> {
  return getJson('/artifacts/data/sample_explanations.json');
}

export function fetchAcceptance(): Promise<AcceptanceReport> {
  return getJson('/artifacts/data/acceptance.json');
}
