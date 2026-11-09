'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, BarChart2, BookOpen, GraduationCap, Users, Github, Sparkles } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/play', label: 'Play Game', icon: Gamepad2 },
    { href: '/compare', label: 'Compare AI', icon: BarChart2 },
    { href: '/learn', label: 'Learn ML', icon: BookOpen },
    { href: '/teacher', label: 'Teacher View', icon: GraduationCap },
    { href: '/about', label: 'About & Team', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-zinc-900 transition-opacity hover:opacity-90 dark:text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg leading-tight font-extrabold text-indigo-600 dark:text-indigo-400">TicTacLearn</span>
            <span className="text-[10px] tracking-wider uppercase text-zinc-500 dark:text-zinc-400 font-medium">CNN & Generalization</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400 font-semibold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Srabon-bot/cnn-tictactoe-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <Link
            href="/play"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Play Now
          </Link>
        </div>
      </div>
    </header>
  );
}

