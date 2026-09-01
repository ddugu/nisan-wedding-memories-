"use client";

import Link from "next/link";
import "./landing.css";

const HOTSPOT_DEBUG = false;

const ART_DESKTOP = "/images/main.png";
const ART_MOBILE = "/images/main-mobile.jpg";

function scrollToPreview() {
  document.getElementById("anilar-preview")?.scrollIntoView({ behavior: "smooth" });
}

export function LandingArtwork() {
  return (
    <section className="landing" aria-label="Necati ve Tuğçe">
      {/* Desktop — unchanged artwork + hotspot coordinates */}
      <div className={`landing-artwork landing-artwork--desktop${HOTSPOT_DEBUG ? " landing-debug" : ""}`}>
        <img
          src={ART_DESKTOP}
          alt="Necati ve Tuğçe"
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
        />

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

      {/* Mobile — dedicated portrait artwork + mobile hotspot coordinates */}
      <div className={`landing-artwork landing-artwork--mobile${HOTSPOT_DEBUG ? " landing-debug" : ""}`}>
        <img
          src={ART_MOBILE}
          alt="Necati ve Tuğçe"
          width={852}
          height={1847}
          fetchPriority="high"
          decoding="async"
        />

        <Link href="/anilar" className="hotspot hotspot-m-menu-anilar" aria-label="Anılar" />
        <Link href="/ani-birak" className="hotspot hotspot-m-menu-ani-birak" aria-label="Bir anı bırak" />
        <Link href="/galeri" className="hotspot hotspot-m-menu-galeri" aria-label="Galeri" />
        <Link href="/anilar" className="hotspot hotspot-m-menu-heart" aria-label="Anılar" />
        <Link href="/ani-birak" className="hotspot hotspot-m-ani-birak" aria-label="Bir anı bırak" />
        <Link href="/anilar" className="hotspot hotspot-m-anilara-goz-at" aria-label="Anılara göz at" />
        <button
          type="button"
          className="hotspot hotspot-m-scroll"
          aria-label="Aşağı kaydır"
          onClick={scrollToPreview}
        />
      </div>
    </section>
  );
}
