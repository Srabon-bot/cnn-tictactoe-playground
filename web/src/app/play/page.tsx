"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Board, GameFindings, ModelLevel, MoveAnalysis, Player } from "@/lib/engine/types";
import { WINNING_LINES, checkWinner, isBoardFull, isTerminal, playMove } from "@/lib/engine/rules";
import { loadModel, NeuralNetworkModel } from "@/lib/engine/inference";
import { analyseModelMove, summariseMoves } from "@/lib/engine/analysis";
import {
  fetchGameplay,
  fetchHistory,
  fetchMemorizedBoards,
  fetchMetrics,
  fetchSampleExplanations,
  ModelGameplay,
  ModelHistory,
  ModelMetrics,
} from "@/lib/data";
import { BoardComponent } from "@/components/Board";
import { LevelSelector } from "@/components/LevelSelector";
import { MoveTimeline } from "@/components/MoveTimeline";
import { PostGameModal } from "@/components/PostGameModal";
import confetti from "canvas-confetti";

type Outcome = "win" | "loss" | "draw";

const LEVEL_TEXT: Record<ModelLevel, { name: string; line: string }> = {
  underfit: {
    name: "Beginner",
    line: "Two filters and three passes over the data. It is the control that shows what too little capacity looks like.",
  },
  overfit: {
    name: "Memorizer",
    line: "Trained only on sixty boards. It is excellent on those positions and uncertain everywhere else.",
  },
  stable: {
    name: "Steady",
    line: "The full training set with symmetry augmentation and dropout. At play time its output is averaged over the board's eight symmetries, and a forced win or a single forced block is always taken.",
  },
};

function findWinningLine(board: Board): [number, number, number] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
      return line;
    }
  }
  return null;
}

