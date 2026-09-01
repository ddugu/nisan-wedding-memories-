interface QuoteProps {
  text: string;
  author: string;
  className?: string;
}

export function Quote({ text, author, className = "" }: QuoteProps) {
  return (
    <blockquote className={`${className}`}>
      <p className="display-serif text-[clamp(1.25rem,3vw,1.75rem)] leading-snug text-ink italic">
        &ldquo;{text}&rdquo;
      </p>
      <footer className="mt-5 flex items-center gap-3">
        <span className="h-px w-6 bg-terracotta/40" aria-hidden="true" />
        <cite className="text-sm text-ink-muted not-italic font-medium">{author}</cite>
      </footer>
    </blockquote>
  );
}
