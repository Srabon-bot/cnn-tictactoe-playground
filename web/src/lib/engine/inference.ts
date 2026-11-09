import { Board, ModelLevel, ModelWeightsPayload, Player } from './types';
import { getBestLegalMove, immediateWins, toMoverPerspective } from './rules';

/** The eight board symmetries, as index permutations (four turns, each mirrored). */
const SYMMETRY_PERMS: number[][] = (() => {
  const base = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const rotate = (grid: number[]): number[] => [
    grid[6], grid[3], grid[0],
    grid[7], grid[4], grid[1],
    grid[8], grid[5], grid[2],
  ];
  const mirror = (grid: number[]): number[] => [
    grid[2], grid[1], grid[0],
    grid[5], grid[4], grid[3],
    grid[8], grid[7], grid[6],
  ];
  const perms: number[][] = [];
  for (const reflected of [false, true]) {
    let grid = reflected ? mirror(base) : base;
    for (let turn = 0; turn < 4; turn += 1) {
      perms.push(grid);
      grid = rotate(grid);
    }
  }
  return perms;
})();

function applyPermutation<T>(values: T[], perm: number[]): T[] {
  return perm.map(index => values[index]);
}

function inversePermutation(perm: number[]): number[] {
  const inverse = new Array<number>(perm.length);
  perm.forEach((target, source) => {
    inverse[target] = source;
  });
  return inverse;
}

export class NeuralNetworkModel {
  readonly level: ModelLevel;
  readonly weights: ModelWeightsPayload;

  constructor(level: ModelLevel, weights: ModelWeightsPayload) {
    this.level = level;
    this.weights = weights;
  }

  /**
   * Run 2D convolution with same-padding (padding=1 for 3x3 kernel) and ReLU.
   * Input shape: (3, 3, inChannels)
   * Kernel shape: (3, 3, inChannels, outChannels)
   * Bias shape: (outChannels)
   */
  private conv2d(
    input: number[][][],
    kernelData: number[],
    biasData: number[],
    inChannels: number,
    outChannels: number
  ): number[][][] {
    const H = 3;
    const W = 3;
    const output: number[][][] = [];

    // Helper to get kernel weight at [kr, kc, inC, outC]
    // Flattened index in Keras: ((kr * 3 + kc) * inChannels + inC) * outChannels + outC
    const getK = (kr: number, kc: number, inC: number, outC: number): number => {
      const idx = ((kr * 3 + kc) * inChannels + inC) * outChannels + outC;
      return kernelData[idx];
    };

    for (let r = 0; r < H; r++) {
      const row: number[][] = [];
      for (let c = 0; c < W; c++) {
        const pixel: number[] = new Array(outChannels);
        for (let oc = 0; oc < outChannels; oc++) {
          let sum = biasData[oc];
          for (let kr = 0; kr < 3; kr++) {
            const inR = r + kr - 1;
            if (inR < 0 || inR >= H) continue;
            for (let kc = 0; kc < 3; kc++) {
              const inC = c + kc - 1;
              if (inC < 0 || inC >= W) continue;
              for (let ic = 0; ic < inChannels; ic++) {
                sum += input[inR][inC][ic] * getK(kr, kc, ic, oc);
              }
            }
          }
          // ReLU activation
          pixel[oc] = Math.max(0, sum);
        }
        row.push(pixel);
      }
      output.push(row);
    }
    return output;
  }

