import type { CSSProperties } from "react";
import Link from "next/link";

interface CtaCardProps {
  index?: number;
}

export function CtaCard({ index = 0 }: CtaCardProps) {
  const rotations = ["-1deg", "1.5deg", "-0.5deg", "2deg"];
  const rotate = rotations[index % rotations.length];

  return (
    <article
      className="gal-card gal-cta gal-fade-in"
      style={{ "--gal-rotate": rotate, "--gal-delay": `${index * 0.06}s` } as CSSProperties}
    >
      <div className="gal-cta-inner">
        <svg className="gal-cta-icon" viewBox="0 0 48 40" fill="none" aria-hidden="true">
          <rect x="6" y="10" width="36" height="26" rx="2" stroke="currentColor" strokeWidth="1" />
          <circle cx="24" cy="23" r="6" stroke="currentColor" strokeWidth="0.9" />
          <path d="M18 6 L22 10 M30 6 L26 10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
          <text x="30" y="18" fontSize="8" fill="currentColor">♡</text>
        </svg>
        <p className="gal-cta-text font-hand">Sen de bir anı bırak ♡</p>
        <Link href="/ani" className="gal-cta-btn">
          Bir Anı Bırak →
        </Link>
      </div>
    </article>
  );
}
