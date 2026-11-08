# PRD: Tic-Tac-Toe CNN Project (Notebook first, then Game Website)

**Part A (build first):** Google Colab notebook (`.ipynb`) plus exported artifacts
**Part B (build second):** Next.js game website that consumes Part A's artifacts
**Audience:** a university teacher (reads the code and watches the demo) and non-CSE players (use the website)
**Owner:** team of 3, UITS CSE

## Build order (read this first)

1. **Part A (sections 1 to 13):** the notebook and its exported artifacts. Build this completely before anything else.
2. **Stop after Part A.** Report results to the team and wait. **Do not start Part B** until the team says go.
3. **Part B (sections 14 to 23):** before writing any website code, the agent **must ask the team the questions in section 15** and wait for answers.

---

## 1. Goal

Build **one Colab notebook, written cell by cell**, that teaches and demonstrates the core course topic: **CNN training, underfitting, overfitting, and good generalization**, using Tic-Tac-Toe as the task.

The notebook must:

1. Be readable top to bottom by a teacher: every code cell is preceded by a short markdown cell explaining what and why.
2. Train **three CNN models** that clearly show different learning behavior (underfit, overfit, stable).
3. Produce **plots and metrics** that explain that behavior.
4. **Export artifacts** (models, JSON data, PNG plots) that a separate web game will use directly. The game is NOT built in this task.

## 2. Background (for the agent)

The final product is a web game where a player plays Tic-Tac-Toe against one of three AI levels:

| Level | Model | Behavior |
|---|---|---|
| 1 | Underfitted | Weak, nearly random, misses obvious wins and blocks |
| 2 | Overfitted | Perfect on memorized boards, poor on unseen boards |
| 3 | Stable | Near-optimal, tries to win, rarely or never loses |

After each game the game shows text, plots and graphs explaining *why* the AI behaved that way, aimed at non-CS people. So the notebook's outputs must be **simple, self-explanatory, and exportable**.

## 3. Scope

**In scope:** data generation, minimax labeling, three Keras CNNs, training, evaluation, explanation helpers, artifact export.

**Out of scope for Part A:** game UI and website (Part B), RNNs, reinforcement learning, self-play, hosting.

## 4. Technical constraints

- Runs on **free Google Colab** (CPU is enough; GPU optional). Total run time, top to bottom, **under 10 minutes**.
- Python 3, **TensorFlow/Keras**. Pin versions in the first code cell (`!pip install` only what is missing).
- **Fully reproducible:** fixed seeds for Python, NumPy and TensorFlow set in cell 1. Re-running gives the same numbers.
- No local file paths; write everything under `/content/artifacts/`.
- Plots: matplotlib, plain and legible (large fonts, labeled axes, titles in plain English). Avoid relying on color alone (use line styles and markers too).
- The notebook must be committed **with outputs saved** so the teacher can read results without re-running.

## 5. Core definitions (follow exactly)

**Board encoding.** A board is a `3x3` array. Always encode **from the perspective of the player to move**: current player's marks = `+1`, opponent's = `-1`, empty = `0`. Model input shape: `(3, 3, 1)`. The game flips signs when the AI plays O.

**Cell indexing.** Cells `0..8`, row-major (0 top-left, 8 bottom-right).

**Labels.** Minimax can return several equally optimal moves. For each non-terminal position store the **set of optimal moves** (multi-hot vector of length 9).
- Training target: a **uniform distribution over the optimal moves** (soft label), loss = categorical cross-entropy.
- "Correct" prediction = the model's highest-probability **legal** move is in the optimal set.

**Positions.** All positions reachable from the empty board with X moving first, **non-terminal only** (game not yet won or drawn). Print the final count.

**Legal-move masking.** At play time, mask occupied cells before argmax. Separately report each model's **illegal-move rate before masking** (a useful teaching metric, since the underfit model often picks occupied cells).

**Leakage-safe split.** Tic-Tac-Toe boards have 8 symmetries (4 rotations x mirror). Group positions by canonical form (minimum over the 8 symmetric versions) and split **by group**, so a rotated copy of a training board never appears in validation or test. Split 70% train / 15% validation / 15% test by group, fixed seed. Print sizes.

## 6. Notebook structure (cell by cell)

Each numbered section below is a **markdown cell (explanation) followed by one or more short code cells**. Keep code cells short, commented, and focused on a single idea.

