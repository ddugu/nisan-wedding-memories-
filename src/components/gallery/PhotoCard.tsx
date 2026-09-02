"use client";

import Image from "next/image";
import type { MemoryWithThumbnail } from "@/lib/types";

const ROTATIONS = ["-1.2deg", "0.8deg", "-2deg", "1.4deg", "-0.6deg", "1.8deg", "-1deg", "2deg"];
const DECOR = ["tape", "clip", "none", "tape", "clip", "tape", "none", "clip"] as const;

interface PhotoCardProps {
  memory: MemoryWithThumbnail;
  index: number;
  onClick?: () => void;
}

export function PhotoCard({ memory, index, onClick }: PhotoCardProps) {
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const decor = DECOR[index % DECOR.length];
  const name = memory.guest_name?.trim() || "Misafir";
  const photos =
    memory.photos.length > 0
      ? memory.photos
      : memory.image_url
        ? [memory.image_url]
        : [];

  if (photos.length === 0) return null;

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
          src={photos[0]}
          alt={`${name} fotoğrafı`}
          fill
          className="gal-card-img"
          sizes="(max-width:640px) 90vw, 240px"
          loading="lazy"
        />
        {photos.length > 1 && (
          <span className="gal-card-photo-badge" aria-label={`${photos.length} fotoğraf`}>
            +{photos.length - 1}
          </span>
        )}
      </div>

      <p className="gal-photo-from font-hand">
        {name}&apos;den <span className="gal-card-heart">♡</span>
      </p>
    </article>
  );
}
