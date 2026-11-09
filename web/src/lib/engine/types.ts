export type Player = 1 | -1; // 1 = X, -1 = O
export type CellValue = 1 | -1 | 0; // 0 = Empty
export type Board = [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue
];

export type ModelLevel = 'underfit' | 'overfit' | 'stable';

export interface WeightTensor {
  shape: number[];
  data: number[];
}

export interface LayerPayload {
  name: string;
  class: string;
  weights: WeightTensor[];
}

export interface ModelWeightsPayload {
  input_shape: number[];
  input_encoding: string;
  output: string;
  model_config: any;
  layers: LayerPayload[];
}

export interface ParitySample {
  board: number[];
  mover: number;
  input: number[][][];
  probabilities: number[];
  masked_choice: number;
  optimal_moves: number[];
}

export interface MoveAnalysis {
  board: Board;
  player: Player;
  move: number;
  probabilities: number[];
  isImmediateWinAvailable: boolean;
  isImmediateThreatAvailable: boolean;
  isMissedWin: boolean;
  isMissedBlock: boolean;
  wasUnmaskedIllegal: boolean;
  isMemorizedBoard?: boolean;
}

export interface GameFindings {
  missedWins: number;
  missedBlocks: number;
  illegalAttempts: number;
  familiarBoardsCount: number;
  totalAIMoves: number;
  summaryText: string;
}

