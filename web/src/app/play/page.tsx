'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Board, CellValue, GameFindings, ModelLevel, MoveAnalysis, Player } from '@/lib/engine/types';
import { checkWinner, getLegalMoves, immediateWins, isBoardFull, isTerminal, playMove } from '@/lib/engine/rules';
import { loadModel, NeuralNetworkModel } from '@/lib/engine/inference';
import { fetchMemorizedBoards, fetchMetrics, fetchSampleExplanations, ModelMetrics } from '@/lib/data';
import { BoardComponent } from '@/components/Board';
import { LevelSelector } from '@/components/LevelSelector';
import { PostGameModal } from '@/components/PostGameModal';
import { RotateCcw, Sparkles, Volume2, VolumeX, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PlayPage() {
  const [level, setLevel] = useState<ModelLevel>('stable');
  const [playerMark, setPlayerMark] = useState<Player>(1); // 1 = X, -1 = O
  const [board, setBoard] = useState<Board>(() => new Array(9).fill(0) as Board);
  const [currentTurn, setCurrentTurn] = useState<Player>(1);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [movesHistory, setMovesHistory] = useState<MoveAnalysis[]>([]);
  const [lastMoveIdx, setLastMoveIdx] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Loaded artifacts data
  const [model, setModel] = useState<NeuralNetworkModel | null>(null);
  const [memorizedSet, setMemorizedSet] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<Record<ModelLevel, ModelMetrics> | null>(null);
  const [explanations, setExplanations] = useState<Record<ModelLevel, string> | null>(null);

  // Post game modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gameOutcome, setGameOutcome] = useState<'win' | 'loss' | 'draw' | null>(null);

  // Audio effects
  const playSound = useCallback((type: 'move' | 'win' | 'loss' | 'draw') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio not permitted or supported
    }
  }, [soundEnabled]);

  // Load model and artifact data on mount or level change
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const loaded = await loadModel(level);
        if (active) setModel(loaded);

        const [mBoards, mets, expls] = await Promise.all([
          fetchMemorizedBoards(),
          fetchMetrics(),
          fetchSampleExplanations(),
        ]);
        if (active) {
          const set = new Set(mBoards.map(b => b.join(',')));
          setMemorizedSet(set);
          setMetrics(mets);
          setExplanations(expls.models);
        }
      } catch (err) {
        console.error('Artifact load error:', err);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [level]);

  // Reset / start new game
  const resetGame = useCallback(() => {
    const emptyBoard = new Array(9).fill(0) as Board;
    setBoard(emptyBoard);
    setCurrentTurn(1); // X always starts
    setMovesHistory([]);
    setLastMoveIdx(null);
    setIsAiThinking(false);
    setIsModalOpen(false);
    setGameOutcome(null);
  }, []);

  // Handle user cell click
  const handleCellClick = (index: number) => {
    if (board[index] !== 0 || isAiThinking || isTerminal(board) || currentTurn !== playerMark) {
      return;
    }

    playSound('move');
    const nextBoard = playMove(board, index, playerMark);
    setBoard(nextBoard);
    setLastMoveIdx(index);

    const winner = checkWinner(nextBoard);
    if (winner !== null) {
      handleGameOver(winner === playerMark ? 'win' : 'loss');
      return;
    }
    if (isBoardFull(nextBoard)) {
      handleGameOver('draw');
      return;
    }

    setCurrentTurn(-playerMark as Player);
  };

  // AI Turn effect
  useEffect(() => {
    if (currentTurn === playerMark || isTerminal(board) || !model) {
      return;
    }

    setIsAiThinking(true);
    const aiPlayer = -playerMark as Player;

    const timer = setTimeout(() => {
      // Check pre-move conditions for educational findings
      const immediateWinMoves = immediateWins(board, aiPlayer);
      const immediateThreatMoves = immediateWins(board, playerMark);

      // Model evaluation
      const { probabilities, chosenMove, wasUnmaskedIllegal } = model.evaluateMove(board, aiPlayer);

      // Check if board is in memorized list (in mover perspective)
      const moverBoard = board.map(cell => cell * aiPlayer);
      const isMemorized = memorizedSet.has(moverBoard.join(','));

      const isMissedWin = immediateWinMoves.length > 0 && !immediateWinMoves.includes(chosenMove);
      const isMissedBlock = immediateThreatMoves.length === 1 && chosenMove !== immediateThreatMoves[0];

      const moveAnalysis: MoveAnalysis = {
        board: [...board] as Board,
        player: aiPlayer,
        move: chosenMove,
        probabilities,
        isImmediateWinAvailable: immediateWinMoves.length > 0,
        isImmediateThreatAvailable: immediateThreatMoves.length > 0,
        isMissedWin,
        isMissedBlock,
        wasUnmaskedIllegal,
        isMemorizedBoard: isMemorized,
      };

      const nextBoard = playMove(board, chosenMove, aiPlayer);
      playSound('move');
      setBoard(nextBoard);
      setLastMoveIdx(chosenMove);
      setMovesHistory(prev => [...prev, moveAnalysis]);
      setIsAiThinking(false);

      const winner = checkWinner(nextBoard);
      if (winner !== null) {
        handleGameOver(winner === playerMark ? 'win' : 'loss');
      } else if (isBoardFull(nextBoard)) {
        handleGameOver('draw');
      } else {
        setCurrentTurn(playerMark);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [board, currentTurn, playerMark, model, memorizedSet, playSound]);

  const handleGameOver = (outcome: 'win' | 'loss' | 'draw') => {
    setGameOutcome(outcome);
    if (outcome === 'win') {
      playSound('win');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      playSound(outcome);
    }
    setTimeout(() => setIsModalOpen(true), 600);
  };

  // Compile game-specific findings
  const computeFindings = (): GameFindings => {
    let missedWins = 0;
    let missedBlocks = 0;
    let illegalAttempts = 0;
    let familiarBoardsCount = 0;

    movesHistory.forEach(m => {
      if (m.isMissedWin) missedWins++;
      if (m.isMissedBlock) missedBlocks++;
      if (m.wasUnmaskedIllegal) illegalAttempts++;
      if (m.isMemorizedBoard) familiarBoardsCount++;
    });

    return {
      missedWins,
      missedBlocks,
      illegalAttempts,
      familiarBoardsCount,
      totalAIMoves: movesHistory.length,
      summaryText: '',
    };
  };

  const isHumanTurn = currentTurn === playerMark && !isTerminal(board);
  const terminal = isTerminal(board);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          Play Against the Neural Networks
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Choose an AI opponent to experience firsthand how different learning behaviors — barely learning, memorizing, and generalizing — translate into game moves.
        </p>
      </div>

      {/* Level Selection Cards */}
      <LevelSelector
        currentLevel={level}
        onSelectLevel={newLevel => {
          setLevel(newLevel);
          resetGame();
        }}
        disabled={isAiThinking}
      />

      {/* Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Board and Controls */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          {/* Status Bar */}
          <div className="w-full max-w-[360px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isAiThinking ? 'bg-amber-500 animate-ping' : isHumanTurn ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              <span className="text-zinc-800 dark:text-zinc-200">
                {terminal
                  ? 'Game Finished'
                  : isAiThinking
                  ? 'AI is calculating weights...'
                  : isHumanTurn
                  ? 'Your Turn'
                  : 'AI Turn'}
              </span>
            </div>

            {/* Overfit Memorization tag on current state */}
            {level === 'overfit' && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {memorizedSet.has(board.map(c => c * (-playerMark as Player)).join(','))
                  ? 'Familiar Board'
                  : 'New Board'}
              </span>
            )}
          </div>

          {/* 3x3 Board */}
          <BoardComponent
            board={board}
            onCellClick={handleCellClick}
            disabled={isAiThinking || terminal || currentTurn !== playerMark}
            lastMoveIndex={lastMoveIdx}
          />

          {/* Controls Bar */}
          <div className="w-full max-w-[360px] flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span>Play as:</span>
              <button
                disabled={board.some(c => c !== 0)}
                onClick={() => {
                  setPlayerMark(1);
                  resetGame();
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  playerMark === 1
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                X (First)
              </button>
              <button
                disabled={board.some(c => c !== 0)}
                onClick={() => {
                  setPlayerMark(-1);
                  resetGame();
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  playerMark === -1
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                O (Second)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label="Toggle Sound"
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Restart
              </button>
            </div>
          </div>

          {/* Quick analysis trigger button if finished */}
          {terminal && gameOutcome && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full max-w-[360px] py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Eye className="h-4 w-4" /> View Post-Game Breakdown & Heatmaps
            </button>
          )}
        </div>

        {/* Right Column: Real-time decision timeline */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">Live AI Decision Heatmaps</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inspect what the model saw and why it made its decisions on every turn.
              </p>
            </div>
            {movesHistory.length > 0 && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950">
                Active Match
              </span>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1">
            <MoveTimeline moves={movesHistory} modelLevel={level} />
          </div>
        </div>
      </div>

      {/* Post Game Modal */}
      {gameOutcome && (
        <PostGameModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          outcome={gameOutcome}
          level={level}
          moves={movesHistory}
          findings={computeFindings()}
          metrics={metrics ? metrics[level] : null}
          explanationText={explanations ? explanations[level] : ''}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
}

