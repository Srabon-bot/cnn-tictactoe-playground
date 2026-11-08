"""Execute tictactoe_cnn.ipynb in place with the local verification kernel.

The notebook writes to /content/artifacts by default (for Colab). This runner points
TTT_ARTIFACT_DIR at the repository's artifacts/ folder, executes every cell, saves the
notebook with outputs and records the wall-clock runtime for the 10-minute budget.

Usage:
    .\\.venv\\Scripts\\python.exe tools\\execute_notebook.py
"""
from __future__ import annotations

import json
import os
import time
from pathlib import Path

import nbformat
from nbclient import NotebookClient
from nbclient.exceptions import CellExecutionError

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = ROOT / "tictactoe_cnn.ipynb"
KERNEL_NAME = "tic-taclearn"
TIMEOUT_SECONDS = 1800


def main() -> int:
    if not NOTEBOOK_PATH.exists():
        print("Notebook not found. Run tools/build_notebook.py first.")
        return 1

    os.environ["TTT_ARTIFACT_DIR"] = str(ROOT / "artifacts")
    os.environ["JUPYTER_PATH"] = str(ROOT / ".venv" / "share" / "jupyter")

    notebook = nbformat.read(NOTEBOOK_PATH, as_version=4)
    client = NotebookClient(
        notebook,
        timeout=TIMEOUT_SECONDS,
        kernel_name=KERNEL_NAME,
        resources={"metadata": {"path": str(ROOT)}},
        record_timing=True,
    )

    started = time.time()
    status = "ok"
    try:
        client.execute()
    except CellExecutionError as exc:
        status = "error"
        print(exc)
    finally:
        elapsed = time.time() - started
        nbformat.write(notebook, NOTEBOOK_PATH)
        reports = ROOT / "reports"
        reports.mkdir(exist_ok=True)
        (reports / "last_run.json").write_text(
            json.dumps(
                {
                    "status": status,
                    "seconds": round(elapsed, 1),
                    "minutes": round(elapsed / 60, 2),
                    "kernel": KERNEL_NAME,
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        print(f"Notebook execution {status} in {elapsed / 60:.1f} min")

    return 0 if status == "ok" else 1


if __name__ == "__main__":
    raise SystemExit(main())
