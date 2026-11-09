import { describe, expect, it } from 'vitest';
import { analyseModelMove, readMoveContext, summariseMoves } from './analysis';
import { bestMoves, checkWinner, getBestLegalMove, getLegalMoves } from './rules';
import { Board } from './types';

/** Probabilities that point at one chosen cell and share the rest. */
function probabilitiesAt(chosen: number): number[] {
  return Array.from({ length: 9 }, (_, index) => (index === chosen ? 0.9 : 0.0125));
}

describe('Game findings', () => {
  it('flags a missed immediate win when the AI chooses another legal cell', () => {
    // X has 1-2 open at cell 2; cell 5 is a legal but non-winning move.
    const board: Board = [1, 1, 0, -1, -1, 0, 0, 0, 0];
    const context = readMoveContext(board, 1);
    expect(context.immediateWinMoves).toEqual([2]);

    const move = analyseModelMove(board, 1, probabilitiesAt(5), 5, false);
    expect(move.isMissedWin).toBe(true);
    expect(move.isMissedBlock).toBe(false);
  });

  it('does not flag a missed win when the AI takes the winning cell', () => {
    const board: Board = [1, 1, 0, -1, -1, 0, 0, 0, 0];
    const move = analyseModelMove(board, 1, probabilitiesAt(2), 2, false);
    expect(move.isMissedWin).toBe(false);
  });

  it('flags a missed block when the opponent has exactly one winning cell', () => {
    // O is to move; X threatens cell 2, and the AI plays cell 8 instead.
    const board: Board = [1, 1, 0, 0, -1, 0, 0, 0, 0];
    const context = readMoveContext(board, -1);
    expect(context.immediateThreatMoves).toEqual([2]);

    const move = analyseModelMove(board, -1, probabilitiesAt(8), 8, false);
    expect(move.isMissedBlock).toBe(true);
  });

  it('does not count a double threat as a missed block', () => {
    // X threatens cell 1 (column 1-4-7) and cell 8 (diagonal 0-4-8); no single block works.
    const board: Board = [1, 0, 1, -1, 1, -1, -1, 1, 0];
    const context = readMoveContext(board, -1);
    expect(context.immediateThreatMoves.length).toBe(2);

    const move = analyseModelMove(board, -1, probabilitiesAt(8), 8, false);
    expect(move.isMissedBlock).toBe(false);
  });

  it('keeps an immediate win ahead of a block in the report card', () => {
    // X can win at cell 2 and also faces a threat; the notebook counts the win.
    const board: Board = [1, 1, 0, -1, -1, 0, 0, 0, 0];
    const move = analyseModelMove(board, 1, probabilitiesAt(5), 5, false);
    expect(move.isMissedWin).toBe(true);
    expect(move.isMissedBlock).toBe(false);
  });

  it('summarises the move records for the post-game modal', () => {
    const winBoard: Board = [1, 1, 0, -1, -1, 0, 0, 0, 0];
    const moves = [
      analyseModelMove(winBoard, 1, probabilitiesAt(5), 5, true, true),
      analyseModelMove(winBoard, 1, probabilitiesAt(2), 2, false, false),
    ];

    const findings = summariseMoves(moves);
    expect(findings.missedWins).toBe(1);
    expect(findings.illegalAttempts).toBe(1);
    expect(findings.familiarBoardsCount).toBe(1);
    expect(findings.totalAIMoves).toBe(2);
  });
});

describe('Minimax reference moves', () => {
  it('takes the immediate win', () => {
    const board: Board = [1, 1, 0, -1, -1, 0, 0, 0, 0];
    expect(bestMoves(board, 1)).toEqual([2]);
  });

  it('returns legal replies even when the position is already lost', () => {
    const board: Board = [1, 0, 1, -1, 1, -1, -1, 1, 0];
    const moves = bestMoves(board, -1);
    expect(moves.length).toBeGreaterThan(0);
    for (const move of moves) {
      const next = [...board] as Board;
      next[move] = -1;
      expect(checkWinner(next)).toBeNull();
    }
  });

  it('never returns an occupied cell', () => {
    const board: Board = [1, 0, 0, 0, -1, 0, 0, 0, 0];
    const legal = new Set(getLegalMoves(board));
    for (const move of bestMoves(board, 1)) {
      expect(legal.has(move)).toBe(true);
    }
  });

  it('agrees with masked probability selection when the model is optimal', () => {
    const board: Board = [1, 1, 0, -1, -1, 0, 0, 0, 0];
    const optimal = new Set(bestMoves(board, 1));
    const probabilities = probabilitiesAt(2);
    expect(optimal.has(getBestLegalMove(board, probabilities))).toBe(true);
  });
});
