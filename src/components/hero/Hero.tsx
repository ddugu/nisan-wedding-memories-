import Link from "next/link";
import { FramedIllustration } from "../decorative/FramedIllustration";
import { HeroNav } from "./HeroNav";

export function Hero() {
  return (
    <section className="hero-cover torn-edge">
      <HeroNav />

      <div className="hero-poster">
        {/* Dominant illustration — poster anchor */}
        <div className="hero-art-slot animate-hero-art">
          <FramedIllustration />
        </div>

        {/* Editorial copy — relates to illustration */}
        <div className="hero-copy-slot">
          <div className="hero-intro animate-hero-text hero-seq-2">
            <p className="hero-date">2 Eylül 2026</p>
            <p className="hero-welcome font-hand">bugünümüze hoş geldiniz</p>
          </div>

          <h1 className="hero-title animate-hero-text hero-seq-3">
            <span className="hero-title-line">Necati</span>
            <span className="hero-title-amp">&</span>
            <span className="hero-title-line hero-title-indent">Tuğçe</span>
          </h1>

          <p className="hero-message animate-hero-text hero-seq-4">
            Bugünümüzün güzel anlarına ortak olduğunuz için teşekkür ederiz.{" "}
            <span className="text-terracotta/60">♡</span>
          </p>

          <div className="hero-actions animate-hero-text hero-seq-5">
            <Link href="/ani" className="hero-btn-primary">
              Bir Anı Bırak <span aria-hidden="true">♡</span>
            </Link>
            <Link href="/galeri" className="hero-btn-secondary">
              Anılara göz at <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="hero-foot">
        <a href="#album" className="hero-scroll" aria-label="Albüme kaydır">
          <span>Aşağı Kaydır</span>
          <span className="hero-scroll-line" aria-hidden="true" />
          <span aria-hidden="true">♡</span>
        </a>
      </div>
    </section>
  );
}