export default function PlayPage() {
  const [level, setLevel] = useState<ModelLevel>("stable");
  const [playerMark, setPlayerMark] = useState<Player>(1);
  const [board, setBoard] = useState<Board>(() => new Array(9).fill(0) as Board);
  const [currentTurn, setCurrentTurn] = useState<Player>(1);
  const [movesHistory, setMovesHistory] = useState<MoveAnalysis[]>([]);
  const [lastMoveIdx, setLastMoveIdx] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [model, setModel] = useState<NeuralNetworkModel | null>(null);
  const [memorizedSet, setMemorizedSet] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<Record<ModelLevel, ModelMetrics> | null>(null);
  const [gameplay, setGameplay] = useState<Record<ModelLevel, ModelGameplay> | null>(null);
  const [history, setHistory] = useState<Record<ModelLevel, ModelHistory> | null>(null);
  const [explanations, setExplanations] = useState<Record<ModelLevel, string> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("level");
    if (requested === "underfit" || requested === "overfit" || requested === "stable") {
      // The query string is external state; resolving it once on mount is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLevel(requested);
    }
  }, []);

  const playSound = useCallback((type: "move" | "win" | "loss" | "draw") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      if (!audioContext.current) {
        const webkit = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        audioContext.current = new AudioContext({ latencyHint: "interactive" });
        if (!audioContext.current && webkit) audioContext.current = new webkit();
      }
      const ctx = audioContext.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, now);

      if (type === "move") {
        osc.frequency.setValueAtTime(392, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.17);
      } else if (type === "win") {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.44);
      } else if (type === "loss") {
        osc.frequency.setValueAtTime(196, now);
        gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.52);
      } else {
        osc.frequency.setValueAtTime(329.63, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.32);
      }
    } catch {
      // Audio is optional; a blocked context must not break the game.
    }
  }, [soundEnabled]);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadModel(level),
      fetchMemorizedBoards(),
      fetchMetrics(),
      fetchGameplay(),
      fetchHistory(),
      fetchSampleExplanations(),
    ])
      .then(([loaded, boards, mets, games, curves, expls]) => {
        if (!active) return;
        setModel(loaded);
        setMemorizedSet(new Set(boards.map((row) => row.join(","))));
        setMetrics(mets);
        setGameplay(games);
        setHistory(curves);
        setExplanations(expls.models);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "The artifacts could not load.");
        }
      });
    return () => {
      active = false;
    };
  }, [level]);

  const resetGame = useCallback(() => {
    setBoard(new Array(9).fill(0) as Board);
    setCurrentTurn(1);
    setMovesHistory([]);
    setLastMoveIdx(null);
    setOutcome(null);
    setIsModalOpen(false);
  }, []);

  const finishGame = useCallback((result: Outcome) => {
    setOutcome(result);
    playSound(result);
    if (result === "win") {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 }, colors: ["#1f6f73", "#dfe9e7", "#22201c"] });
    }
    window.setTimeout(() => setIsModalOpen(true), 450);
  }, [playSound]);

  const handleCellClick = (index: number) => {
    if (board[index] !== 0 || currentTurn !== playerMark || isTerminal(board) || model === null) {
      return;
    }

    playSound("move");
    const nextBoard = playMove(board, index, playerMark);
    setBoard(nextBoard);
    setLastMoveIdx(index);

    const winner = checkWinner(nextBoard);
    if (winner !== null) {
      finishGame(winner === playerMark ? "win" : "loss");
      return;
    }
    if (isBoardFull(nextBoard)) {
      finishGame("draw");
      return;
    }
    setCurrentTurn(-playerMark as Player);
  };

  useEffect(() => {
    if (currentTurn === playerMark || isTerminal(board) || model === null) {
      return;
    }
    const aiPlayer = -playerMark as Player;
    const timer = window.setTimeout(() => {
      const evaluation = model.evaluateMove(
        board,
        aiPlayer,
        level === "stable" ? "steady" : "plain"
      );
      const moverBoard = board.map((cell) => cell * aiPlayer);
      const analysis = analyseModelMove(
        board,
        aiPlayer,
        evaluation.probabilities,
        evaluation.chosenMove,
        evaluation.wasUnmaskedIllegal,
        memorizedSet.has(moverBoard.join(","))
      );

      const nextBoard = playMove(board, evaluation.chosenMove, aiPlayer);
      playSound("move");
      setBoard(nextBoard);
      setLastMoveIdx(evaluation.chosenMove);
      setMovesHistory((previous) => [...previous, analysis]);

      const winner = checkWinner(nextBoard);
      if (winner !== null) {
        finishGame(winner === playerMark ? "win" : "loss");
      } else if (isBoardFull(nextBoard)) {
        finishGame("draw");
      } else {
        setCurrentTurn(playerMark);
      }
    }, 480);
    return () => window.clearTimeout(timer);
  }, [board, currentTurn, playerMark, model, level, memorizedSet, playSound, finishGame]);

  const handleLevel = (next: ModelLevel) => {
    if (next === level) return;
    setModel(null);
    setLevel(next);
    resetGame();
  };

  const handleMark = (mark: Player) => {
    if (mark === playerMark) return;
    setPlayerMark(mark);
    resetGame();
  };

  const terminal = isTerminal(board);
  const winningLine = terminal ? findWinningLine(board) : null;
  const modelName = LEVEL_TEXT[level].name;
  const isHumanTurn = currentTurn === playerMark && !terminal && model !== null;
  const findings: GameFindings = summariseMoves(movesHistory);
  const currentMetrics = metrics?.[level] ?? null;
  const currentGameplay = gameplay?.[level] ?? null;
  const explanation = explanations?.[level] ?? "";

  let status = "Your turn.";
  if (loadError) status = "The network could not load.";
  else if (!model) status = "Loading the network.";
  else if (outcome === "win") status = "You won.";
  else if (outcome === "loss") status = `${modelName} won.`;
  else if (outcome === "draw") status = "A draw.";
  else if (!isHumanTurn) status = `${modelName} is reading the board.`;

  return (
    <main>
      <div className="container">
        <div className="page-head page-head-row">
          <div>
            <h1>Play the three networks</h1>
            <p className="lead">
              Put a mark on the board. The network answers with the cell it scores highest,
              and the report shows what it missed.
            </p>
          </div>
          <div className="page-head-actions">
            <button type="button" className="btn btn--small" onClick={resetGame}>
              New game
            </button>
          </div>
        </div>

        <section className="section section--tight" aria-label="The board">
          <div className="play-layout">
            <div className="board-column">
              <div className="board-status" aria-live="polite">
                <strong>{status}</strong>
                <span className="label">
                  {outcome ? "Match complete" : currentTurn === 1 ? "X to move" : "O to move"}
                </span>
              </div>
              <div className="board-wrap">
                <BoardComponent
                  board={board}
                  onCellClick={handleCellClick}
                  disabled={!isHumanTurn}
                  winningLine={winningLine}
                  lastMoveIndex={lastMoveIdx}
                />
              </div>
              <div className="sound-row">
                <span className="muted">Quiet sound effects</span>
                <button
                  type="button"
                  className="switch"
                  aria-pressed={soundEnabled}
                  onClick={() => setSoundEnabled((value) => !value)}
                >
                  <span className="switch-track" aria-hidden="true" />
                  {soundEnabled ? "On" : "Off"}
                </button>
              </div>
              {loadError ? (
                <p role="alert" className="note-block" style={{ marginTop: 24 }}>
                  {loadError}
                </p>
              ) : null}
            </div>

            <aside className="play-side" aria-label="Opponent">
              <div className="side-block">
                <h2>Opponent</h2>
                <LevelSelector
                  currentLevel={level}
                  onSelectLevel={handleLevel}
                  disabled={movesHistory.length > 0 && !terminal}
                />
                <p style={{ marginTop: 12 }}>{LEVEL_TEXT[level].line}</p>
              </div>

              <div className="side-block">
                <h2>{modelName} at a glance</h2>
                <div className="side-readout">
                  <div>
                    <strong>
                      {currentMetrics ? `${(currentMetrics.test_acc * 100).toFixed(1)}%` : "…"}
                    </strong>
                    <span>test accuracy</span>
                  </div>
                  <div>
                    <strong>
                      {currentGameplay
                        ? `${(currentGameplay.overall.missed_win_rate * 100).toFixed(1)}%`
                        : "…"}
                    </strong>
                    <span>missed wins</span>
                  </div>
                  <div>
                    <strong>{currentMetrics ? currentMetrics.params.toLocaleString("en-US") : "…"}</strong>
                    <span>parameters</span>
                  </div>
                </div>
              </div>

              <div className="side-block">
                <h2>Your mark</h2>
                <div className="seg" role="group" aria-label="Choose your mark">
                  <button
                    type="button"
                    aria-pressed={playerMark === 1}
                    onClick={() => handleMark(1)}
                  >
                    X first
                  </button>
                  <button
                    type="button"
                    aria-pressed={playerMark === -1}
                    onClick={() => handleMark(-1)}
                  >
                    O second
                  </button>
                </div>
                <p style={{ marginTop: 12 }}>
                  X always moves first. Choose O if you want the network to open the game.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="timeline-heading">
          <div className="section-head section-head--wide">
            <h2 id="timeline-heading">Every move, opened</h2>
            <p className="section-note">
              The bar under each cell is the network&apos;s probability. Open a move to see
              the nine scores and whether the move took a win or a block.
            </p>
          </div>
          <MoveTimeline moves={movesHistory} modelLevel={level} />
        </section>
      </div>

      <PostGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        outcome={outcome ?? "draw"}
        level={level}
        moves={movesHistory}
        findings={findings}
        metrics={currentMetrics}
        gameplay={gameplay}
        history={history}
        explanationText={explanation}
        onPlayAgain={resetGame}
      />
    </main>
  );
}
