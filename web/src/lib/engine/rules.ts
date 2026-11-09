import { Board, Player } from './types';

export const WINNING_LINES: readonly [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],             // Diagonals
];

export function checkWinner(board: Board): Player | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Player;
    }
  }
  return null;
}

export function getLegalMoves(board: Board): number[] {
  const legal: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === 0) legal.push(i);
  }
  return legal;
}

export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== 0);
}

export function isTerminal(board: Board): boolean {
  return checkWinner(board) !== null || isBoardFull(board);
}

export function playMove(board: Board, move: number, player: Player): Board {
  if (board[move] !== 0) {
    throw new Error(`Cell ${move} is already occupied`);
  }
  const next = [...board] as Board;
  next[move] = player;
  return next;
}

export function immediateWins(board: Board, player: Player): number[] {
  const legal = getLegalMoves(board);
  const wins: number[] = [];
  for (const move of legal) {
    const next = playMove(board, move, player);
    if (checkWinner(next) === player) {
      wins.push(move);
    }
  }
  return wins;
}

/**
 * Encodes board to shape (3, 3, 1) in player-to-move perspective:
 * own marks = +1, opponent marks = -1, empty = 0.
 */
export function toMoverPerspective(board: Board, player: Player): number[][][] {
  const tensor: number[][][] = [];
  for (let r = 0; r < 3; r++) {
    const row: number[][] = [];
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const val = board[idx] === 0 ? 0 : board[idx] * player;
      row.push([val]);
    }
    tensor.push(row);
  }
  return tensor;
}

const scoreCache = new Map<string, number>();

/** Minimax value for the player to move: +1 win, 0 draw, -1 loss. */
function minimaxScore(board: Board, player: Player): number {
  const winner = checkWinner(board);
  if (winner !== null) return winner === player ? 1 : -1;
  if (isBoardFull(board)) return 0;

  const key = `${board.join('')}:${player}`;
  const cached = scoreCache.get(key);
  if (cached !== undefined) return cached;

  let best = -Infinity;
  for (const move of getLegalMoves(board)) {
    const value = -minimaxScore(playMove(board, move, player), player === 1 ? -1 : 1);
    if (value > best) best = value;
  }
  scoreCache.set(key, best);
  return best;
}

/** Every move that preserves the best achievable result for the player to move. */
export function bestMoves(board: Board, player: Player): number[] {
  const best = minimaxScore(board, player);
  return getLegalMoves(board).filter(
    move => -minimaxScore(playMove(board, move, player), player === 1 ? -1 : 1) === best
  );
}

export function maskProbabilities(board: Board, probabilities: number[]): number[] {
  return probabilities.map((p, idx) => (board[idx] === 0 ? p : -Infinity));
}

export function getBestLegalMove(board: Board, probabilities: number[]): number {
  const masked = maskProbabilities(board, probabilities);
  let bestIdx = -1;
  let maxP = -Infinity;
  for (let i = 0; i < 9; i++) {
    if (masked[i] > maxP) {
      maxP = masked[i];
      bestIdx = i;
    }
  }
  return bestIdx;
}

