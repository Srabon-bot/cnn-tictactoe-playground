# TicTacLearn — Part A acceptance report

Generated from `artifacts/` on the current run.

| Check | Result | Value |
|---|---|---|
| Keras model underfit.keras exists | PASS | artifacts\models\underfit.keras |
| Browser model for underfit | PASS | weights.json fallback |
| Keras model overfit.keras exists | PASS | artifacts\models\overfit.keras |
| Browser model for overfit | PASS | weights.json fallback |
| Keras model stable.keras exists | PASS | artifacts\models\stable.keras |
| Browser model for stable | PASS | weights.json fallback |
| Plot curves_underfit.png exists | PASS | 117 KB |
| Plot curves_overfit.png exists | PASS | 95 KB |
| Plot curves_stable.png exists | PASS | 100 KB |
| Plot accuracy_comparison.png exists | PASS | 105 KB |
| Plot gameplay_wdl.png exists | PASS | 132 KB |
| Plot seen_vs_unseen_overfit.png exists | PASS | 58 KB |
| Plot heatmaps_same_board.png exists | PASS | 57 KB |
| Data metrics.json exists | PASS | 1 KB |
| Data history.json exists | PASS | 30 KB |
| Data gameplay_results.json exists | PASS | 4 KB |
| Data memorized_boards.json exists | PASS | 1 KB |
| Data overfit_subset_ids.json exists | PASS | 0 KB |
| Data sample_explanations.json exists | PASS | 3 KB |
| Data parity_test_vectors.json exists | PASS | 57 KB |
| artifacts.zip exists | PASS | 11.30 MB |
| Notebook has saved outputs | PASS | 38/38 cells |
| Notebook has no cell errors | PASS | 0 error cells |
| Every code cell has a markdown cell before it | PASS | all 38 code cells |
| Notebook runtime | PASS | 2.0 min (target: < 10 min) |
| Underfit validation accuracy | FAIL | 56.0% (target: < 50%) |
| Underfit train accuracy is also low | PASS | 55.1% (target: < 60%) |
| Underfit missed-win rate | PASS | 62.5% (target: > 30%) |
| Overfit train accuracy | PASS | 100.0% (target: >= 98%) |
| Overfit train-validation gap | PASS | 26.2% (target: >= 25 points) |
| Stable test accuracy | PASS | 95.9% (target: >= 95%) |
| Stable vs random | FAIL | 924W / 60D / 16L (target: 0 losses, >= 90% wins) |
| Stable vs minimax | FAIL | 0W / 173D / 27L (target: 0 losses) |
| Stable missed-win rate | FAIL | 16.2% (target: < 1%) |
| Stable missed-block rate | FAIL | 10.0% (target: < 1%) |
| Parity vectors | PASS | 20 boards/model (target: >= 20 per model) |
| Two full runs identical | PASS | metrics match (target: identical) |

**5 check(s) failed.**