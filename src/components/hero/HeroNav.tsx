"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/galeri", label: "Anılar" },
  { href: "/ani", label: "Bir Anı Bırak" },
  { href: "/galeri", label: "Galeri" },
] as const;

export function HeroNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-30 w-full">
      <div className="hero-pad flex items-center justify-between py-4 md:py-5">
        <Link
          href="/"
          className="display-serif text-[1.4rem] md:text-[1.55rem] text-ink tracking-wide animate-hero-text hero-delay-1"
          aria-label="Ana sayfa"
        >
          N <span className="text-terracotta">&</span> T
        </Link>

        <nav className="hidden lg:flex items-center gap-7 xl:gap-9 animate-hero-text hero-delay-1" aria-label="Ana menü">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-ink/70 hover:text-terracotta transition-colors duration-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="lg:hidden p-2 -mr-2 text-ink/80"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          <span className={`block w-5 h-px bg-current mb-1.5 transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-px bg-current mb-1.5 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-current transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {open && (
        <nav
          className="lg:hidden border-t border-line/50 bg-bg/98 py-5 hero-pad flex flex-col gap-4"
          aria-label="Mobil menü"
        >
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-ink/70 hover:text-terracotta"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