  /**
   * Flatten tensor (H, W, C) to 1D array.
   */
  private flatten(input: number[][][]): number[] {
    const flat: number[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        for (let ch = 0; ch < input[r][c].length; ch++) {
          flat.push(input[r][c][ch]);
        }
      }
    }
    return flat;
  }

  /**
   * Dense layer.
   * Kernel shape: (inFeatures, outFeatures)
   * Bias shape: (outFeatures)
   */
  private dense(
    input: number[],
    kernelData: number[],
    biasData: number[],
    inFeatures: number,
    outFeatures: number,
    activation: 'relu' | 'softmax'
  ): number[] {
    const output: number[] = new Array(outFeatures);
    for (let j = 0; j < outFeatures; j++) {
      let sum = biasData[j];
      for (let i = 0; i < inFeatures; i++) {
        sum += input[i] * kernelData[i * outFeatures + j];
      }
      output[j] = sum;
    }

    if (activation === 'relu') {
      return output.map(v => Math.max(0, v));
    }

    if (activation === 'softmax') {
      let maxVal = -Infinity;
      for (let j = 0; j < outFeatures; j++) {
        if (output[j] > maxVal) maxVal = output[j];
      }
      let sumExp = 0;
      const exps = new Array(outFeatures);
      for (let j = 0; j < outFeatures; j++) {
        const e = Math.exp(output[j] - maxVal);
        exps[j] = e;
        sumExp += e;
      }
      return exps.map(v => v / sumExp);
    }

    return output;
  }

  /**
   * Forward pass: computes softmax probabilities over the 9 cells.
   */
  predict(boardTensor: number[][][]): number[] {
    let currentTensor = boardTensor;
    let flatVector: number[] = [];
    let isFlattened = false;

    for (const layer of this.weights.layers) {
      if (layer.class === 'Conv2D') {
        const kernel = layer.weights[0];
        const bias = layer.weights[1];
        const inC = kernel.shape[2];
        const outC = kernel.shape[3];
        currentTensor = this.conv2d(currentTensor, kernel.data, bias.data, inC, outC);
      } else if (layer.class === 'Dense') {
        if (!isFlattened) {
          flatVector = this.flatten(currentTensor);
          isFlattened = true;
        }
        const kernel = layer.weights[0];
        const bias = layer.weights[1];
        const inFeatures = kernel.shape[0];
        const outFeatures = kernel.shape[1];
        // If last layer (outFeatures === 9), it's softmax, else relu
        const activation = outFeatures === 9 ? 'softmax' : 'relu';
        flatVector = this.dense(flatVector, kernel.data, bias.data, inFeatures, outFeatures, activation);
      }
    }

    return flatVector;
  }

  /**
   * Average the network's nine-cell output over the eight board symmetries.
   * A rotated board is the same game, so this steadying step removes a little
   * orientation noise without changing the weights.
   */
  predictAveraged(board: Board, player: Player): number[] {
    const total = new Array(9).fill(0);
    for (const perm of SYMMETRY_PERMS) {
      const symmetricBoard = applyPermutation([...board], perm) as Board;
      const prediction = this.predict(toMoverPerspective(symmetricBoard, player));
      const restored = applyPermutation(prediction, inversePermutation(perm));
      for (let index = 0; index < 9; index += 1) {
        total[index] += restored[index];
      }
    }
    return total.map(value => value / SYMMETRY_PERMS.length);
  }

  /**
   * Evaluates a board for player, returning raw probabilities, the chosen move,
   * and whether the raw highest probability cell was occupied.
   *
   * `steady` is the policy used by the steady opponent. It averages the model over
   * the eight symmetries and applies two safe tactical guards: take a forced win,
   * and block the opponent's only immediate threat. Both guards prevent an
   * immediate loss; neither invents a move when the position is already decided.
   */
  evaluateMove(
    board: Board,
    player: Player,
    mode: 'plain' | 'steady' = 'plain'
  ): {
    probabilities: number[];
    chosenMove: number;
    wasUnmaskedIllegal: boolean;
  } {
    const probabilities =
      mode === 'steady' ? this.predictAveraged(board, player) : this.predict(toMoverPerspective(board, player));

    let rawArgmax = 0;
    let maxP = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (probabilities[i] > maxP) {
        maxP = probabilities[i];
        rawArgmax = i;
      }
    }
    const wasUnmaskedIllegal = board[rawArgmax] !== 0;

    let chosenMove = getBestLegalMove(board, probabilities);
    if (mode === 'steady') {
      const wins = immediateWins(board, player);
      if (wins.length > 0) {
        chosenMove = wins.reduce((best, move) =>
          probabilities[move] > probabilities[best] ? move : best
        );
      } else {
        const opponent = (player === 1 ? -1 : 1) as Player;
        const threats = immediateWins(board, opponent);
        if (threats.length === 1) {
          chosenMove = threats[0];
        }
      }
    }

    return {
      probabilities,
      chosenMove,
      wasUnmaskedIllegal,
    };
  }
}

// Model registry cache
const modelCache = new Map<ModelLevel, NeuralNetworkModel>();

export async function loadModel(level: ModelLevel): Promise<NeuralNetworkModel> {
  const cached = modelCache.get(level);
  if (cached) return cached;

  const res = await fetch(`/artifacts/models/${level}/weights.json`);
  if (!res.ok) {
    throw new Error(`Failed to load weights for ${level}: ${res.statusText}`);
  }
  const payload: ModelWeightsPayload = await res.json();
  const model = new NeuralNetworkModel(level, payload);
  modelCache.set(level, model);
  return model;
}

