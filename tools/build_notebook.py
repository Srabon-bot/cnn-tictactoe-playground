"""Generate tictactoe_cnn.ipynb from readable cell definitions.

The notebook is the deliverable. Keeping the cells in one Python source makes the
section-by-section commits, retuning and rebuilds safe and reviewable.

Run:
    python tools/build_notebook.py
"""
from pathlib import Path

import nbformat as nbf

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = ROOT / "tictactoe_cnn.ipynb"

PROJECT_NAME = "TicTacLearn"
ACADEMIC_TITLE = (
    "Learn by Playing: A CNN-Based Tic-Tac-Toe Game for "
    "Teaching Overfitting and Underfitting"
)
UNIVERSITY = "University of Information Technology and Sciences (UITS)"
DEPARTMENT = "Department of Computer Science and Engineering"
TEAM = [
    ("Md. Shahriar Hossain Srabon", "0432310005101056", "53 / B1"),
    ("Lubna Jahan Lipa", "0432310005101088", "53 / B2"),
    ("Tamanna Khokon", "0432310005101082", "53 / B2"),
]


def md(text: str) -> nbf.NotebookNode:
    """A markdown cell, with the surrounding blank lines removed."""
    return nbf.v4.new_markdown_cell(text.strip("\n"))


def code(text: str) -> nbf.NotebookNode:
    """A code cell, with the surrounding blank lines removed."""
    return nbf.v4.new_code_cell(text.strip("\n"))


def section_0_title() -> list[nbf.NotebookNode]:
    team_rows = "\n".join(
        f"| {name} | {student_id} | {batch} |" for name, student_id, batch in TEAM
    )
    return [
        md(
            f"""
# {PROJECT_NAME}

### {ACADEMIC_TITLE}

**{UNIVERSITY}** · {DEPARTMENT}

| Team member | Student ID | Batch / Section |
|---|---|---|
{team_rows}

This notebook is **Part A** of the project. It builds the complete teaching experiment:
a clean Tic-Tac-Toe dataset labeled by minimax, three CNNs trained to underfit, overfit
and generalize, the measurements and plots that make the difference visible, and the
exported artifacts that the companion website (Part B) will use.

**How to run:** choose **Runtime > Run all** in Google Colab. A full run is designed to
take under 10 minutes on the free CPU runtime. Every random seed is fixed, so a second
run produces the same numbers.

**What this notebook produces**

1. Three trained models: `underfit`, `overfit` and `stable`.
2. Training curves, an accuracy comparison, a win/draw/loss chart and explanation heatmaps.
3. A folder of portable artifacts under `/content/artifacts/`, zipped as `artifacts.zip`:
   Keras models, TensorFlow.js models, metrics and histories as JSON, and plots as PNG.
4. A teacher summary that maps each course concept to the cell that demonstrates it and
   the measured evidence.

The notebook is deliberately written for a reader who knows some machine learning but has
not seen this code before: every code cell is preceded by a short explanation of what it
does and what output to expect.
"""
        )
    ]


def section_1_setup() -> list[nbf.NotebookNode]:
    return [
        md(
            """
## 1. Setup

### 1.1 Install only what is missing

Colab already provides TensorFlow and matplotlib. The only package that is usually missing
is the TensorFlow.js converter used at export time. We install it only when the import
check fails, and the version is pinned so two runs use the same code.

### 1.2 Imports, seeds, artifact folders and shared configuration

Machine-learning results can change if random numbers change. We therefore set one seed
for Python, NumPy and TensorFlow, and ask TensorFlow to use deterministic operations.

Artifacts go to `/content/artifacts` in Colab. When the notebook is executed by the local
verification runner, `TTT_ARTIFACT_DIR` points at the repository's `artifacts/` folder
instead. The notebook itself never contains a machine-specific path.

All important numbers (epochs, learning rates, split sizes, game counts) are collected in
one `CONFIG` dictionary, with a comment for each value.
"""
        ),
        code(
            """
# Install only packages that are missing. Versions are pinned for reproducibility.
import importlib.util
import subprocess
import sys

REQUIRED_PACKAGES = {
    "tensorflow": "tensorflow-cpu==2.21.0",
    "matplotlib": "matplotlib==3.10.9",
    "tensorflowjs": "tensorflowjs==4.22.0",
}
for module, requirement in REQUIRED_PACKAGES.items():
    if importlib.util.find_spec(module) is None:
        print(f"Installing {requirement} ...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-q", requirement]
        )
print("Library check finished.")
"""
        ),
        code(
            """
# Environment flags must be set before TensorFlow is imported.
import os
import random
import sys

SEED = 42
os.environ["PYTHONHASHSEED"] = str(SEED)
os.environ["TF_DETERMINISTIC_OPS"] = "1"
os.environ["TF_CUDNN_DETERMINISTIC"] = "1"

import json
import time
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Optional, Sequence

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
import keras

# One seed for every source of randomness used in this notebook.
random.seed(SEED)
np.random.seed(SEED)
tf.keras.utils.set_random_seed(SEED)
try:
    tf.config.experimental.enable_op_determinism()
except AttributeError:  # older TensorFlow fallback
    pass

# Artifact locations (Colab default; the local runner overrides the base folder).
ARTIFACT_DIR = Path(os.environ.get("TTT_ARTIFACT_DIR", "/content/artifacts"))
MODEL_DIR = ARTIFACT_DIR / "models"
DATA_DIR = ARTIFACT_DIR / "data"
PLOT_DIR = ARTIFACT_DIR / "plots"
for directory in (MODEL_DIR, DATA_DIR, PLOT_DIR):
    directory.mkdir(parents=True, exist_ok=True)

# Consistent, legible plots: large fonts and room for labels.
plt.rcParams.update(
    {
        "figure.dpi": 110,
        "savefig.dpi": 170,
        "font.size": 12,
        "axes.titlesize": 13,
        "axes.labelsize": 12,
        "legend.fontsize": 11,
        "axes.spines.top": False,
        "axes.spines.right": False,
    }
)

CONFIG = {
    # Data
    "seed": SEED,
    "split": {"train": 0.70, "val": 0.15, "test": 0.15},  # by symmetry group
    "overfit_subset_size": 150,  # boards the memorizing model may see
    # Training. These are starting points; section 10 tunes them until the targets pass.
    "underfit": {"epochs": 3, "batch_size": 64, "learning_rate": 1e-4},
    "overfit": {"epochs": 400, "batch_size": 16, "learning_rate": 1e-3},
    "stable": {
        "epochs": 60,
        "batch_size": 64,
        "learning_rate": 1e-3,
        "early_stopping_patience": 8,
    },
    # Evaluation
    "games": {"vs_random": 1000, "vs_minimax": 200},
    "parity_boards_per_model": 20,
}

print(f"Python      : {sys.version.split()[0]}")
print(f"TensorFlow  : {tf.__version__}")
print(f"Keras       : {keras.__version__}")
print(f"NumPy       : {np.__version__}")
print(f"Matplotlib  : {matplotlib.__version__}")
try:
    import tensorflowjs

    print(f"tensorflowjs: {tensorflowjs.__version__}")
except Exception:
    print("tensorflowjs: not importable yet (needed only in the export section)")
print(f"Artifacts   : {ARTIFACT_DIR}")
"""
        ),
    ]


