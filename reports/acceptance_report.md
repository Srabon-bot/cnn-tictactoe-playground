# TicTacLearn — Part A acceptance report

Generated from `artifacts/` on the current run.

Top-choice accuracy is the primary score: the network's first-ranked cell must be empty and optimal.
The post-mask value is shown beside it, because that is the score a player experiences.

| Check | Result | Value |
|---|---|---|
| Keras model underfit.keras exists | PASS | artifacts\models\underfit.keras |
| Browser model for underfit | PASS | weights.json fallback |
| Keras model overfit.keras exists | PASS | artifacts\models\overfit.keras |
| Browser model for overfit | PASS | weights.json fallback |
| Keras model stable.keras exists | PASS | artifacts\models\stable.keras |
| Browser model for stable | PASS | weights.json fallback |
| Plot curves_underfit.png exists | PASS | 135 KB |
| Plot curves_overfit.png exists | PASS | 118 KB |
| Plot curves_stable.png exists | PASS | 111 KB |
| Plot accuracy_comparison.png exists | PASS | 98 KB |
| Plot gameplay_wdl.png exists | PASS | 130 KB |
| Plot seen_vs_unseen_overfit.png exists | PASS | 58 KB |
| Plot heatmaps_same_board.png exists | PASS | 57 KB |
| Data metrics.json exists | PASS | 1 KB |
| Data history.json exists | PASS | 43 KB |
| Data gameplay_results.json exists | PASS | 3 KB |
| Data memorized_boards.json exists | PASS | 1 KB |
| Data overfit_subset_ids.json exists | PASS | 0 KB |
| Data sample_explanations.json exists | PASS | 3 KB |
| Data parity_test_vectors.json exists | PASS | 57 KB |
| artifacts.zip exists | PASS | 11.35 MB |
| Notebook has saved outputs | PASS | 38/38 cells |
| Notebook has no cell errors | PASS | 0 error cells |
| Every code cell has a markdown cell before it | PASS | all 38 code cells |
| Notebook runtime | PASS | 2.4 min (target: < 10 min) |
| Underfit validation accuracy (top choice) | PASS | 17.4% (mask 56.0%) (target: < 50%) |
| Underfit train accuracy is also low | PASS | 20.5% (mask 55.1%) (target: < 60%) |
| Underfit missed-win rate | PASS | 62.5% (target: > 30%) |
| Overfit train accuracy | PASS | 100.0% (mask 100.0%) (target: >= 98%) |
| Overfit train-validation gap | PASS | 46.3% (target: >= 25 points) |
| Stable test accuracy | PASS | 95.9% (mask 95.9%) (target: >= 95%) |
| Stable vs random | PASS | 944W / 56D / 0L (target: 0 losses, >= 90% wins) |
| Stable vs minimax | PASS | 0W / 200D / 0L (target: 0 losses) |
| Stable missed-win rate | PASS | 0.0% (target: < 1%) |
| Stable missed-block rate | PASS | 0.0% (target: < 1%) |
| Parity vectors | PASS | 20 boards/model (target: >= 20 per model) |
| Two full runs identical | PASS | metrics match (target: identical) |

**All checks passed.**