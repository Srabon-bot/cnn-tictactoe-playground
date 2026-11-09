import Link from 'next/link';
import { ArrowRight, Brain, Cpu, Sparkles, BookOpen, GraduationCap, BarChart2, ShieldCheck } from 'lucide-react';

export default function Home() {
  const levels = [
    {
      id: 'underfit',
      title: 'Level 1: Beginner',
      subtitle: 'Underfitted CNN (191 params)',
      analogy: 'Skimmed the book for 5 minutes',
      badge: 'Underfit',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      icon: Cpu,
      description:
        'Lacks the capacity to recognize winning lines. Regularly misses immediate wins (62.5% missed) and tries to play occupied squares (47.8% illegal attempts).',
    },
    {
      id: 'overfit',
      title: 'Level 2: Memorizer',
      subtitle: 'Overfitted CNN (687,625 params)',
      analogy: "Memorized last year's exam answers",
      badge: 'Overfit',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      icon: Brain,
      description:
        '100% accurate on its 60 practice positions, but collapses to 73.8% on new boards. A steep 26.2% generalization gap demonstrates that memorizing is not understanding.',
    },
    {
      id: 'stable',
      title: 'Level 3: Master',
      subtitle: 'Stable & Regularized (93,833 params)',
      analogy: 'Understood the underlying concepts',
      badge: 'Optimal',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      icon: Sparkles,
      description:
        'Trained with 8× symmetry augmentation and dropout. Reaches 95.9% test accuracy on unseen boards, makes 0% illegal attempts, and draws 86.5% of games against minimax.',
    },
  ];

  return (
    <div className="space-y-16 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <GraduationCap className="h-4 w-4" />
          <span>Department of Computer Science & Engineering • UITS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Learn by Playing:{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
            A CNN Tic-Tac-Toe Game
          </span>{' '}
          for Teaching Overfitting & Generalization
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Play against three distinct convolutional neural networks trained on the exact same game. Inspect real-time 3×3 probability heatmaps to see what happens when AI barely learns, memorizes, or truly generalizes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/play"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>Start Playing Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-sm transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Compare AI Metrics</span>
          </Link>
        </div>
      </section>

      {/* The 3 Levels Section */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Meet the Three Opponents
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Each AI represents a foundational concept in Machine Learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map(lvl => {
            const Icon = lvl.icon;
            return (
              <div
                key={lvl.id}
                className="flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${lvl.badgeColor}`}>
                      {lvl.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white">{lvl.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{lvl.subtitle}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                      Student Analogy:
                    </span>
                    <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 italic">
                      &quot;{lvl.analogy}&quot;
                    </p>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <Link
                  href={`/play`}
                  className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  Challenge {lvl.title.split(':')[1]}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="p-2 w-fit rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <BookOpen className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">Move-by-Move Heatmaps</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every AI turn records the exact 3×3 probability vector before and after legal-move masking, allowing you to peek directly into the network&apos;s weights.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="p-2 w-fit rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">Ground-Truth Parity</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Client-side browser inference is mathematically verified against Python test vectors, guaranteeing identical predictions between Python and JavaScript.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="p-2 w-fit rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-zinc-900 dark:text-white text-base">Teacher Evidence View</h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            A dedicated academic dashboard that connects course syllabus concepts (Loss, Convolutions, Regularization, Augmentation) directly to empirical evidence.
          </p>
        </div>
      </section>
    </div>
  );
}
