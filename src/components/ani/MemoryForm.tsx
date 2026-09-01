"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { compressImage, createImagePreview, revokeImagePreview } from "@/lib/image";
import { ALLOWED_MIME_TYPES } from "@/lib/validation";
import "./memory-form.css";

const MAX_PHOTOS = 5;
const ACCEPT = "image/jpeg,image/png,image/webp";
const POLAROID_ROTATIONS = ["-3deg", "2deg", "-1.5deg", "2.5deg", "-2deg"];

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

type FormState = "idle" | "uploading" | "success" | "error";

function isImageFile(file: File) {
  return (
    (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

export function MemoryForm() {
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    setError(null);
    const list = Array.from(incoming).filter(isImageFile);
    if (list.length === 0) {
      setError("Bu fotoğraf desteklenmeyen bir dosya formatında.");
      return;
    }

    const slots = MAX_PHOTOS - photos.length;
    if (slots <= 0) {
      setError(`En fazla ${MAX_PHOTOS} fotoğraf ekleyebilirsiniz.`);
      return;
    }

    const toAdd = list.slice(0, slots);
    const newItems: PhotoItem[] = [];

    for (const raw of toAdd) {
      try {
        const file = await compressImage(raw);
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: createImagePreview(file),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Dosya işlenemedi.");
      }
    }

    if (newItems.length) setPhotos((prev) => [...prev, ...newItems]);
  }, [photos.length]);

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) revokeImagePreview(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearAllPhotos = () => {
    photos.forEach((p) => revokeImagePreview(p.preview));
    setPhotos([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFilePicker = () => {
    if (photos.length < MAX_PHOTOS && state !== "uploading") {
      fileInputRef.current?.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const validate = (): string | null => {
    if (!guestName.trim()) return "Lütfen adınızı yazın.";
    if (!message.trim()) return "Lütfen anınızı yazın.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "uploading") return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setState("uploading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("guestName", guestName.trim());
      formData.append("message", message.trim());
      photos.forEach((p) => formData.append("photos", p.file));

      const response = await fetch("/api/memories", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        const message =
          response.status >= 500
            ? "Anınızı şu anda kaydedemedik. Lütfen tekrar deneyin. ♡"
            : data.error || "Anınızı şu anda kaydedemedik. Lütfen tekrar deneyin. ♡";
        throw new Error(message);
      }

      setState("success");
      clearAllPhotos();
      setGuestName("");
      setMessage("");
    } catch (err) {
      setState("error");
      setError(
        err instanceof TypeError && err.message.includes("fetch")
          ? "Anınızı şu anda kaydedemedik. Lütfen tekrar deneyin. ♡"
          : err instanceof Error ? err.message : "Anınızı şu anda kaydedemedik. Lütfen tekrar deneyin. ♡"
      );
    }
  };

  const resetSuccess = () => {
    setState("idle");
    setError(null);
  };

  const canAddPhoto = photos.length < MAX_PHOTOS && state !== "uploading";

  return (
    <div className="ani-page">
      <div className="ani-scrapbook">
        {/* Sol — scrapbook dekor */}
        <aside className="ani-side ani-side-left" aria-hidden="true">
          <div className="ani-side-polaroid ani-side-polaroid-1">
            <div className="ani-side-polaroid-inner" />
          </div>
          <p className="ani-side-note font-hand">bu günü bizimle hatırlayın</p>
          <svg className="ani-side-branch" viewBox="0 0 48 80" fill="none">
            <path d="M24 76 Q20 52 24 32 Q28 12 24 4" stroke="currentColor" strokeWidth="0.8" />
            <ellipse cx="30" cy="28" rx="5" ry="3" stroke="currentColor" strokeWidth="0.6" transform="rotate(-15 30 28)" />
          </svg>
        </aside>

        <div className="ani-center">
          <header className="ani-header ani-fade-up">
            <p className="ani-header-hand font-hand">bugünden bize bir parça bırakın</p>
            <h1 className="ani-header-title display-serif">
              Bir Anı Bırak <span className="ani-heart">♡</span>
            </h1>
            <p className="ani-header-sub">Bugünümüzden küçük bir anıyı bizimle paylaşın.</p>
          </header>

          {state === "success" ? (
            <div className="ani-paper-stack ani-fade-up ani-fade-up-delay" role="status">
              <div className="ani-paper-shadow ani-paper-shadow-2" aria-hidden="true" />
              <div className="ani-paper-shadow ani-paper-shadow-1" aria-hidden="true" />
              <div className="ani-paper ani-paper-success">
                <p className="display-serif ani-success-title">
                  Anınız bizimle artık. <span className="ani-heart">♡</span>
                </p>
                <p className="ani-success-sub">Bu güzel günden bir parçayı bizimle paylaştığınız için teşekkür ederiz.</p>
                <div className="ani-success-actions">
                  <Link href="/anilar" className="ani-btn">Anılara göz at →</Link>
                  <button type="button" onClick={resetSuccess} className="ani-btn-ghost">
                    Başka anı bırak
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ani-paper-stack ani-fade-up ani-fade-up-delay">
              <div className="ani-paper-shadow ani-paper-shadow-2" aria-hidden="true" />
              <div className="ani-paper-shadow ani-paper-shadow-1" aria-hidden="true" />

              <div className="ani-paper">
                <span className="ani-tape" aria-hidden="true" />
                <p className="ani-paper-whisper font-hand" aria-hidden="true">bir küçük anı...</p>

                <form onSubmit={handleSubmit} className="ani-form" noValidate>
                  <div className="ani-form-body">
                    <div className="ani-form-fields">
                      <div className="ani-field">
                        <label htmlFor="guestName" className="ani-label">Adınız</label>
                        <input
                          id="guestName"
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          maxLength={100}
                          placeholder="Adınızı buraya bırakın..."
                          className="ani-input"
                          autoComplete="name"
                          disabled={state === "uploading"}
                        />
                      </div>

                      <div className="ani-field">
                        <label htmlFor="message" className="ani-label">Anınız</label>
                        <textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          maxLength={500}
                          rows={5}
                          placeholder="Bugün bizimle paylaşmak istediğiniz anıyı yazın..."
                          className="ani-textarea"
                          disabled={state === "uploading"}
                        />
                      </div>

                      <p className="ani-field-whisper font-hand" aria-hidden="true">sevgilerimizle ♡</p>
                    </div>

                    <div
                      className={`ani-photo-col${dragOver ? " ani-photo-col-drag" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); if (canAddPhoto) setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPT}
                        multiple
                        onChange={onFileChange}
                        className="sr-only"
                        disabled={!canAddPhoto}
                      />

                      <div className="ani-polaroid-stage ani-fade-polaroid">
                        <div className="ani-polaroid-back" aria-hidden="true" />
                        {photos.length === 0 ? (
                          <button
                            type="button"
                            className="ani-polaroid ani-polaroid-main ani-polaroid-placeholder"
                            onClick={openFilePicker}
                            disabled={!canAddPhoto}
                            aria-label="Fotoğraf ekle"
                          >
                            <span className="ani-polaroid-washi" aria-hidden="true" />
                            <div className="ani-polaroid-upload-area">
                              <span className="ani-polaroid-upload-text font-hand">foto yükle</span>
                            </div>
                          </button>
                        ) : (
                          <div className="ani-polaroid ani-polaroid-main">
                            <span className="ani-polaroid-washi" aria-hidden="true" />
                            <div className="ani-polaroid-img">
                              <Image
                                src={photos[0].preview}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                                sizes="210px"
                              />
                            </div>
                            <button
                              type="button"
                              className="ani-polaroid-remove"
                              onClick={() => removePhoto(photos[0].id)}
                              aria-label="Fotoğrafı kaldır"
                              disabled={state === "uploading"}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      {photos.length > 0 && (
                        <ul className="ani-polaroid-row" aria-label="Seçilen fotoğraflar">
                          {photos.map((p, i) => (
                            <li
                              key={p.id}
                              className="ani-polaroid ani-polaroid-small"
                              style={{ "--r": POLAROID_ROTATIONS[i % POLAROID_ROTATIONS.length] } as React.CSSProperties}
                            >
                              <div className="ani-polaroid-img">
                                <Image src={p.preview} alt="" fill className="object-cover" unoptimized sizes="72px" />
                              </div>
                              <button
                                type="button"
                                className="ani-polaroid-remove"
                                onClick={() => removePhoto(p.id)}
                                aria-label="Fotoğrafı kaldır"
                                disabled={state === "uploading"}
                              >
                                ×
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {canAddPhoto && photos.length > 0 && photos.length < MAX_PHOTOS && (
                        <button
                          type="button"
                          className="ani-add-photo font-hand"
                          onClick={openFilePicker}
                        >
                          + bir fotoğraf daha
                        </button>
                      )}

                      {photos.length > 0 && (
                        <p className="ani-photo-meta">JPG · PNG · WebP · en fazla {MAX_PHOTOS}</p>
                      )}
                    </div>
                  </div>

                  {state === "uploading" && (
                    <div className="ani-progress" role="progressbar" aria-label="Yükleniyor">
                      <div className="ani-progress-bar" />
                    </div>
                  )}

                  {error && <p className="ani-error" role="alert">{error}</p>}

                  <div className="ani-form-foot">
                    <button type="submit" className="ani-btn" disabled={state === "uploading"}>
                      {state === "uploading" ? (
                        <span className="ani-btn-loading">
                          <span className="ani-spinner" aria-hidden="true" />
                          ANINIZ BIRAKILIYOR...
                        </span>
                      ) : (
                        "Anıyı Bırak →"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <Link href="/" className="ani-back">← Anasayfaya dön</Link>
        </div>

        {/* Sağ — scrapbook dekor */}
        <aside className="ani-side ani-side-right" aria-hidden="true">
          <span className="ani-side-tape" />
          <svg className="ani-side-branch ani-side-branch-lg" viewBox="0 0 64 100" fill="none">
            <path d="M32 96 Q26 68 32 40 Q38 14 32 4" stroke="currentColor" strokeWidth="0.9" />
            <ellipse cx="42" cy="36" rx="7" ry="4" stroke="currentColor" strokeWidth="0.65" transform="rotate(-18 42 36)" />
            <ellipse cx="22" cy="58" rx="6" ry="3.5" stroke="currentColor" strokeWidth="0.6" transform="rotate(12 22 58)" />
          </svg>
          <p className="ani-side-note ani-side-note-right font-hand">N &amp; T</p>
        </aside>
      </div>
    </div>
  );
}
