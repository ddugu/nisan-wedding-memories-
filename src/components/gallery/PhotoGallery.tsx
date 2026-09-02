"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMemories } from "@/hooks/useMemories";
import { flattenMemoriesToGalleryPhotos } from "@/lib/memory-normalize";
import { GalleryDecorations } from "./GalleryDecorations";
import { PhotoCard } from "./PhotoCard";
import { Lightbox } from "./Lightbox";
import "./gallery.css";

export function PhotoGallery() {
  const { memories, loading, cursor, hasMore, loadingMore, fetchMemories } = useMemories({ limit: 50 });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = useMemo(() => flattenMemoriesToGalleryPhotos(memories), [memories]);
  const visibleMemories = useMemo(
    () => memories.filter((memory) => memory.photos.length > 0 || memory.image_url),
    [memories]
  );
  const photoCount = photos.length;

  const lightboxItems = useMemo(
    () =>
      photos.map((p) => ({
        url: p.url,
        guest_name: p.guest_name,
        message: null as string | null,
        created_at: p.created_at,
      })),
    [photos]
  );

  const openMemoryLightbox = (memoryIndex: number) => {
    const memory = visibleMemories[memoryIndex];
    if (!memory) return;
    const flatIndex = photos.findIndex((p) => p.memory_id === memory.id);
    if (flatIndex >= 0) setLightboxIndex(flatIndex);
  };

  return (
    <div className="gal-page">
      <GalleryDecorations />

      <div className="gal-content">
        <div className="gal-hero-wrap gal-fade-up">
          <header className="gal-hero">
            <p className="gal-hero-hand font-hand">paylaşılan kareler</p>
            <h1 className="gal-hero-title display-serif">
              Galeri <span className="gal-heart">♡</span>
            </h1>
            <p className="gal-hero-sub">
              Bu güzel geceden kalan fotoğraflar.
              <br />
              Her kare, bir anının parçası.
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
              Toplam <strong className="gal-counter-num">{photoCount}</strong> fotoğraf
            </span>
          </div>
          <svg className="gal-counter-leaf gal-counter-leaf-r" viewBox="0 0 24 16" fill="none" aria-hidden="true">
            <path d="M22 12 Q16 4 10 8 Q6 10 2 6" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
        </div>

        <div className="gal-composition">
          {loading ? (
            <div className="gal-loading">
              <p className="gal-loading-text font-hand">Anılar hazırlanıyor... ♡</p>
            </div>
          ) : visibleMemories.length === 0 ? (
            <div className="gal-empty-state">
              <p className="gal-empty-title display-serif">Henüz bir fotoğraf yok</p>
              <p className="gal-empty-sub font-hand">İlk anıyı sen bırak ♡</p>
              <Link href="/ani" className="gal-empty-btn">
                Bir Anı Bırak →
              </Link>
            </div>
          ) : (
            <>
              <div className="gal-grid">
                {visibleMemories.map((memory, i) => (
                  <PhotoCard
                    key={memory.id}
                    memory={memory}
                    index={i}
                    onClick={() => openMemoryLightbox(i)}
                  />
                ))}
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

      {lightboxIndex !== null && (
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
