import Image from "next/image";

interface FramedIllustrationProps {
  className?: string;
  priority?: boolean;
}

export function FramedIllustration({ className = "", priority = true }: FramedIllustrationProps) {
  return (
    <div className={`hero-art-frame ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="hero-torn-top" clipPathUnits="objectBoundingBox">
            <path d="M0,0.08 L0.04,0.02 L0.08,0.07 L0.12,0 L0.16,0.06 L0.2,0.01 L0.24,0.08 L0.28,0.02 L0.32,0.07 L0.36,0 L0.4,0.05 L0.44,0.01 L0.48,0.08 L0.52,0.03 L0.56,0.07 L0.6,0 L0.64,0.06 L0.68,0.02 L0.72,0.08 L0.76,0 L0.8,0.05 L0.84,0.01 L0.88,0.07 L0.92,0.02 L0.96,0.06 L1,0.04 L1,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Terracotta backing */}
      <div
        className="hero-art-backing"
        style={{ clipPath: "url(#hero-torn-top)" }}
        aria-hidden="true"
      />

      {/* Lined paper peek */}
      <div className="hero-art-lined" aria-hidden="true" />

      {/* Polaroid + illustration */}
      <div className="hero-art-polaroid">
        <svg className="hero-art-clip" viewBox="0 0 32 44" fill="none" aria-hidden="true">
          <path d="M9 3 C9 3 9 30 16 34 C23 38 25 18 25 10" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 3 C9 3 5 8 5 17 C5 26 9 30 16 30" stroke="#a8a8a8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div className="hero-art-image-wrap">
          <Image
            src="/images/couple-illustration.png"
            alt="Necati ve Tuğçe"
            width={640}
            height={640}
            className="w-full h-auto block"
            priority={priority}
            sizes="(max-width: 768px) 88vw, (max-width: 1440px) 42vw, 600px"
          />
        </div>
      </div>
    </div>
  );
}