| # | Section | Content and expected output |
|---|---|---|
| 0 | Title and instructions | Project title, team placeholder, one-paragraph summary, "Runtime > Run all", list of the artifacts produced |
| 1 | Setup | Imports, version pins, seeds, `ARTIFACT_DIR` creation. Print library versions. |
| 2 | Concepts primer | Plain-language markdown: what a CNN is, what a filter is, what underfitting and overfitting are, what "generalization" means. Use the student analogies: barely studied, memorized last year's answers, understood the concepts. |
| 3 | Game logic | `winner(board)`, `legal_moves(board)`, `play(board, move, player)`, symmetry functions. Include a few `assert` tests. |
| 4 | Minimax | Memoized minimax returning scores and the set of optimal moves. Tests: it takes an immediate win, blocks an immediate loss, and the empty board is a draw. |
| 5 | Dataset | Enumerate reachable non-terminal positions, label them, show the total count and a small grid of sample boards with their optimal moves drawn on them. |
| 6 | Split | Canonical-form grouping and train/val/test split. Print sizes and a leakage check (`assert` no canonical form is shared across splits). |
| 7 | Model builders | Three functions: `build_underfit()`, `build_overfit()`, `build_stable()` (specs in section 7). Print `model.summary()` for each and its parameter count. |
| 8 | Train: Underfit | Train, plot loss and accuracy curves (train vs validation). One-sentence takeaway as a markdown cell. |
| 9 | Train: Overfit | Same, using the small training subset. The train/validation gap must be visible. |
| 10 | Train: Stable | Same, with augmentation, dropout and early stopping. |
| 11 | Side-by-side comparison | One table plus one grouped bar chart: train / validation / test accuracy for the three models. One overlay chart of validation curves. |
| 12 | Game-play evaluation | Each model plays 1,000 games vs a **random** player (500 as first mover, 500 as second) and 200 games vs **minimax** (100 each side). Stacked bars of win/draw/loss. Also report, for each model: **missed-win rate** (had a winning move, did not take it), **missed-block rate** (had to block, did not), **illegal-move rate**. |
| 13 | Seen vs unseen demo (overfit) | Pick a board the overfit model memorized and a nearby board it never saw (same pattern, one extra piece shifted). Show both predictions as heatmaps. This is the key "overfitting" visual. |
| 14 | Explain-a-move helper | `explain_move(model, board)` returns probabilities for all 9 cells and draws a 3x3 heatmap with the chosen cell outlined. Demonstrate on one fixed board for all three models side by side. |
| 15 | Plain-language explanations | A function that turns metrics into 2-3 simple sentences per model (templates, not an LLM). Print them. Examples in section 9. |
| 16 | Export artifacts | Save everything in section 8, zip as `artifacts.zip`, trigger Colab download. List the files and sizes. |
| 17 | Summary for teacher | A table mapping each course concept (CNN, filter, loss, overfitting, underfitting, regularization, augmentation, early stopping, generalization) to the cell and the evidence that demonstrates it. |

## 7. Model specifications (starting points; tune until acceptance criteria are met)

All models: input `(3,3,1)`, output `Dense(9, softmax)`, Adam optimizer, categorical cross-entropy.

**Underfit (`underfit`)**
- `Conv2D(2, 3x3, padding='same', relu)` > `Flatten` > `Dense(9, softmax)`
- Very low learning rate and **2 to 4 epochs** on the full training set
- Intent: too little capacity and training to learn the rules

**Overfit (`overfit`)**
- `Conv2D(32)` > `Conv2D(64)` > `Conv2D(128)` (all 3x3, same, relu) > `Flatten` > `Dense(512, relu)` > `Dense(9, softmax)`
- **No dropout, no regularization, no augmentation, no early stopping**
- Train on a **random subset of ~150 training positions**, **300 to 600 epochs**
- Intent: enough capacity to memorize a tiny set
- Save the exact list of subset position IDs (the game uses it to say "I have seen this board before")

**Stable (`stable`)**
- `Conv2D(32)` > `Conv2D(64)` (3x3, same, relu) > `Flatten` > `Dense(128, relu)` > `Dropout(0.3)` > `Dense(9, softmax)`
- Full training set, **augmented with all 8 symmetries** (apply the matching transform to the label)
- `EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True)`
- Intent: right capacity plus regularization gives good generalization

