"use client";

import Image from "next/image";
import type { GalleryPhotoItem } from "@/lib/memory-normalize";

const ROTATIONS = ["-1.2deg", "0.8deg", "-2deg", "1.4deg", "-0.6deg", "1.8deg", "-1deg", "2deg"];
const DECOR = ["tape", "clip", "none", "tape", "clip", "tape", "none", "clip"] as const;

interface PhotoCardProps {
  photo: GalleryPhotoItem;
  index: number;
  onClick?: () => void;
}

export function PhotoCard({ photo, index, onClick }: PhotoCardProps) {
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const decor = DECOR[index % DECOR.length];
  const name = photo.guest_name?.trim() || "Misafir";

  return (
    <article
      className="gal-card gal-photo-card gal-fade-in"
      style={{ "--gal-rotate": rotate, "--gal-delay": `${index * 0.05}s` } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {decor === "tape" && <span className="gal-tape" aria-hidden="true" />}
      {decor === "clip" && (
        <svg className="gal-clip" viewBox="0 0 20 28" fill="none" aria-hidden="true">
          <path d="M6 3 C6 3 6 20 12 24 C18 28 16 12 16 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      <div className="gal-card-photo">
        <Image
          src={photo.url}
          alt={`${name} fotoğrafı`}
          fill
          className="gal-card-img"
          sizes="(max-width:640px) 90vw, 240px"
          loading="lazy"
        />
      </div>

      <p className="gal-photo-from font-hand">
        {name}&apos;den <span className="gal-card-heart">♡</span>
      </p>
    </article>
  );
}
