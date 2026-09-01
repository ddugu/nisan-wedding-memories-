"use client";

import Link from "next/link";
import "./landing.css";

const HOTSPOT_DEBUG = false;

const ART_DESKTOP = "/images/main.png";
/** Mobile artwork hazır olunca: "/images/main-mobile.png" */
const ART_MOBILE = "/images/main.png";

function scrollToPreview() {
  document.getElementById("anilar-preview")?.scrollIntoView({ behavior: "smooth" });
}

export function LandingArtwork() {
  return (
    <section className="landing" aria-label="Necati ve Tuğçe">
      <div className={`landing-artwork${HOTSPOT_DEBUG ? " landing-debug" : ""}`}>
        <picture>
          <source media="(max-width: 768px)" srcSet={ART_MOBILE} />
          <img
            src={ART_DESKTOP}
            alt="Necati ve Tuğçe"
            width={1536}
            height={1024}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <Link href="/ani-birak" className="hotspot hotspot-ani-birak" aria-label="Bir anı bırak" />
        <Link href="/anilar" className="hotspot hotspot-anilara-goz-at" aria-label="Anılara göz at" />
        <Link href="/anilar" className="hotspot hotspot-menu-anilar" aria-label="Anılar" />
        <Link href="/ani-birak" className="hotspot hotspot-menu-ani-birak" aria-label="Bir anı bırak" />
        <Link href="/galeri" className="hotspot hotspot-menu-galeri" aria-label="Galeri" />
        <button
          type="button"
          className="hotspot hotspot-scroll"
          aria-label="Aşağı kaydır"
          onClick={scrollToPreview}
        />
      </div>
    </section>
  );
}
