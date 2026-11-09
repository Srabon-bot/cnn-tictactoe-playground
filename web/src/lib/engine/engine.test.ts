import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { checkWinner, isTerminal, toMoverPerspective } from './rules';
import { NeuralNetworkModel } from './inference';
import { Board, ModelLevel, ParitySample } from './types';

describe('Game Rules', () => {
  it('detects row wins, col wins, and diagonal wins', () => {
    const rowWin: Board = [1, 1, 1, -1, -1, 0, 0, 0, 0];
    expect(checkWinner(rowWin)).toBe(1);

    const colWin: Board = [-1, 1, 0, -1, 1, 0, -1, 0, 0];
    expect(checkWinner(colWin)).toBe(-1);

    const diagWin: Board = [1, -1, 0, 0, 1, -1, 0, 0, 1];
    expect(checkWinner(diagWin)).toBe(1);
  });

  it('detects draws when board is full with no winner', () => {
    const drawBoard: Board = [
      1, -1, 1,
      -1, 1, -1,
      -1, 1, -1,
    ];
    expect(checkWinner(drawBoard)).toBeNull();
    expect(isTerminal(drawBoard)).toBe(true);
  });

  it('correctly flips player perspective', () => {
    const board: Board = [1, -1, 0, 0, 0, 0, 0, 0, 0];
    const tensorO = toMoverPerspective(board, -1);
    // When O moves (-1), X (1) becomes -1, and O (-1) becomes +1
    expect(tensorO[0][0][0]).toBe(-1);
    expect(tensorO[0][1][0]).toBe(1);
    expect(tensorO[0][2][0]).toBe(0);
  });
});

describe('Numerical Parity Test (JavaScript vs Python Ground Truth)', () => {
  // Vitest runs from the web/ package, so resolve artifacts from the working directory.
  const artifactsDir = path.resolve(process.cwd(), 'public/artifacts');
  const parityPath = path.join(artifactsDir, 'data/parity_test_vectors.json');
  const parityData: Record<ModelLevel, ParitySample[]> = JSON.parse(
    fs.readFileSync(parityPath, 'utf-8')
  );

  const models: ModelLevel[] = ['underfit', 'overfit', 'stable'];

  models.forEach(modelName => {
    it(`verifies exact forward-pass parity for ${modelName} model`, () => {
      const weightsPath = path.join(artifactsDir, `models/${modelName}/weights.json`);
      const weightsPayload = JSON.parse(fs.readFileSync(weightsPath, 'utf-8'));
      const model = new NeuralNetworkModel(modelName, weightsPayload);

      const samples = parityData[modelName];
      expect(samples.length).toBeGreaterThanOrEqual(20);

      for (let s = 0; s < samples.length; s++) {
        const sample = samples[s];
        const jsProbs = model.predict(sample.input);
        const pyProbs = sample.probabilities;

        expect(jsProbs.length).toBe(9);
        expect(pyProbs.length).toBe(9);

        // Check probability match within float tolerance 1e-4
        for (let i = 0; i < 9; i++) {
          expect(Math.abs(jsProbs[i] - pyProbs[i])).toBeLessThan(0.0005);
        }

        // Check masked move choice
        const evalResult = model.evaluateMove(sample.board as Board, sample.mover as 1 | -1);
        expect(evalResult.chosenMove).toBe(sample.masked_choice);
      }
    });
  });
});

