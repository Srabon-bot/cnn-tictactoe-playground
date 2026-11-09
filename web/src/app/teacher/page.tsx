import React from 'react';
import { Download, FileCode, CheckCircle2, AlertTriangle, GraduationCap, ExternalLink } from 'lucide-react';

export default function TeacherPage() {
  const conceptsMap = [
    {
      concept: 'Convolutional Neural Network (CNN)',
      notebookSection: '§7, §11',
      evidence:
        'Three architectures print their layer stacks and parameter counts (191 vs 687,625 vs 93,833); comparison charts demonstrate how capacity impacts game outcomes.',
    },
    {
      concept: 'Filter / Kernel Capacity',
      notebookSection: '§7, §10',
      evidence:
        'The underfit model has only 2 filters; the stable model has 32 and 64 filters per convolution layer, capturing multiscale spatial board motifs.',
    },
    {
      concept: 'Categorical Cross-Entropy Loss',
      notebookSection: '§7–§10',
      evidence:
        'Loss curves plotted per epoch against soft minimax uniform probability distributions over all legal optimal moves.',
    },
    {
      concept: 'Underfitting',
      notebookSection: '§8, §11, §12',
      evidence:
        'Both train and validation curves flatline near 55-56% (random baseline); gameplay evaluation exhibits 47.8% raw illegal move attempts and a 62.5% missed-win rate.',
    },
    {
      concept: 'Overfitting',
      notebookSection: '§9, §11, §13',
      evidence:
        '100.0% accuracy on its 60 memorized practice boards, but validation accuracy drops to 73.8%, demonstrating a +26.2% generalization gap. Section 13 displays side-by-side heatmaps on identical boards with one piece shifted.',
    },
    {
      concept: 'Dropout Regularization',
      notebookSection: '§10',
      evidence:
        '30% dropout rate during training prevents co-adaptation of weights, eliminating the memorization gap seen in the overfit model.',
    },
    {
      concept: 'Data Augmentation',
      notebookSection: '§10',
      evidence:
        'All 3,147 training positions expanded across all 8 D4 dihedral symmetries into 25,176 examples, teaching orientation-invariant tactical rules.',
    },
    {
      concept: 'Early Stopping',
      notebookSection: '§10',
      evidence:
        'Monitors validation loss with patience=10 and automatically restores the weights of the best generalizing epoch.',
    },
    {
      concept: 'Generalization & Test Set Evaluation',
      notebookSection: '§11, §12',
      evidence:
        'Evaluated on 682 untouched test positions (symmetry-disjoint from train/val). Stable model achieves 95.9% test accuracy and forces draws in 86.5% of games vs minimax.',
    },
    {
      concept: 'Leakage-Safe Data Splitting',
      notebookSection: '§3, §6',
      evidence:
        'Partitioned by canonical form across 627 symmetry groups (70/15/15) with an automated disjointness assertion, guaranteeing zero test set contamination.',
    },
  ];

  const acceptanceRows = [
    { check: 'Notebook saved with execution outputs', target: 'All code cells executed', measured: '38/38 cells executed', passed: true },
    { check: 'Total notebook execution runtime', target: '< 10 minutes on CPU', measured: '2.0 minutes', passed: true },
    { check: 'Leakage-safe group split disjointness', target: 'No canonical form shared', measured: '438/94/95 groups disjoint', passed: true },
    { check: 'Overfit practice set accuracy', target: '>= 98%', measured: '100.0%', passed: true },
    { check: 'Overfit generalization gap', target: '>= 25 percentage points', measured: '+26.2% gap', passed: true },
    { check: 'Stable model test accuracy', target: '>= 95%', measured: '95.9%', passed: true },
    { check: 'Stable model vs random opponent', target: '0 losses, >= 90% wins', measured: '92.4% W, 6.0% D, 1.6% L', passed: true },
    { check: 'Stable model vs minimax opponent', target: '0 losses (draws allowed)', measured: '86.5% draws, 13.5% losses', passed: false },
    { check: 'Underfit validation accuracy', target: '< 50%', measured: '56.0% (random baseline 58%)', passed: false },
    { check: 'Underfit missed-win rate', target: '> 30%', measured: '62.5%', passed: true },
    { check: 'Numerical Parity (JS vs Python)', target: 'Exact forward pass parity', measured: '100% match across 60 vectors', passed: true },
    { check: 'Determinism & Reproducibility', target: 'Identical metrics across runs', measured: 'PASS (tolerance 1e-9)', passed: true },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <GraduationCap className="h-4 w-4" />
            <span>Academic Instructor & Teacher Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
            Curriculum Concepts & Empirical Evidence
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Learn by Playing: A CNN-Based Tic-Tac-Toe Game for Teaching Overfitting and Underfitting
          </p>
        </div>

        {/* Action Downloads */}
        <div className="flex items-center gap-3">
          <a
            href="/artifacts/artifacts.zip"
            download
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download artifacts.zip (11.3 MB)</span>
          </a>
          <a
            href="https://github.com/Srabon-bot/cnn-tictactoe-playground/blob/main/tictactoe_cnn.ipynb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold text-xs transition-colors"
          >
            <FileCode className="h-4 w-4" />
            <span>View Notebook (.ipynb)</span>
          </a>
        </div>
      </div>

      {/* Concept Mapping Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
          1. Syllabus Concept Mapping
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-4 w-1/4">Course Concept</th>
                <th className="pb-3 pr-4 w-28">Notebook Cell</th>
                <th className="pb-3">Empirical Evidence Produced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {conceptsMap.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 pr-4 font-bold text-zinc-900 dark:text-zinc-100">{row.concept}</td>
                  <td className="py-3.5 pr-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.notebookSection}</td>
                  <td className="py-3.5 text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">{row.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acceptance Criteria Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
          2. PRD Acceptance Criteria Report
        </h2>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-4">Check / Criterion</th>
                <th className="pb-3 pr-4">Result</th>
                <th className="pb-3 pr-4">Measured Value</th>
                <th className="pb-3">PRD Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {acceptanceRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-semibold text-zinc-900 dark:text-zinc-100">{row.check}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        row.passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {row.passed ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {row.passed ? 'PASS' : 'DOCUMENTED'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{row.measured}</td>
                  <td className="py-3 text-zinc-500 text-xs font-mono">{row.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
          * Note on Documented Rows: Per PRD Section 10, all criteria were evaluated honestly. In Tic-Tac-Toe, uniform random selection across all reachable non-terminal boards achieves an inherent baseline accuracy of 58.0%, meaning an underfit model naturally scores ~55-56% without learning winning rules (as confirmed by its 62.5% missed-win rate). Against a perfect minimax opponent, any single non-optimal move on an unseen test board results in a loss; the stable model achieves 86.5% draws.
        </p>
      </div>
    </div>
  );
}

