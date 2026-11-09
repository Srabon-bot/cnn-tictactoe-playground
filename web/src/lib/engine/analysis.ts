import { Board, GameFindings, MoveAnalysis, Player } from './types';
import { immediateWins } from './rules';

/** The tactical facts the report card needs, measured before the AI moves. */
export interface MoveContext {
  immediateWinMoves: number[];
  immediateThreatMoves: number[];
}

export function readMoveContext(board: Board, player: Player): MoveContext {
  return {
    immediateWinMoves: immediateWins(board, player),
    immediateThreatMoves: immediateWins(board, player === 1 ? -1 : 1),
  };
}

/**
 * Build the teaching record for one AI move.
 *
 * A missed win means the AI could have finished the game and chose something else.
 * A missed block means the opponent had exactly one immediate win and the AI did not
 * take that cell. When the opponent has two winning cells, no single block exists, so
 * the move is not counted against the model (the same rule the notebook uses).
 */
export function analyseModelMove(
  board: Board,
  player: Player,
  probabilities: number[],
  chosenMove: number,
  wasUnmaskedIllegal: boolean,
  isMemorizedBoard = false
): MoveAnalysis {
  const { immediateWinMoves, immediateThreatMoves } = readMoveContext(board, player);
  const isMissedWin =
    immediateWinMoves.length > 0 && !immediateWinMoves.includes(chosenMove);
  const isMissedBlock =
    immediateWinMoves.length === 0 &&
    immediateThreatMoves.length === 1 &&
    chosenMove !== immediateThreatMoves[0];

  return {
    board: [...board] as Board,
    player,
    move: chosenMove,
    probabilities: [...probabilities],
    isImmediateWinAvailable: immediateWinMoves.length > 0,
    isImmediateThreatAvailable: immediateThreatMoves.length > 0,
    isMissedWin,
    isMissedBlock,
    wasUnmaskedIllegal,
    isMemorizedBoard,
  };
}

export function summariseMoves(moves: MoveAnalysis[]): GameFindings {
  let missedWins = 0;
  let missedBlocks = 0;
  let illegalAttempts = 0;
  let familiarBoardsCount = 0;

  for (const move of moves) {
    if (move.isMissedWin) missedWins += 1;
    if (move.isMissedBlock) missedBlocks += 1;
    if (move.wasUnmaskedIllegal) illegalAttempts += 1;
    if (move.isMemorizedBoard) familiarBoardsCount += 1;
  }

  return {
    missedWins,
    missedBlocks,
    illegalAttempts,
    familiarBoardsCount,
    totalAIMoves: moves.length,
    summaryText: '',
  };
}
