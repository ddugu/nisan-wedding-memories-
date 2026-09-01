import { LandingArtwork } from "@/components/landing/LandingArtwork";

export default function HomePage() {
  return (
    <main>
      <LandingArtwork />
      <div id="anilar-preview" tabIndex={-1} aria-hidden="true" />
    </main>
  );
}
