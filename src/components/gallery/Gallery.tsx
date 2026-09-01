"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMemories } from "@/hooks/useMemories";
import type { MemoryWithThumbnail } from "@/lib/types";
import { GalleryDecorations } from "./GalleryDecorations";
import { MemoryCard } from "./MemoryCard";
import { CtaCard } from "./CtaCard";
import { Lightbox } from "./Lightbox";
import "./gallery.css";

function getMemoryPhotos(memory: MemoryWithThumbnail): string[] {
  if (memory.photos.length > 0) return memory.photos;
  if (memory.image_url) return [memory.image_url];
  return [];
}

function buildLightboxItems(memories: MemoryWithThumbnail[]) {
  return memories.flatMap((memory) => {
    const urls = getMemoryPhotos(memory);
    return urls.map((url) => ({
      url,
      guest_name: memory.guest_name,
      message: memory.message,
      created_at: memory.created_at,
    }));
  });
}

function getFlatPhotoIndex(memories: MemoryWithThumbnail[], memoryIndex: number, photoIndex: number) {
  let flatIndex = 0;
  for (let i = 0; i < memoryIndex; i++) {
    flatIndex += getMemoryPhotos(memories[i]).length;
  }
  return flatIndex + photoIndex;
}

export function Gallery() {
  const { memories, loading, cursor, hasMore, loadingMore, total, fetchMemories } = useMemories({ limit: 24 });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const count = total > 0 ? total : memories.length;
  const lightboxItems = useMemo(() => buildLightboxItems(memories), [memories]);

  const openLightbox = (memoryIndex: number, photoIndex: number) => {
    setLightboxIndex(getFlatPhotoIndex(memories, memoryIndex, photoIndex));
  };

  return (
    <div className="gal-page">
      <GalleryDecorations />

      <div className="gal-content">
        <div className="gal-hero-wrap gal-fade-up">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kina-anilar.png"
            alt=""
            className="gal-hero-kina"
            aria-hidden="true"
          />
          <header className="gal-hero">
            <p className="gal-hero-hand font-hand">birlikte biriktirdiğimiz</p>
            <h1 className="gal-hero-title display-serif">
              Anılarımız <span className="gal-heart">♡</span>
            </h1>
            <p className="gal-hero-sub">
              Bu güzel gün, sizin gözünüzden.
              <br />
              Her kare, bu özel gecenin bir parçası.
            </p>
          </header>
        </div>

        <div className="gal-counter-wrap gal-fade-up gal-fade-up-d1">
          <svg className="gal-counter-leaf gal-counter-leaf-l" viewBox="0 0 24 16" fill="none" aria-hidden="true">
            <path d="M2 12 Q8 4 14 8 Q18 10 22 6" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          <div className="gal-counter">
            <span className="gal-counter-heart">♡</span>
            <span>
              Şimdiye kadar <strong className="gal-counter-num">{count}</strong> anı bırakıldı
            </span>
          </div>
          <svg className="gal-counter-leaf gal-counter-leaf-r" viewBox="0 0 24 16" fill="none" aria-hidden="true">
            <path d="M22 12 Q16 4 10 8 Q6 10 2 6" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
        </div>

        <div className="gal-composition">
          <div className="gal-note gal-note-tr font-hand" aria-hidden="true">
            <span className="gal-note-tape" />
            Birlikte
            <br />
            daha da güzel...
            <br />
            <span className="gal-note-heart">♡</span>
          </div>

          <div className="gal-note gal-note-bl font-hand" aria-hidden="true">
            bu günü
            <br />
            hep birlikte
            <br />
            hatırlayalım <span className="gal-note-heart">♡</span>
          </div>

          {loading ? (
            <div className="gal-loading">
              <p className="gal-loading-text font-hand">Anılar hazırlanıyor... ♡</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="gal-empty-state">
              <p className="gal-empty-title display-serif">Henüz bir anı yok</p>
              <p className="gal-empty-sub font-hand">İlk anıyı sen bırak ♡</p>
              <Link href="/ani" className="gal-empty-btn">
                Bir Anı Bırak →
              </Link>
            </div>
          ) : (
            <>
              <div className="gal-grid">
                {memories.map((memory, i) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    index={i}
                    onClick={(photoIndex) => openLightbox(i, photoIndex)}
                  />
                ))}
                <CtaCard index={memories.length} />
              </div>

              {hasMore && (
                <div className="gal-load-more">
                  <button
                    type="button"
                    className="gal-load-btn"
                    onClick={() => fetchMemories(cursor)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Yükleniyor..." : "Daha fazla göster"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {lightboxIndex !== null && lightboxItems.length > 0 && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