def section_2_primer() -> list[nbf.NotebookNode]:
    return [
        md(
            """
## 2. Concepts primer (plain language)

### What is a convolutional neural network?

A convolutional neural network (CNN) is a model that looks for **small local patterns**
and combines them. For a 3×3 board, a pattern is something like "two of my marks in a row
with the third cell empty" or "the opponent has a corner and the centre". The model does not
receive a rule book; it adjusts its internal pattern detectors until its answers fit the
training examples.

### What is a filter?

A **filter** (or kernel) is one tiny pattern detector, usually 3×3, that slides across the
board and produces a score for every position: "how strongly does this pattern appear here?"
A CNN learns the numbers inside its filters. With only two filters, the model can recognise
very few patterns; with dozens of filters per layer, it can recognise many.

### Underfitting, overfitting and generalization

| Model | Student analogy | Technical name | What you will see |
|---|---|---|---|
| `underfit` | Skimmed the book for five minutes | Underfitting (too little capacity/training) | Low accuracy on training **and** new boards |
| `overfit` | Memorized last year's answers | Overfitting (memorization, no regularization) | Near-perfect training accuracy, much worse on new boards |
| `stable` | Understood the concepts | Good generalization | High accuracy on both training and new boards |

**Generalization** means doing well on boards that were not used for training. It is the
only result that matters for a player, because a real game constantly produces new boards.

### Accuracy and loss

- **Loss** measures how far the predicted probabilities are from the ideal answer. Lower is
  better. The optimizer reduces training loss step by step.
- **Accuracy** here means: after ignoring cells that are already taken, did the model's
  highest-probability move belong to the set of optimal minimax moves?

A large gap between the training curve and the validation curve is the visual signature of
overfitting. Both curves being poor is the signature of underfitting. Two curves that stay
close and high are the signature of good generalization.

### Why the split must be leak-free

Tic-Tac-Toe boards have eight symmetries: four rotations and their mirror images. If we
split boards at random, a rotated copy of a training board could land in the test set; the
model would look better than it really is. We group all symmetric copies of a board
together and split **by group**, so test boards are genuinely new shapes.

### What "optimal" means here

Minimax is a perfect-play algorithm. For every non-terminal board it returns the score of
the game with perfect play and the set of moves that achieve that score. Sometimes several
moves are equally optimal, so the training target is a **uniform distribution over that
set**, not a single "correct" cell. A prediction is counted as correct when its best legal
move is in that set.
"""
        )
    ]


def build() -> Path:
    cells: list[nbf.NotebookNode] = []
    cells += section_0_title()
    cells += section_1_setup()
    cells += section_2_primer()

    notebook = nbf.v4.new_notebook()
    notebook["cells"] = cells
    notebook["metadata"] = {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3",
        },
        "language_info": {"name": "python", "version": "3.10.11"},
        "colab": {"provenance": []},
    }
    nbf.write(notebook, NOTEBOOK_PATH)
    return NOTEBOOK_PATH


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path} ({nbf.read(path, as_version=4).cells.__len__()} cells)")
