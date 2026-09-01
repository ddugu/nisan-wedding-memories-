import type { MemoryWithThumbnail } from "@/lib/types";

interface QuoteCardProps {
  memory: MemoryWithThumbnail;
  className?: string;
}

export function QuoteCard({ memory, className = "" }: QuoteCardProps) {
  return (
    <article className={`bg-bg-warm/60 border border-line/60 rounded-lg p-6 md:p-8 flex flex-col justify-center min-h-[200px] ${className}`}>
      <p className="display-serif text-[clamp(1.1rem,2vw,1.35rem)] italic text-ink leading-relaxed">
        &ldquo;{memory.message}&rdquo;
      </p>
      <footer className="mt-5 flex items-center gap-3">
        <span className="h-px w-5 bg-terracotta/40" aria-hidden="true" />
        <cite className="text-sm text-ink-muted not-italic">{memory.guest_name || "Misafir"}</cite>
      </footer>
    </article>
  );
}
