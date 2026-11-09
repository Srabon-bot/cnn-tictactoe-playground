'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AcceptanceReport, fetchAcceptance } from '@/lib/data';

const CONCEPTS = [
  {
    concept: 'Convolutional network',
    where: '§7, §11',
    evidence: 'Three layer stacks with parameter counts; capacity changes what the model can learn.',
  },
  {
    concept: 'Filter (kernel)',
    where: '§7, §10',
    evidence: 'Two filters in the Beginner; 32 and 64 in the Steady model.',
  },
  {
    concept: 'Loss',
    where: '§7–§10',
    evidence: 'Train and validation cross-entropy drawn for every epoch.',
  },
  {
    concept: 'Underfitting',
    where: '§8, §11, §12',
    evidence: 'Low accuracy on every split, and a high missed-win rate in play.',
  },
  {
    concept: 'Overfitting',
    where: '§9, §11, §13',
    evidence: 'Perfect practice score, weak held-out score, and a visible failure after one piece moves.',
  },
  {
    concept: 'Regularisation',
    where: '§10',
    evidence: 'Dropout 0.3, early stopping, and a much smaller train–validation gap.',
  },
  {
    concept: 'Augmentation',
    where: '§10',
    evidence: 'Every training board expanded into all eight rotations and mirrors.',
  },
  {
    concept: 'Generalisation',
    where: '§11, §12',
    evidence: 'Symmetry-disjoint test boards, plus 1,000 games against random play and 200 against minimax.',
  },
  {
    concept: 'Symmetry leakage',
    where: '§3, §6',
    evidence: '627 canonical groups; the split is by group and disjointness is asserted.',
  },
  {
    concept: 'Legal-move masking',
    where: '§11, §12',
    evidence: 'Top-choice and post-mask accuracy reported side by side, never one without the other.',
  },
];

function statusClass(passed: boolean) {
  return passed ? 'status status--pass' : 'status status--fail';
}

export default function TeacherPage() {
  const [report, setReport] = useState<AcceptanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchAcceptance()
      .then((value) => {
        if (active) setReport(value);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'The report could not load.');
      });
    return () => {
      active = false;
    };
  }, []);

  const generated = report
    ? new Date(report.generated_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <main>
      <div className="container">
        <div className="page-head page-head-row">
          <div>
            <p className="label">Teacher</p>
            <h1 className="display">The course behind the game</h1>
            <p className="lead">
              A map from the syllabus to the evidence, followed by the acceptance report the
              notebook produced.
            </p>
          </div>
          <div className="page-head-actions">
            <a className="btn btn--small" href="/artifacts/artifacts.zip">
              Download artifacts
            </a>
            <a
              className="btn btn--small"
              href="https://github.com/Srabon-bot/cnn-tictactoe-playground/blob/main/tictactoe_cnn.ipynb"
              rel="noreferrer"
            >
              Open the notebook
            </a>
          </div>
        </div>

        <section className="section section--tight" aria-labelledby="map-title">
          <div className="section-head section-head--wide">
            <h2 id="map-title">Concept map</h2>
            <p className="section-note">
              Each row names a course idea, the notebook section that teaches it, and the
              evidence a reviewer can open.
            </p>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Concept</th>
                  <th scope="col">Notebook</th>
                  <th scope="col">Evidence</th>
                </tr>
              </thead>
              <tbody>
                {CONCEPTS.map((row) => (
                  <tr key={row.concept}>
                    <th scope="row">{row.concept}</th>
                    <td className="num">{row.where}</td>
                    <td>{row.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section section--tight" aria-labelledby="acceptance-title">
          <div className="section-head section-head--wide">
            <h2 id="acceptance-title">Acceptance report</h2>
            <p className="section-note">
              Read from <code>artifacts/data/acceptance.json</code>, the same file the checker
              writes. Nothing on this table is typed by hand.
            </p>
          </div>

          {error ? (
            <p role="alert" className="note-block">
              {error}
            </p>
          ) : !report ? (
            <p className="muted">Reading the report.</p>
          ) : (
            <>
              <div className="side-readout" style={{ maxWidth: '42rem', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <strong>{report.checks.filter((check) => check.passed).length}/{report.checks.length}</strong>
                  <span>checks passed</span>
                </div>
                <div>
                  <strong>{report.runtime_seconds ? (report.runtime_seconds / 60).toFixed(1) : '—'} min</strong>
                  <span>notebook runtime</span>
                </div>
                <div>
                  <strong>{report.reproducibility.measured ? (report.reproducibility.passed ? 'Yes' : 'No') : 'Run twice'}</strong>
                  <span>reproducibility</span>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th scope="col">Check</th>
                      <th scope="col">Result</th>
                      <th scope="col">Measured</th>
                      <th scope="col">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.checks.map((check) => (
                      <tr key={check.name}>
                        <th scope="row">{check.name}</th>
                        <td>
                          <span className={statusClass(check.passed)}>
                            {check.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td className="num">{check.result}</td>
                        <td className="muted">{check.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="label" style={{ marginTop: 'var(--space-sm)' }}>
                Generated {generated}. Reproducibility: {report.reproducibility.detail}
              </p>
            </>
          )}
        </section>

        <section className="section section--tight" aria-labelledby="downloads-title">
          <div className="section-head">
            <h2 id="downloads-title">What to download</h2>
            <p className="section-note">The notebook is the source; the archive is the run.</p>
          </div>
          <div className="download-list">
            <a className="download" href="/artifacts/artifacts.zip">
              <strong>artifacts.zip</strong>
              <span>Models, histories, plots, parity vectors and JSON used by this site</span>
            </a>
            <a
              className="download"
              href="https://github.com/Srabon-bot/cnn-tictactoe-playground/blob/main/tictactoe_cnn.ipynb"
              rel="noreferrer"
            >
              <strong>tictactoe_cnn.ipynb</strong>
              <span>Executed notebook with saved outputs</span>
            </a>
            <a
              className="download"
              href="https://github.com/Srabon-bot/cnn-tictactoe-playground"
              rel="noreferrer"
            >
              <strong>Source repository</strong>
              <span>Notebook builder, acceptance checker and this website</span>
            </a>
          </div>
          <p style={{ marginTop: 'var(--space-lg)' }}>
            <Link className="text-link" href="/learn">
              Read the concept explanations
            </Link>{" "}
            or{" "}
            <Link className="text-link" href="/play">
              play a game
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
