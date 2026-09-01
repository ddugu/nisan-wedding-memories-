"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../ui/Container";

const LINKS = [
  { href: "/anilar", label: "Anılar" },
  { href: "/ani", label: "Bir Anı Bırak", activeMatch: ["/ani", "/ani-birak"] },
  { href: "/galeri", label: "Galeri" },
] as const;

export function AniNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (match: readonly string[]) => match.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <header className="sticky top-0 z-50 bg-bg/94 backdrop-blur-sm border-b border-line/35">
      <Container className="flex items-center justify-between py-3 md:py-3.5">
        <Link href="/" className="display-serif text-xl text-ink tracking-wide shrink-0" aria-label="Ana sayfa">
          N <span className="text-terracotta/80">&</span> T
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Ana menü">
          {LINKS.map((l) => {
            const active = "activeMatch" in l && isActive(l.activeMatch);
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`text-[0.65rem] font-medium tracking-[0.2em] uppercase transition-colors duration-300 pb-0.5 ${
                  active
                    ? "text-terracotta border-b border-terracotta"
                    : "text-ink/60 hover:text-terracotta border-b border-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/ani" className="text-terracotta/70 hover:text-terracotta text-sm leading-none" aria-label="Anı bırak">
            ♡
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-ink/80"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
        >
          <span className={`block w-5 h-px bg-current mb-1.5 transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-px bg-current mb-1.5 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-current transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </Container>

      {open && (
        <nav className="md:hidden border-t border-line/50 bg-bg/98 py-5 section-pad flex flex-col gap-4" aria-label="Mobil menü">
          {LINKS.map((l) => {
            const active = "activeMatch" in l && isActive(l.activeMatch);
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-[0.65rem] font-medium tracking-[0.2em] uppercase ${active ? "text-terracotta" : "text-ink/60"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