## 8. Artifacts to export (`/content/artifacts/`)

The web game consumes these. Use exactly these names and shapes.

```
artifacts/
  models/
    underfit/   (TensorFlow.js format: model.json + shards)
    overfit/
    stable/
    underfit.keras  overfit.keras  stable.keras
  data/
    metrics.json
    history.json
    gameplay_results.json
    memorized_boards.json
    sample_explanations.json
    parity_test_vectors.json
  plots/
    curves_underfit.png  curves_overfit.png  curves_stable.png
    accuracy_comparison.png
    gameplay_wdl.png
    seen_vs_unseen_overfit.png
    heatmaps_same_board.png
  artifacts.zip
```

- **TensorFlow.js export:** use `tensorflowjs` (`tensorflowjs_converter` or `tfjs.converters.save_keras_model`). If conversion fails in Colab, document the failure and additionally export raw weights as `weights.json` per model (layer names, shapes, flat arrays) so the game can implement inference manually.
- `metrics.json`
  ```json
  { "underfit": {"train_acc":0,"val_acc":0,"test_acc":0,"train_loss":0,"val_loss":0,"params":0,"illegal_rate":0,"missed_win_rate":0,"missed_block_rate":0}, "overfit": {...}, "stable": {...} }
  ```
- `history.json`: per model, per-epoch arrays `loss`, `val_loss`, `accuracy`, `val_accuracy` (so the game can redraw charts with its own library).
- `gameplay_results.json`: wins/draws/losses per model per opponent (random, minimax), plus the numbers of games.
- `memorized_boards.json`: list of the overfit model's training boards (9-element arrays, mover-perspective encoding) so the game can flag "seen" vs "new" positions.
- `sample_explanations.json`: the plain-language text per model (section 15), plus a short "what this means" paragraph per concept.
- `parity_test_vectors.json`: about 20 boards per model with the model's exact output probabilities, so the game's JS inference can be verified against Python.

## 9. Plain-language explanation templates (section 15)

Examples of the tone and level to aim for (avoid jargon, define any technical word in the same sentence):

- **Underfit:** "This AI barely learned the game. It only looked at your board in a very simple way, so it often missed chances to win and failed to block you. It is like a student who skimmed the book for five minutes."
- **Overfit:** "This AI memorized the boards it practiced on, so it plays perfectly when it sees one of them. When you made a move it had never seen, it did not know what to do. Memorizing is not the same as understanding."
- **Stable:** "This AI learned the patterns behind the game, such as 'three in a row wins' and 'block your opponent', so it plays well even in boards it never practiced. The best it can do against a good player is a draw."

Fill in real numbers from `metrics.json` (for example "it picked the best move on 94% of new boards, but only 41% for the memorizing AI").

## 10. Acceptance criteria

Tune hyperparameters until all of these hold, then **write the final numbers into the summary cell**.

| Check | Target |
|---|---|
| Underfit validation accuracy | Clearly low (below about 50%), and train accuracy also low |
| Underfit behavior | Missed-win rate above 30% in game-play evaluation |
| Overfit train accuracy | At least 98% |
| Overfit validation accuracy | At least 25 percentage points below its train accuracy |
| Stable test accuracy | At least 95% |
| Stable vs random (1,000 games) | **0 losses**, at least 90% wins |
| Stable vs minimax (200 games) | 0 losses (all draws acceptable) |
| Stable missed-win and missed-block rates | Below 1% each |
| Leakage check | No canonical form shared between train, val and test |
| Reproducibility | Two full runs give identical metrics |
| Notebook health | Runs top to bottom with no errors, saved with outputs, under 10 minutes |
| Parity vectors | Python outputs saved for all three models |

If a target cannot be met, report the closest achieved result and why in the summary cell. Do not silently relax a target.

## 11. Code and writing quality

- Every code cell preceded by a markdown cell: a heading, 1 to 3 plain sentences, and what output to expect.
- Functions over copy-pasted code; type hints and short docstrings on helpers.
- Comments written for a teacher who knows ML basics but has not seen the code.
- Plot titles state the takeaway, for example "Overfit model: great on practice boards, poor on new ones".
- No unexplained magic numbers; hyperparameters defined in one config cell with a comment for each.

## 12. How the agent should work

