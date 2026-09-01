"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "../ui/Container";

const LINKS = [
  { href: "/galeri", label: "Anılar" },
  { href: "/ani", label: "Bir Anı Bırak" },
  { href: "/galeri", label: "Galeri" },
];

export function Header({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false);

  if (minimal) {
    return (
      <header className="sticky top-0 z-50 bg-bg/92 backdrop-blur-sm">
        <Container className="flex items-center justify-between py-4">
          <Link href="/" className="display-serif text-lg text-ink tracking-wide" aria-label="Ana sayfa">
            N<span className="text-terracotta/60">&</span>T
          </Link>
        </Container>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm">
      <Container className="flex items-center justify-between py-4 md:py-5">
        <Link href="/" className="display-serif text-xl text-ink tracking-wide shrink-0" aria-label="Ana sayfa">
          N<span className="text-terracotta/60">&</span>T
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-10" aria-label="Ana menü">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-[0.65rem] font-medium tracking-[0.2em] uppercase text-ink/60 hover:text-terracotta transition-colors duration-300"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/ani"
            className="text-terracotta/70 hover:text-terracotta transition-colors text-sm"
            aria-label="Anı bırak"
          >
            ♡
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          <span className={`block w-5 h-px bg-ink mb-1.5 transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-px bg-ink mb-1.5 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-ink transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </Container>

      {open && (
        <nav className="md:hidden border-t border-line/60 bg-bg/98 py-5 section-pad flex flex-col gap-5" aria-label="Mobil menü">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-[0.65rem] font-medium tracking-[0.2em] uppercase text-ink/60">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
