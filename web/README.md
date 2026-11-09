# TicTacLearn - website

The Part B site. It is a static Next.js application with no backend, no accounts and no stored
scores. Every model move is computed in the browser from the exported weights.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The Play page needs the artifact files in `public/artifacts/`; they
are committed with the project and refreshed after a notebook run.

## Checks

```powershell
npm run test    # parity, rules and move-analysis tests
npm run lint
npm run build
```

## Artifacts

`public/artifacts/` mirrors the notebook's `artifacts/` output:

- `data/` - metrics, histories, gameplay records, parity vectors and `acceptance.json`
- `models/<level>/weights.json` - portable forward-pass weights
- `plots/` - the figures drawn in the notebook
- `artifacts.zip` - the full downloadable archive

The site never invents a number. The Compare and Teacher pages read these JSON files at runtime,
so a new notebook run updates the site after the files are copied.

## Inference

`src/lib/engine/inference.ts` is a hand-written implementation of the exported CNN. The notebook
tries TensorFlow.js conversion first; the installed converter cannot read the current Keras format,
so the notebook writes `weights.json` and records the fallback in `export_status.json`. The About
page explains this openly. `src/lib/engine/engine.test.ts` compares twenty Python parity vectors per
model with the JavaScript output.

## Deploy

`vercel.json` is prepared for a Vercel import with the project root set to `web/`. Nothing has been
deployed from this repository. No environment variables are required.

## Structure

```
src/app/          Home, Play, Learn, Compare, Teacher and About routes
src/components/   Board, reports, charts, navigation and the hero instrument
src/lib/engine/   Rules, inference, analysis and parity tests
src/lib/          Artifact types, fetchers and level copy
public/artifacts/ Notebook output copied for the browser
```