1. Build the notebook programmatically (for example with `nbformat`), keeping cells as specified in section 6.
2. Execute it end to end locally (`jupyter nbconvert --to notebook --execute`) or in Colab and fix every error before delivering.
3. Verify each acceptance criterion in section 10 and show the evidence.
4. Deliver: `tictactoe_cnn.ipynb` (with outputs) and `artifacts.zip`.
5. Summarize in the final message: what was built, the final metrics table, any target missed, and any export caveats (for example, if the TensorFlow.js conversion needed the fallback).

## 13. Open items for the team (not blockers)

- Course name and teacher's required sections, if any, may require extra markdown headers (for example "Problem statement", "Conclusion"). Add if provided.
- The website (Part B) is expected to be Next.js with TensorFlow.js; keep artifact formats compatible with that.

---

# PART B: Game Website

**Do not start Part B until Part A is complete and the team says go. Before building, ask the questions in section 15 and wait for the answers.**

## 14. Goal of Part B

Build a website where a player plays Tic-Tac-Toe against one of the three AI levels from Part A (underfit, overfit, stable), then sees a plain-language explanation of **why the AI behaved the way it did in that specific game**, using text, heatmaps, plots and graphs. The site doubles as the live demo for the teacher.

The AI runs **in the browser** using the exported TensorFlow.js models. No server is needed for inference.

## 15. Inputs to collect from the team BEFORE building (ask first, then wait)

Ask these in **one grouped message**, with a recommended default for each so the team can answer quickly ("defaults are fine" must be accepted). Do not assume answers and do not start coding until the team replies.

**Identity and content**
1. Site name and tagline (default: working title from the project title).
2. Team: each member's name, student ID, role, optional photo and links (GitHub, LinkedIn).
3. Course name, teacher name, university credit line, and whether to show them on the site.
4. Languages: English only, or English plus Bangla toggle? (default: English only.)
5. Links to show: Colab notebook link, GitHub repo link, report or proposal download.

**Look and feel**
6. Visual style: theme (light, dark, or both), color palette, fonts, any reference sites they like. (Default: clean, high-contrast, black and white with one accent.)
7. Tone for explanations: very simple (school-level), or friendly-technical.
8. Logo or favicon, or generate a simple one?

