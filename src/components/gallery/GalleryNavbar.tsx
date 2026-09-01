"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../ui/Container";

const LINKS = [
  { href: "/anilar", label: "Anılar", activeMatch: ["/anilar", "/galeri"] },
  { href: "/ani", label: "Bir Anı Bırak", activeMatch: ["/ani", "/ani-birak"] },
  { href: "/galeri", label: "Galeri" },
] as const;

export function GalleryNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (match: readonly string[]) =>
    match.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <header className="gal-navbar sticky top-0 z-50 bg-[#f7f1e8]/95 backdrop-blur-sm border-b border-[#e8d7c7]/60">
      <Container className="flex items-center justify-between py-3.5 md:py-4">
        <Link href="/" className="display-serif text-xl text-[#3d2b25] tracking-wide shrink-0" aria-label="Ana sayfa">
          N <span className="text-[#b8664d]/80">&</span> T
        </Link>

        <nav className="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Ana menü">
          {LINKS.map((l) => {
            const active = "activeMatch" in l ? isActive(l.activeMatch) : pathname === l.href;
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`text-[0.65rem] font-medium tracking-[0.2em] uppercase transition-colors duration-300 pb-0.5 ${
                  active
                    ? "text-[#b8664d] border-b border-[#b8664d]"
                    : "text-[#3d2b25]/55 hover:text-[#b8664d] border-b border-transparent"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/ani" className="text-[#b8664d]/70 hover:text-[#b8664d] text-sm leading-none" aria-label="Anı bırak">
            ♡
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-[#3d2b25]/80"
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
        <nav className="md:hidden border-t border-[#e8d7c7]/60 bg-[#f7f1e8]/98 py-5 section-pad flex flex-col gap-4" aria-label="Mobil menü">
          {LINKS.map((l) => {
            const active = "activeMatch" in l ? isActive(l.activeMatch) : pathname === l.href;
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-[0.65rem] font-medium tracking-[0.2em] uppercase ${active ? "text-[#b8664d]" : "text-[#3d2b25]/55"}`}
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
