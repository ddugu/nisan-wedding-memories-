import Link from "next/link";
import { Container } from "../ui/Container";

export function FinalCTA() {
  return (
    <section className="py-16 md:py-20 border-t border-line overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <p className="eyebrow mb-3">sen de katıl</p>
            <h2 className="display-serif text-[clamp(1.75rem,4vw,2.5rem)] text-ink leading-tight">
              Bu albümü birlikte büyütelim.
            </h2>
            <p className="mt-4 text-sm text-ink-muted max-w-md">
              Telefonundaki en güzel kareyi paylaş — anın hemen albümde yer alsın.
            </p>
          </div>
          <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:justify-end">
            <Link
              href="/ani"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 bg-terracotta text-bg-surface text-[0.75rem] font-semibold tracking-[0.1em] uppercase rounded-lg hover:bg-terracotta-hover transition-colors duration-300"
            >
              Bir Anı Bırak <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/galeri"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 border border-line text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-ink/70 rounded-lg hover:border-terracotta hover:text-terracotta transition-colors duration-300"
            >
              Galeriyi Gör
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
