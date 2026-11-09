"""Verify the exported Part A artifacts against the project's acceptance criteria.

Reads only files under artifacts/ (plus the executed notebook and runtime report), so the
same checks can be re-run after any run without re-training.

Usage:
    .\\.venv\\Scripts\\python.exe tools\\verify_acceptance.py
    .\\.venv\\Scripts\\python.exe tools\\verify_acceptance.py --save-run reports/run1_metrics.json
    .\\.venv\\Scripts\\python.exe tools\\verify_acceptance.py --compare reports/run1_metrics.json

Every run also writes artifacts/data/acceptance.json, which the website reads so that its
acceptance page shows the same rows the reviewer sees here.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
DATA = ARTIFACTS / "data"
MODELS = ARTIFACTS / "models"
PLOTS = ARTIFACTS / "plots"
REPORTS = ROOT / "reports"

PLOT_FILES = [
    "curves_underfit.png",
    "curves_overfit.png",
    "curves_stable.png",
    "accuracy_comparison.png",
    "gameplay_wdl.png",
    "seen_vs_unseen_overfit.png",
    "heatmaps_same_board.png",
]
MODEL_NAMES = ["underfit", "overfit", "stable"]
COMPARE_KEYS = [
    "train_acc", "val_acc", "test_acc",
    "train_acc_masked", "val_acc_masked", "test_acc_masked",
    "train_loss", "val_loss",
]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def pct(value: float) -> str:
    return f"{value:.1%}"


def both(row: dict, key: str) -> str:
    """Top-choice value with the post-mask value beside it."""
    return f"{pct(row[key])} (mask {pct(row[key + '_masked'])})"


def check_files() -> list[tuple[str, bool, str]]:
    results: list[tuple[str, bool, str]] = []

    for name in MODEL_NAMES:
        results.append(
            (f"Keras model {name}.keras exists", (MODELS / f"{name}.keras").exists(),
             str((MODELS / f"{name}.keras").relative_to(ROOT)))
        )
        tfjs_model = MODELS / name / "model.json"
        fallback = MODELS / name / "weights.json"
        results.append(
            (
                f"Browser model for {name}",
                tfjs_model.exists() or fallback.exists(),
                "TensorFlow.js" if tfjs_model.exists() else ("weights.json fallback" if fallback.exists() else "missing"),
            )
        )

    for plot in PLOT_FILES:
        path = PLOTS / plot
        results.append((f"Plot {plot} exists", path.exists(), f"{path.stat().st_size / 1024:.0f} KB" if path.exists() else "missing"))

    for data_file in [
        "metrics.json", "history.json", "gameplay_results.json",
        "memorized_boards.json", "overfit_subset_ids.json",
        "sample_explanations.json", "parity_test_vectors.json",
    ]:
        path = DATA / data_file
        results.append((f"Data {data_file} exists", path.exists(), f"{path.stat().st_size / 1024:.0f} KB" if path.exists() else "missing"))

    zip_path = ARTIFACTS / "artifacts.zip"
    results.append(("artifacts.zip exists", zip_path.exists(), f"{zip_path.stat().st_size / 1024 / 1024:.2f} MB" if zip_path.exists() else "missing"))
    return results


def check_acceptance(metrics: dict, gameplay: dict, parity: dict) -> list[tuple[str, bool, str, str]]:
    underfit = metrics["underfit"]
    overfit = metrics["overfit"]
    stable = metrics["stable"]
    u_overall = gameplay["underfit"]["overall"]
    s_random = gameplay["stable"]["random"]
    s_minimax = gameplay["stable"]["minimax"]
    s_overall = gameplay["stable"]["overall"]

    return [
        ("Underfit validation accuracy (top choice)", underfit["val_acc"] < 0.50,
         both(underfit, "val_acc"), "< 50%"),
        ("Underfit train accuracy is also low", underfit["train_acc"] < 0.60,
         both(underfit, "train_acc"), "< 60%"),
        ("Underfit missed-win rate", u_overall["missed_win_rate"] > 0.30,
         pct(u_overall["missed_win_rate"]), "> 30%"),
        ("Overfit train accuracy", overfit["train_acc"] >= 0.98,
         both(overfit, "train_acc"), ">= 98%"),
        ("Overfit train-validation gap", overfit["train_acc"] - overfit["val_acc"] >= 0.25,
         pct(overfit["train_acc"] - overfit["val_acc"]), ">= 25 points"),
        ("Stable test accuracy", stable["test_acc"] >= 0.95,
         both(stable, "test_acc"), ">= 95%"),
        ("Stable vs random", s_random["losses"] == 0 and s_random["wins"] / s_random["games"] >= 0.90,
         f"{s_random['wins']}W / {s_random['draws']}D / {s_random['losses']}L", "0 losses, >= 90% wins"),
        ("Stable vs minimax", s_minimax["losses"] == 0,
         f"{s_minimax['wins']}W / {s_minimax['draws']}D / {s_minimax['losses']}L", "0 losses"),
        ("Stable missed-win rate", s_overall["missed_win_rate"] < 0.01,
         pct(s_overall["missed_win_rate"]), "< 1%"),
        ("Stable missed-block rate", s_overall["missed_block_rate"] < 0.01,
         pct(s_overall["missed_block_rate"]), "< 1%"),
        ("Parity vectors", all(len(parity.get(name, [])) >= 20 for name in MODEL_NAMES),
         f"{min(len(parity.get(name, [])) for name in MODEL_NAMES)} boards/model", ">= 20 per model"),
    ]


def check_notebook() -> list[tuple[str, bool, str]]:
    """Every code cell in the stored notebook should have an execution count and output."""
    try:
        import nbformat

        notebook = nbformat.read(ROOT / "tictactoe_cnn.ipynb", as_version=4)
    except Exception as exc:  # pragma: no cover - only shown when the file is broken
        return [("Notebook readable", False, f"{type(exc).__name__}: {exc}")]

    code_cells = [cell for cell in notebook.cells if cell.cell_type == "code"]
    executed = [cell for cell in code_cells if cell.get("execution_count")]
    errors = [
        cell for cell in code_cells
        if any(output.get("output_type") == "error" for output in cell.get("outputs", []))
    ]
    all_cells = notebook.cells
    not_preceded = [
        index for index, cell in enumerate(all_cells)
        if cell.cell_type == "code" and (index == 0 or all_cells[index - 1].cell_type != "markdown")
    ]
    return [
        ("Notebook has saved outputs", len(executed) == len(code_cells), f"{len(executed)}/{len(code_cells)} cells"),
        ("Notebook has no cell errors", not errors, f"{len(errors)} error cells"),
        ("Every code cell has a markdown cell before it", not not_preceded,
         f"{len(not_preceded)} missing" if not_preceded else f"all {len(code_cells)} code cells"),
    ]


def check_runtime() -> tuple[str, bool, str, str]:
    path = REPORTS / "last_run.json"
    if not path.exists():
        return ("Notebook runtime", False, "reports/last_run.json missing", "< 10 min")
    runtime = load_json(path)
    minutes = float(runtime.get("minutes", 999))
    return ("Notebook runtime", minutes < 10, f"{minutes:.1f} min", "< 10 min")


def notebook_summary() -> dict:
    """A small machine-readable summary for the website's acceptance section."""
    try:
        import nbformat

        notebook = nbformat.read(ROOT / "tictactoe_cnn.ipynb", as_version=4)
    except Exception:
        return {"executed_cells": 0, "code_cells": 0, "error_cells": 0}
    code_cells = [cell for cell in notebook.cells if cell.cell_type == "code"]
    return {
        "executed_cells": sum(1 for cell in code_cells if cell.get("execution_count")),
        "code_cells": len(code_cells),
        "error_cells": sum(
            1 for cell in code_cells
            if any(output.get("output_type") == "error" for output in cell.get("outputs", []))
        ),
    }


