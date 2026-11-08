# TicTacLearn

**Play tic-tac-toe against three neural networks — and see why each one plays the way it does.**

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
| Master | `stable` | A model that learned the patterns: near-optimal, rarely or never loses |

## Status

- [x] Repository created
- [ ] **Part A** — Colab notebook, three trained models, plots, exported artifacts (in progress)
- [ ] **Part B** — Next.js website that plays against the models in the browser

## Repository layout

```
tictactoe_cnn.ipynb      Part A notebook (built section by section, saved with outputs)
artifacts/               Models, metrics, plots and the downloadable artifacts.zip
tools/                   Build, execute and verification scripts for the notebook
requirements-notebook.txt
```

Part B will live in `web/` once the team approves Part A.

## Part A: run the notebook

### Google Colab (the intended environment)

1. Upload `tictactoe_cnn.ipynb` to [Google Colab](https://colab.research.google.com/).
2. Choose **Runtime > Run all**.
3. The notebook writes everything to `/content/artifacts/` and offers `artifacts.zip` for download.

A full run is designed to take under 10 minutes on the free CPU runtime.

### Local verification (optional)

The notebook is also runnable on Windows/Linux for verification. It uses the same code; only the
artifact directory is overridden by the runner.

```powershell
powershell -ExecutionPolicy Bypass -File tools/setup_env.ps1
.\.venv\Scripts\python.exe tools\execute_notebook.py
```

Local artifacts are written to `artifacts/`, and the executed notebook is saved in place.

## How the data is made

No external dataset is used. Every non-terminal board reachable from the empty board is generated
and labeled by memoized minimax with the set of optimal moves. Positions are split by symmetry group
(70/15/15) so a rotated copy of a training board never appears in validation or test. The board is
always encoded from the perspective of the player to move: own marks `+1`, opponent `-1`, empty `0`.

## Team

| Name | Student ID | Batch / Section | Role |
|---|---|---|---|
| Md. Shahriar Hossain Srabon | 0432310005101056 | 53 / B1 | Dataset, training, artifact export |
| Lubna Jahan Lipa | 0432310005101088 | 53 / B2 | Game logic, interface, level selection |
| Tamanna Khokon | 0432310005101082 | 53 / B2 | Model integration, explanations, evaluation, report |
