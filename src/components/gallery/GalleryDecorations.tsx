import "./gallery.css";

export function GalleryDecorations() {
  return (
    <div className="gal-decor" aria-hidden="true">
      <div className="gal-decor-texture" />
      <div className="gal-torn-edge gal-torn-edge-top" />
      <div className="gal-torn-edge gal-torn-edge-bottom" />

      <span className="gal-sparkle gal-sparkle-1">✦</span>
      <span className="gal-sparkle gal-sparkle-2">✦</span>
      <span className="gal-sparkle gal-sparkle-3">♡</span>
      <span className="gal-sparkle gal-sparkle-4">·</span>
      <span className="gal-sparkle gal-sparkle-5">✦</span>

      <svg className="gal-branch gal-branch-tr" viewBox="0 0 100 160" fill="none">
        <path d="M50 155 Q44 110 50 70 Q56 30 48 8" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="62" cy="42" rx="8" ry="5" stroke="currentColor" strokeWidth="0.65" transform="rotate(-15 62 42)" />
        <ellipse cx="38" cy="78" rx="7" ry="4" stroke="currentColor" strokeWidth="0.6" transform="rotate(10 38 78)" />
        <ellipse cx="58" cy="108" rx="6" ry="3.5" stroke="currentColor" strokeWidth="0.55" />
      </svg>

      <svg className="gal-branch gal-branch-bl" viewBox="0 0 80 120" fill="none">
        <path d="M40 115 Q36 85 40 55 Q44 25 38 6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M40 68 Q58 62 64 72" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
        <ellipse cx="66" cy="74" rx="5" ry="3" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      <svg className="gal-branch gal-branch-br" viewBox="0 0 70 100" fill="none">
        <path d="M35 96 Q30 68 36 40 Q42 14 34 4" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" />
        <ellipse cx="48" cy="32" rx="6" ry="3.5" stroke="currentColor" strokeWidth="0.55" transform="rotate(-12 48 32)" />
      </svg>
    </div>
  );
}
