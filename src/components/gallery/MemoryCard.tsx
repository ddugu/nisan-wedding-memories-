"use client";

import Image from "next/image";
import type { MemoryWithThumbnail } from "@/lib/types";

const ROTATIONS = ["-1.5deg", "1deg", "-2deg", "0.8deg", "-0.5deg", "1.5deg", "-1deg", "2deg"];
const DECOR = ["tape", "clip", "none", "tape", "clip", "tape", "none", "clip"] as const;

interface MemoryCardProps {
  memory: MemoryWithThumbnail;
  index: number;
  onClick?: (photoIndex: number) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function MemoryCard({ memory, index, onClick }: MemoryCardProps) {
  const rotate = ROTATIONS[index % ROTATIONS.length];
  const decor = DECOR[index % DECOR.length];
  const name = memory.guest_name?.trim() || "Misafir";
  const photos =
    memory.photos.length > 0
      ? memory.photos
      : memory.image_url
        ? [memory.image_url]
        : [];
  const hasPhotos = photos.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasPhotos) onClick?.(0);
  };

  return (
    <article
      className={`gal-card gal-memory gal-fade-in${hasPhotos ? "" : " gal-memory-text"}`}
      style={{ "--gal-rotate": rotate, "--gal-delay": `${index * 0.06}s` } as React.CSSProperties}
      onClick={hasPhotos ? () => onClick?.(0) : undefined}
      role={hasPhotos ? "button" : undefined}
      tabIndex={hasPhotos ? 0 : undefined}
      onKeyDown={hasPhotos ? handleKeyDown : undefined}
    >
      {decor === "tape" && <span className="gal-tape" aria-hidden="true" />}
      {decor === "clip" && (
        <svg className="gal-clip" viewBox="0 0 20 28" fill="none" aria-hidden="true">
          <path d="M6 3 C6 3 6 20 12 24 C18 28 16 12 16 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      {hasPhotos ? (
        <div className="gal-card-photo">
          <Image
            src={photos[0]}
            alt={`${name} anısı`}
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
      ) : (
        <div className="gal-card-no-photo" aria-hidden="true">
          <span className="gal-card-no-photo-heart">♡</span>
        </div>
      )}

      <div className="gal-card-body">
        <p className="gal-card-name display-serif">
          {name} <span className="gal-card-heart">♡</span>
        </p>
        {memory.message?.trim() && (
          <p className="gal-card-message">&ldquo;{memory.message.trim()}&rdquo;</p>
        )}
        <p className="gal-card-date">{formatDate(memory.created_at)}</p>
      </div>
    </article>
  );
}
