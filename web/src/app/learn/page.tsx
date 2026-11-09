import React from 'react';
import { BookOpen, Brain, Cpu, Filter, GitBranch, Layers, Sparkles, TrendingDown } from 'lucide-react';

export default function LearnPage() {
  const concepts = [
    {
      title: 'What is a Convolutional Neural Network (CNN)?',
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      analogy: 'Looking for recognizable shapes instead of memorizing pixels',
      explanation:
        'A CNN is a neural network designed to spot small local patterns regardless of where they appear. In Tic-Tac-Toe, a pattern might be "two of my marks in a row with the third cell open" or "the opponent is threatening a diagonal fork". Rather than following handwritten logic, the CNN discovers these visual patterns on its own.',
    },
    {
      title: 'What is a Filter (Kernel)?',
      icon: Filter,
      color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
      analogy: 'A small 3×3 magnifying lens sliding across the board',
      explanation:
        'A filter is a small matrix of learnable weights that slides across the grid, outputting a high score whenever its specific pattern is detected. In our project, the Underfit model only had 2 filters (too few lenses to detect forks, blocks, and wins), while the Master model has 32 and 64 filters.',
    },
    {
      title: 'Underfitting: The Unprepared Student',
      icon: Cpu,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      analogy: 'A student who skimmed the book for 5 minutes before the exam',
      explanation:
        'Underfitting happens when a model lacks the capacity or training time to learn the fundamental relationships in the data. Our Beginner AI has only 191 parameters. It cannot even learn to avoid occupied cells consistently, attempting illegal moves 47.8% of the time and missing over 62% of immediate wins.',
    },
    {
      title: 'Overfitting: The Memorizer',
      icon: Brain,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
      analogy: "A student who memorized last year's exam answers verbatim",
      explanation:
        'Overfitting happens when a model has tremendous capacity but trains on too few examples without regularization. It memorizes every detail of its practice examples rather than learning the underlying principles. When you shift even one piece on the board, its confidence shatters and its accuracy drops from 100% to 73.8%.',
    },
    {
      title: 'Generalization & Regularization: True Mastery',
      icon: Sparkles,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
      analogy: 'A student who understood the underlying mathematical principles',
      explanation:
        'Generalization is the model’s ability to perform correctly on boards it has never seen before. We achieved this in our Master AI using Dropout (randomly turning off 30% of neurons during training to prevent fragile co-dependencies) and Symmetry Augmentation (training on all 8 rotations and reflections of each board).',
    },
    {
      title: 'Leakage-Safe Symmetry Splits',
      icon: GitBranch,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      analogy: 'Not letting the student peek at rotated copies of the exam questions',
      explanation:
        'Tic-Tac-Toe has 8 geometric symmetries (4 rotations × 2 reflections). If a rotated version of a training board appeared in the test set, the test score would be artificially inflated! We grouped all 4,520 boards into 627 canonical symmetry groups, ensuring completely disjoint train, validation, and test splits.',
    },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
          <BookOpen className="h-4 w-4" />
          <span>Interactive Machine Learning Primer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white">
          Understanding CNNs & Generalization
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          No PhD in mathematics required. Learn core neural network concepts through simple analogies and real experimental evidence from our Tic-Tac-Toe project.
        </p>
      </div>

      {/* Concept Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {concepts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white leading-tight">
                  {item.title}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                  Plain-Language Analogy:
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 italic">
                  &quot;{item.analogy}&quot;
                </p>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

