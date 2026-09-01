"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemories } from "@/hooks/useMemories";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";

const SLOTS = ["bento-1", "bento-2", "bento-3", "bento-4", "bento-5"] as const;
const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[4/5]", "aspect-[3/2]", "aspect-square"];

function EmptyCell({ className, aspect }: { className: string; aspect: string }) {
  return (
    <div className={`${className} ${aspect} bg-bg-warm/80 border border-line rounded-lg flex items-center justify-center`}>
      <span className="text-ink-muted/20 text-[10px] tracking-[0.3em] uppercase">—</span>
    </div>
  );
}

export function MemoryPreview() {
  const { memories, loading } = useMemories({ limit: 5 });
  const count = memories.length;

  return (
    <section className="py-14 md:py-20 border-t border-line bg-bg-warm/30">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 mb-10 md:mb-12 items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-3">canlı albüm</p>
            <h2 className="display-serif text-[clamp(1.75rem,4vw,2.75rem)] text-ink leading-tight">
              Bu günden kalan küçük anlar.
            </h2>
          </div>
          <div className="md:col-span-4 md:text-right">
            <p className="text-sm text-ink-muted">
              {loading ? "Yükleniyor..." : count > 0 ? `Henüz ${count} anı birikti` : "İlk anıyı sen bırak"}
            </p>
            <Link href="/galeri" className="inline-block mt-2 text-[0.75rem] font-semibold tracking-[0.08em] uppercase text-terracotta hover:text-terracotta-hover transition-colors">
              Galeriyi gör →
            </Link>
          </div>
        </div>

        <div className="bento-grid">
          {loading
            ? SLOTS.map((s, i) => <EmptyCell key={s} className={s} aspect={ASPECTS[i]} />)
            : SLOTS.map((slot, i) => {
                const m = memories[i];
                if (!m) return <EmptyCell key={slot} className={slot} aspect={ASPECTS[i]} />;
                return (
                  <Link key={m.id} href="/galeri" className={`${slot} group block overflow-hidden rounded-lg`}>
                    <div className={`relative w-full h-full min-h-[140px] ${ASPECTS[i]} overflow-hidden bg-bg-warm`}>
                      <Image
                        src={m.thumbnail_url || m.image_url || ""}
                        alt={m.guest_name ? `${m.guest_name} anısı` : "Anı"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width:768px) 50vw, 30vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/15 transition-colors duration-400" />
                      {m.guest_name && (
                        <p className="absolute bottom-3 left-3 text-[11px] font-medium text-bg-surface opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                          {m.guest_name}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
        </div>

        {count > 0 && (
          <div className="mt-10 md:hidden">
            <Button href="/galeri" variant="outline" fullWidth>Galeriyi Gör</Button>
          </div>
        )}
      </Container>
    </section>
  );
}
