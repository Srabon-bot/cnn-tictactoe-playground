# TicTacLearn

**Play tic-tac-toe against three neural networks - and see why each one plays the way it does.**

TicTacLearn is a teaching project that turns a familiar game into a hands-on lesson about machine
learning. Three CNN opponents are trained on the same task but deliberately learn in different ways:
one barely learns, one memorizes, and one generalizes. After every game the site explains, in plain
language, what the AI did and why.

> **Academic title:** *Learn by Playing: A CNN-Based Tic-Tac-Toe Game for Teaching Overfitting and Underfitting*
> **University:** University of Information Technology and Sciences (UITS), Department of Computer Science and Engineering

## The three opponents

| Level | Internal model | What it demonstrates |
|---|---|---|
| Beginner | `underfit` | A model that learned too little: close to random, misses wins and blocks |
| Memorizer | `overfit` | A model that memorized its practice boards: perfect on those, poor on new ones |
| Steady | `stable` | A model that learned the patterns: averages over the board's symmetries and never loses an evaluated game |

## Status

- [x] Repository created
- [x] **Part A** - Colab notebook, three trained models, plots, exported artifacts (completed and verified)
- [x] **Part B** - Next.js website that plays against the models in the browser (built; Vercel config prepared, not deployed)

## Results

All metrics are generated deterministically from seed `42` across 4,520 reachable non-terminal
positions, grouped into 627 canonical forms and split 70% / 15% / 15% by group.

Accuracy is reported two ways. **Top choice** is the primary score: the cell the network ranks
first must be empty and minimax-optimal. **After mask** discards occupied cells before choosing,
which is how the game engine actually plays. The post-mask number is generous - "always take the
first empty cell" already scores about 59% on these labels - so both are always shown together.

| Model | Parameters | Train top choice | Validation top choice | Test top choice | Test after mask | Test gap |
|---|---:|---:|---:|---:|---:|---:|
| `underfit` | 191 | 20.5% | 17.4% | 19.9% | 55.6% | -0.5% |
| `overfit` | 687,625 | 100.0% | 53.7% | 58.7% | 74.6% | **+41.3%** |
| `stable` | 93,833 | 100.0% | 98.4% | **95.9%** | 95.9% | +4.1% |

### Gameplay evaluation (1,200 games per model)

The two control models play exactly as trained. The Steady model averages its answer over all
eight rotations and mirrors, then takes an immediate win or the single forced block when one
exists.

| Model | vs random (1,000 games) | vs minimax (200 games) | Missed win | Missed block | Illegal first choice |
|---|---|---|---|---|---|
| `underfit` | 500W / 108D / 392L | 0W / 1D / 199L | 62.5% | 88.1% | 47.8% |
| `overfit` | 707W / 104D / 189L | 0W / 52D / 148L | 33.7% | 67.2% | 20.8% |
| `stable` | **944W / 56D / 0L** | **0W / 200D / 0L** | **0.0%** | **0.0%** | **0.0%** |

### Acceptance and reproducibility

- **Runtime**: 2.2 minutes end-to-end locally, well within the 10-minute Colab budget.
- **Reproducibility**: two full back-to-back runs are compared with
  `tools/verify_acceptance.py --compare reports/run1_metrics.json`; metrics match within `1e-9`.
- **Acceptance**: every target in PRD section 10 passes. The full table is written to
  `reports/acceptance_report.md` and `artifacts/data/acceptance.json`.
- **Artifacts**: native `.keras` models, portable `weights.json` browser fallbacks, 7 figures,
  7 datasets and `artifacts.zip` (11.35 MB).

## Repository layout

```
tictactoe_cnn.ipynb      Part A notebook (built section by section, saved with outputs)
artifacts/               Models, metrics, plots and the downloadable artifacts.zip
tools/                   Build, execute and verification scripts for the notebook
web/                     Part B Next.js site (static, no backend)
requirements-notebook.txt
```

## Part A: run the notebook

### Google Colab (the intended environment)

1. Upload `tictactoe_cnn.ipynb` to [Google Colab](https://colab.research.google.com/).
2. Choose **Runtime > Run all**.
3. The notebook writes everything to `/content/artifacts/` and offers `artifacts.zip` for download.

A full run is designed to take under 10 minutes on the free CPU runtime.

### Local verification (optional)

```powershell
powershell -ExecutionPolicy Bypass -File tools/setup_env.ps1
.\.venv\Scripts\python.exe tools\build_notebook.py
.\.venv\Scripts\python.exe tools\execute_notebook.py
.\.venv\Scripts\python.exe tools\verify_acceptance.py --save-run reports\run1_metrics.json
```

Run the notebook a second time and compare to prove reproducibility:

```powershell
.\.venv\Scripts\python.exe tools\verify_acceptance.py --compare reports\run1_metrics.json
```

## Part B: run the website

```powershell
cd web
npm install
npm run dev
```

Open `http://localhost:3000`. To check the production build:

```powershell
npm run test
npm run lint
npm run build
```

### Artifacts and inference

The site is fully static. It reads the same JSON the notebook exports from
`web/public/artifacts/`; after a new notebook run, copy `artifacts/data`, `artifacts/models`,
`artifacts/plots` and `artifacts/artifacts.zip` into that folder.

Inference is a hand-written JavaScript forward pass over the exported `weights.json` files. The
notebook first attempts a TensorFlow.js conversion; when the installed converter cannot read the
current Keras format, it writes `weights.json` and records the fallback in
`artifacts/data/export_status.json`. This is stated on the About page rather than hidden. Twenty
boards per model are checked against Python in `web/src/lib/engine/engine.test.ts`.

### Deploying to Vercel

The repository includes `web/vercel.json`. Import the repository in Vercel, set the project root
to `web/`, and use the default Next.js build (`npm run build`). No environment variables or
server functions are required. Deployment is intentionally left to the team; nothing is live.

## How the data is made

No external dataset is used. Every non-terminal board reachable from the empty board is generated
and labeled by memoized minimax with the set of optimal moves. Positions are split by symmetry group
so a rotated copy of a training board never appears in validation or test. The board is always
encoded from the perspective of the player to move: own marks `+1`, opponent `-1`, empty `0`.

## Team

| Name | Student ID | Batch / Section | Role |
|---|---|---|---|
| Md. Shahriar Hossain Srabon | 0432310005101056 | 53 / B1 | Dataset, training, artifact export |
| Lubna Jahan Lipa | 0432310005101088 | 53 / B2 | Game logic, interface, level selection |
| Tamanna Khokon | 0432310005101082 | 53 / B2 | Model integration, explanations, evaluation, report |
