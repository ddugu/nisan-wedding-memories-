export function HeroDecorations() {
  return (
    <>
      {/* Left botanical — wheat / lavender */}
      <svg
        className="absolute left-[2%] xl:left-[4%] top-[22%] w-[52px] h-[100px] text-ink/18 hidden md:block pointer-events-none"
        viewBox="0 0 52 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M26 8 Q30 30 26 52 Q22 74 26 94" stroke="currentColor" strokeWidth="0.75" />
        <ellipse cx="32" cy="28" rx="7" ry="4" stroke="currentColor" strokeWidth="0.65" transform="rotate(-18 32 28)" />
        <ellipse cx="20" cy="42" rx="6" ry="3.5" stroke="currentColor" strokeWidth="0.65" transform="rotate(12 20 42)" />
        <ellipse cx="30" cy="58" rx="5" ry="3" stroke="currentColor" strokeWidth="0.6" transform="rotate(-8 30 58)" />
        <ellipse cx="18" cy="72" rx="6" ry="3.5" stroke="currentColor" strokeWidth="0.6" transform="rotate(15 18 72)" />
      </svg>

      {/* Right botanical */}
      <svg
        className="absolute right-[3%] xl:right-[5%] top-[16%] w-[40px] h-[72px] text-ink/15 hidden md:block pointer-events-none"
        viewBox="0 0 40 72"
        fill="none"
        aria-hidden="true"
      >
        <path d="M20 6 Q26 22 22 38 Q18 54 20 68" stroke="currentColor" strokeWidth="0.7" />
        <ellipse cx="26" cy="24" rx="5" ry="3" stroke="currentColor" strokeWidth="0.55" transform="rotate(-20 26 24)" />
        <ellipse cx="15" cy="44" rx="4.5" ry="2.5" stroke="currentColor" strokeWidth="0.55" />
      </svg>

      {/* Sparkles — scattered */}
      <svg className="absolute left-[10%] top-[38%] w-3 h-3 text-terracotta/30 hidden lg:block pointer-events-none" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 0 L6.8 5.2 L12 6 L6.8 6.8 L6 12 L5.2 6.8 L0 6 L5.2 5.2 Z" fill="currentColor" />
      </svg>
      <svg className="absolute left-[14%] top-[52%] w-2 h-2 text-rose/35 hidden lg:block pointer-events-none" viewBox="0 0 8 8" aria-hidden="true">
        <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      </svg>
      <svg className="absolute right-[12%] top-[42%] w-2.5 h-2.5 text-terracotta/25 hidden lg:block pointer-events-none" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M5 0 L5.6 4.4 L10 5 L5.6 5.6 L5 10 L4.4 5.6 L0 5 L4.4 4.4 Z" fill="currentColor" />
      </svg>
      <svg className="absolute right-[8%] top-[58%] w-2 h-2 text-ink/15 hidden lg:block pointer-events-none" viewBox="0 0 8 8" aria-hidden="true">
        <circle cx="4" cy="4" r="1" fill="currentColor" />
      </svg>
    </>
  );
}

export function CollageSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <svg className="absolute -top-2 right-[18%] w-3 h-3 text-terracotta/35" viewBox="0 0 12 12">
        <path d="M6 0 L6.8 5.2 L12 6 L6.8 6.8 L6 12 L5.2 6.8 L0 6 L5.2 5.2 Z" fill="currentColor" />
      </svg>
      <svg className="absolute top-[8%] right-[8%] w-2 h-2 text-rose/40" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      </svg>
      <svg className="absolute top-[20%] -right-1 w-2.5 h-2.5 text-terracotta/30" viewBox="0 0 10 10">
        <path d="M5 0 L5.6 4.4 L10 5 L5.6 5.6 L5 10 L4.4 5.6 L0 5 L4.4 4.4 Z" fill="currentColor" />
      </svg>
      <svg className="absolute bottom-[30%] -left-2 w-2 h-2 text-ink/20" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="1" fill="currentColor" />
      </svg>
      <span className="absolute top-[12%] left-[5%] text-terracotta/25 text-[9px]">✦</span>
      <span className="absolute bottom-[20%] right-[5%] text-rose/30 text-[8px]">♡</span>
    </div>
  );
}