**Pages and features**
9. Pages wanted. Default: Home, Play, Learn (concept primer), Compare (all three models), About/Team.
10. Optional extras (yes/no each): sound effects, animated explanations, "teacher view" page that maps each course concept to the evidence (mirrors the notebook's summary cell), downloadable game report after each game.
11. Game rules: who moves first (player or AI, or player's choice), player's mark (X, O, or choice), difficulty names shown to the player (default: "Beginner", "Memorizer", "Master" or the team's own).
12. Score tracking: none, per-session only, or saved across visits? (If saved or shared, ask whether they want accounts or a leaderboard, since that needs a backend and database.)

**Technical and delivery**
13. Backend needed? (Default: **no**, everything client-side. Only add a backend if the answers to 12 require it.)
14. GitHub repo name and Vercel project name or custom domain.
15. Must the demo work offline or on poor internet? (If yes, cache the models for offline use.)
16. Analytics: none or basic? (Default: none.)
17. Devices to prioritize: phone-first, laptop-first, or both equally? (Default: both, responsive.)
18. Anything the teacher specifically asked to see on the site.

After the answers arrive, **reply with a short plan** (page list, component list, data flow, anything the answers made ambiguous) and wait for a "go" before building.

## 16. Tech stack (the team's usual stack; do not swap without asking)

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS (a component library such as DaisyUI is allowed if it fits the chosen look)
- **AI in the browser:** TensorFlow.js loading the Part A models
- **Charts:** Recharts (or Chart.js) drawing from the exported JSON, so charts match the game's data exactly
- **State:** React state or Zustand for game state
- **Testing:** Vitest for game logic and the model parity test
- **Deployment:** Vercel, with the code on GitHub
- **Backend (only if section 15 answers require it):** Express REST API with MongoDB Atlas; otherwise none

## 17. Inputs from Part A

Copy `artifacts/models`, `artifacts/data` and `artifacts/plots` into the site's `public/` folder. Use:

| File | Used for |
|---|---|
| `models/*` | AI opponents, loaded in the browser |
| `data/metrics.json` | Numbers inserted into explanation text and the Compare page |
| `data/history.json` | Training and validation curves (redrawn with the chart library) |
| `data/gameplay_results.json` | Win/draw/loss charts on the Compare page |
| `data/memorized_boards.json` | "Familiar board" vs "new board" tag on the overfit AI's moves |
| `data/sample_explanations.json` | Base explanation text per model and per concept |
| `data/parity_test_vectors.json` | Automated test proving the JavaScript models match Python |
| `plots/*.png` | Static fallback images and the teacher view |

Board encoding in the game must match Part A exactly: mover-perspective (current player = +1, opponent = -1, empty = 0), cells 0..8 row-major, **legal-move masking applied before choosing the AI's move**.

## 18. Functional requirements

**Play page**
- Level picker (three levels, one-line description each, no jargon).
- 3x3 board, keyboard accessible, clear turn indicator, restart, change level.
- The AI's move is computed in the browser from the selected model; show a short "thinking" state while the model loads for the first time.
- For the overfit AI, tag each AI move as **familiar board** or **new board** using the memorized boards list.
- Log every move of the game (board before, move, model probabilities) for the explanation screen.

**Post-game explanation screen (the core feature)**
- Result banner, then a **move-by-move timeline**: for each AI move, a 3x3 heatmap of the model's confidence with the chosen cell outlined.
- **Game-specific findings**, computed from the logged game, in plain language. Examples: "On move 3 the AI could have blocked you and didn't", "On move 2 the AI had seen this board before, so it played well", "The AI tried to play on a taken square (illegal-move rate)".
- **Why it happened:** explanation text for that model, with real numbers from `metrics.json` filled in.
- **Charts** for the model just played: training vs validation curves, accuracy on seen vs unseen boards, win/draw/loss results.
- Button: "Try another level" and a shortcut to the Compare page.

**Compare page**
- All three models side by side: accuracy chart, curves overlay, win/draw/loss chart, and the same board shown as three heatmaps.

**Learn page**
- Plain-language primer: what a CNN is, what underfitting and overfitting are, and the student analogies (barely studied, memorized last year's answers, understood the concepts).

**About page**
- Team, course, project summary, links to notebook and repo (as answered in section 15).

## 19. UX and quality requirements

- Written for non-CSE visitors: every technical word is explained in the same sentence or via a tooltip.
- Responsive from phone to desktop; touch targets at least 44px.
- Accessible: sufficient contrast, visible focus states, ARIA labels on board cells and chart summaries, charts have a text summary.
- Charts never rely on color alone (add line styles, markers or labels).
- First model load under about 2 seconds on a normal connection; preload the chosen level's model as soon as the level is picked.
- No console errors; fully typed TypeScript; consistent component structure.

## 20. Testing

- Vitest unit tests: winner detection, legal moves, board flipping for mover perspective, game-finding detection (missed win, missed block, illegal move).
- **Parity test:** load each exported model in Node (or the browser test environment) and check its outputs against `parity_test_vectors.json` within a small tolerance.
- A manual smoke checklist run through all three levels, including an overfit game that leaves memorized boards.
- Lighthouse performance and accessibility scores of at least 90 on the Play page.

## 21. Acceptance criteria for Part B

| Check | Target |
|---|---|
| Parity | JS model outputs match the Python vectors for all three models |
| Underfit level | Visibly weak; the explanation screen reports its missed wins or blocks |
| Overfit level | Plays well on familiar boards, poorly on new ones; the tags show it |
| Stable level | Never loses to a reasonable player; best the player can do is a draw |
| Explanation screen | Shows heatmaps, game-specific findings, model explanation and charts for every game |
| Compare page | All three models side by side with correct numbers from the JSON files |
| Section 15 answers | Every answer reflected in the site, or the deviation reported |
| Responsive and accessible | Works on a phone, passes the quality checks in section 19 |
| Tests | All Vitest tests pass |
| Deployment | Live on Vercel; repo has a README (how to run, how the models were produced, link to the notebook) |

## 22. How the agent should work in Part B

1. Confirm Part A is complete and the artifacts are present.
2. Ask the section 15 questions in one message and wait.
3. Present the short plan and wait for a "go".
4. Build, test and deploy.
5. Final message: live URL, repo URL, what was built, test results, any answer from section 15 that could not be fully honored, and a short demo script for the teacher.

## 23. Out of scope for Part B

Training or retraining models (done in Part A), multiplayer between humans, accounts or leaderboards unless the team's answers require them.
