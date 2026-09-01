interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "right";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <header className={`${align === "right" ? "text-right" : ""} ${className}`}>
      {eyebrow && (
        <p className="eyebrow mb-4 flex items-center gap-3">
          {align === "left" && <span className="h-px w-8 bg-line-strong" aria-hidden="true" />}
          {eyebrow}
        </p>
      )}
      <h2 className="display-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] text-ink">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-sm md:text-base text-ink-muted leading-relaxed max-w-md ${align === "right" ? "ml-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </header>
  );
}
