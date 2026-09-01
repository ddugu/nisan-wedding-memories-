"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export interface LightboxItem {
  url: string;
  guest_name?: string | null;
  message?: string | null;
  created_at?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(index - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && hasPrev) onNavigate(index - 1);
      if (diff < 0 && hasNext) onNavigate(index + 1);
    }
    touchStartX.current = null;
  };

  if (!item) return null;

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const name = item.guest_name?.trim();

  return (
    <div
      className="gal-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Fotoğraf görüntüleyici"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="gal-lightbox-backdrop" onClick={onClose} aria-hidden="true" />

      <button
        type="button"
        onClick={onClose}
        className="gal-lightbox-close"
        aria-label="Kapat"
      >
        ×
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={() => onNavigate(index - 1)}
          className="gal-lightbox-nav gal-lightbox-prev"
          aria-label="Önceki"
        >
          ‹
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={() => onNavigate(index + 1)}
          className="gal-lightbox-nav gal-lightbox-next"
          aria-label="Sonraki"
        >
          ›
        </button>
      )}

      <div className="gal-lightbox-content">
        <div className="gal-lightbox-frame">
          <Image
            src={item.url}
            alt={name ? `${name} anısı` : "Anı fotoğrafı"}
            fill
            className="gal-lightbox-img"
            sizes="90vw"
            priority
          />
        </div>
        <div className="gal-lightbox-meta">
          {name && <p className="gal-lightbox-name">{name}</p>}
          {item.message?.trim() && (
            <p className="gal-lightbox-message display-serif">&ldquo;{item.message.trim()}&rdquo;</p>
          )}
          {date && <p className="gal-lightbox-date">{date}</p>}
        </div>
      </div>
    </div>
  );
}
