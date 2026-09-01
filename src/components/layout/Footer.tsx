import Link from "next/link";
import { Container } from "../ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-line/60 py-12 md:py-14">
      <Container className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <p className="display-serif text-2xl text-ink">
            Necati <span className="text-terracotta italic">&</span> Tuğçe
          </p>
          <p className="mt-2 text-[0.65rem] tracking-[0.2em] uppercase text-ink-muted">2 Eylül 2026</p>
        </div>
        <div className="flex gap-6 text-[0.65rem] tracking-[0.15em] uppercase text-ink-muted">
          <Link href="/galeri" className="hover:text-terracotta transition-colors">Galeri</Link>
          <Link href="/ani" className="hover:text-terracotta transition-colors">Anı Bırak</Link>
        </div>
      </Container>
      <Container className="mt-8 pt-6 border-t border-line/40">
        <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted/70 text-center sm:text-left">
          N&T · Anılarımız
        </p>
      </Container>
    </footer>
  );
}
