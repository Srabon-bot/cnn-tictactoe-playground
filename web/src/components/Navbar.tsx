"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./Wordmark";

const NAV_ITEMS = [
  { href: "/play", label: "Play" },
  { href: "/learn", label: "Learn" },
  { href: "/compare", label: "Compare" },
  { href: "/teacher", label: "Teacher" },
  { href: "/about", label: "Team" },
];

export function Navbar() {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="TicTacLearn home">
          <Wordmark />
          <span>TicTacLearn</span>
        </Link>

        <nav className="nav-main" aria-label="Main">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-link"
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/play" className="btn btn--primary btn--small nav-play">
            Take a turn
          </Link>
        </nav>

        <details className="mobile-menu">
          <summary>Menu</summary>
          <div className="mobile-menu-panel">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </header>
  );
}