def write_acceptance_json(
    metrics: dict,
    gameplay: dict,
    acceptance_rows: list[tuple[str, bool, str, str]],
    runtime_row: tuple[str, bool, str, str],
    reproducibility: tuple[str, bool, str, str] | None,
) -> Path:
    runtime_path = REPORTS / "last_run.json"
    runtime_seconds = float(load_json(runtime_path).get("seconds", 0)) if runtime_path.exists() else 0.0
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "runtime_seconds": runtime_seconds,
        "notebook": notebook_summary(),
        "reproducibility": {
            "passed": bool(reproducibility and reproducibility[1]),
            "detail": reproducibility[2] if reproducibility else "Run the notebook twice and compare the saved baselines.",
            "measured": reproducibility is not None,
        },
        "metrics": {
            name: {
                "train_acc": metrics[name]["train_acc"],
                "val_acc": metrics[name]["val_acc"],
                "test_acc": metrics[name]["test_acc"],
                "train_acc_masked": metrics[name].get("train_acc_masked"),
                "val_acc_masked": metrics[name].get("val_acc_masked"),
                "test_acc_masked": metrics[name].get("test_acc_masked"),
                "params": metrics[name]["params"],
                "policy": metrics[name].get("policy", "plain"),
            }
            for name in MODEL_NAMES
        },
        "gameplay": {
            name: {
                opponent: {
                    key: gameplay[name][opponent][key]
                    for key in ("games", "wins", "draws", "losses", "missed_win_rate", "missed_block_rate", "illegal_rate")
                }
                for opponent in ("random", "minimax")
            }
            for name in MODEL_NAMES
        },
        "checks": [
            {"name": label, "passed": passed, "result": measured, "target": target}
            for label, passed, measured, target in acceptance_rows
        ] + [
            {
                "name": runtime_row[0],
                "passed": runtime_row[1],
                "result": runtime_row[2],
                "target": runtime_row[3],
            }
        ],
    }
    path = DATA / "acceptance.json"
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--save-run", type=Path, help="Save the current metrics as a baseline")
    parser.add_argument("--compare", type=Path, help="Compare current metrics with a saved baseline")
    args = parser.parse_args()

    REPORTS.mkdir(exist_ok=True)
    metrics = load_json(DATA / "metrics.json")
    gameplay = load_json(DATA / "gameplay_results.json")
    parity = load_json(DATA / "parity_test_vectors.json")

    file_rows = check_files()
    acceptance_rows = check_acceptance(metrics, gameplay, parity)
    notebook_rows = check_notebook()
    runtime_row = check_runtime()

    reproducibility = None
    if args.compare:
        baseline = load_json(args.compare)
        tolerance = 1e-9
        same = True
        for name in MODEL_NAMES:
            for key in COMPARE_KEYS:
                if key in baseline[name] and abs(float(metrics[name][key]) - float(baseline[name][key])) > tolerance:
                    same = False
        reproducibility = ("Two full runs identical", same,
                           "metrics match" if same else "metrics differ", "identical")

    all_rows = file_rows + notebook_rows + [runtime_row] + acceptance_rows
    if reproducibility:
        all_rows.append(reproducibility)

    failures = [row for row in all_rows if not row[1]]

    lines = ["# TicTacLearn — Part A acceptance report", ""]
    lines.append("Generated from `artifacts/` on the current run.\n")
    lines.append("Top-choice accuracy is the primary score: the network's first-ranked cell must be empty and optimal.")
    lines.append("The post-mask value is shown beside it, because that is the score a player experiences.\n")
    lines.append("| Check | Result | Value |")
    lines.append("|---|---|---|")
    for label, passed, value, *rest in all_rows:
        target = f" (target: {rest[0]})" if rest else ""
        lines.append(f"| {label} | {'PASS' if passed else 'FAIL'} | {value}{target} |")
    lines.append("")
    if failures:
        lines.append(f"**{len(failures)} check(s) failed.**")
    else:
        lines.append("**All checks passed.**")
    report = "\n".join(lines)
    (REPORTS / "acceptance_report.md").write_text(report, encoding="utf-8")
    acceptance_path = write_acceptance_json(metrics, gameplay, acceptance_rows, runtime_row, reproducibility)

    print(report)
    print(f"\nSaved {REPORTS / 'acceptance_report.md'}")
    print(f"Saved {acceptance_path}")

    if args.save_run:
        args.save_run.parent.mkdir(exist_ok=True)
        args.save_run.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        print(f"Saved baseline {args.save_run}")

    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
