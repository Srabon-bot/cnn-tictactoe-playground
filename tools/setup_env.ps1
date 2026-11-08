# Creates the local verification environment used to execute tictactoe_cnn.ipynb.
# The notebook itself is unchanged for Google Colab; this script only proves it runs
# end to end and lets us commit real outputs and artifacts.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    if (-not (Test-Path ".venv\Scripts\python.exe")) {
        py -3.10 -m venv .venv
    }

    $python = ".\.venv\Scripts\python.exe"
    & $python -m pip install --upgrade pip setuptools wheel
    & $python -m pip install -r requirements-notebook.txt

    # tensorflowjs pins an old `packaging` release and asks for the full TensorFlow
    # package. Install it without dependencies so it reuses tensorflow-cpu.
    & $python -m pip install --no-deps tensorflowjs==4.22.0 tf-keras==2.21.0

    # Small runtime dependencies the converter imports.
    & $python -m pip install tensorflow-hub

    # Register a private Jupyter kernel for tools/execute_notebook.py.
    & $python -m ipykernel install --prefix .venv --name tic-taclearn
}
finally {
    Pop-Location
}
