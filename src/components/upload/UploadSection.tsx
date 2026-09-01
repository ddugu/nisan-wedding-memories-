"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { SuccessModal } from "./SuccessModal";
import { compressImage, createImagePreview, revokeImagePreview } from "@/lib/image";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError(null);
    try {
      const compressed = await compressImage(selectedFile);
      if (preview) revokeImagePreview(preview);
      setFile(compressed);
      setPreview(createImagePreview(compressed));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya işlenemedi.");
    }
  }, [preview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type.startsWith("image/")) handleFileSelect(dropped);
  };

  const clearFile = () => {
    if (preview) revokeImagePreview(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Lütfen bir fotoğraf seçin."); return; }

    setState("uploading");
    setError(null);
    const formData = new FormData();
    formData.append("photo", file);
    if (guestName.trim()) formData.append("guestName", guestName.trim());
    if (message.trim()) formData.append("message", message.trim());

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Yükleme başarısız oldu.");
      setState("success");
      clearFile();
      setGuestName("");
      setMessage("");
    } catch (err) {
      setState("error");
      setError(err instanceof TypeError && err.message.includes("fetch")
        ? "İnternet bağlantınızı kontrol edin."
        : err instanceof Error ? err.message : "Bir hata oluştu.");
    }
  };

  const resetForm = () => { setState("idle"); setError(null); };

  return (
    <>
      <section className="py-8 md:py-12 pb-16 min-h-[calc(100svh-80px)]">
        <Container className="max-w-lg">
          <header className="mb-10 md:mb-12">
            <h1 className="display-serif text-[clamp(2rem,6vw,2.75rem)] text-ink leading-[1.1]">
              Bugünümüzden
              <span className="block">size kalan bir anı bırakın.</span>
            </h1>
            <p className="mt-5 text-[0.9375rem] text-ink-muted leading-relaxed">
              Bir fotoğraf, birkaç kelime...
              <br />
              Bu güzel günü bizimle hatırlayın.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="guestName" className="eyebrow text-[0.6rem] text-ink-muted mb-3 block">İsminiz</label>
              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={100}
                placeholder="Adınız"
                className="guestbook-input"
              />
            </div>

            <div>
              <label htmlFor="message" className="eyebrow text-[0.6rem] text-ink-muted mb-3 block">Mesajınız</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Kısa bir not bırakın..."
                className="guestbook-input resize-none"
              />
            </div>

            <div>
              <label className="eyebrow text-[0.6rem] text-ink-muted mb-3 block">Fotoğrafınız</label>
              <div
                className={`upload-zone rounded-lg p-6 text-center ${dragOver ? "drag-over" : ""} ${!preview ? "cursor-pointer" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !preview && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && !preview && fileInputRef.current?.click()}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={onFileChange} className="hidden" aria-label="Galeriden fotoğraf seç" />
                <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" capture="environment" onChange={onFileChange} className="hidden" aria-label="Kamera ile fotoğraf çek" />

                {preview ? (
                  <div className="max-w-[200px] mx-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="polaroid rotate-1">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image src={preview} alt="Önizleme" fill className="object-cover" unoptimized />
                      </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-terracotta">Değiştir</button>
                      <button type="button" onClick={clearFile} className="text-xs text-ink-muted">Kaldır</button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-terracotta transition-colors"
                    >
                      <span className="text-lg">+</span> Fotoğraf ekle
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                      className="block w-full mt-3 text-xs text-ink-muted hover:text-terracotta md:hidden"
                    >
                      veya kamerayla çek
                    </button>
                  </div>
                )}
              </div>
            </div>

            {state === "uploading" && (
              <div className="upload-progress rounded-full" role="progressbar" aria-label="Yükleniyor">
                <div className="upload-progress-bar" />
              </div>
            )}

            {error && (
              <p className="text-sm text-terracotta text-center" role="alert">{error}</p>
            )}

            <Button type="submit" fullWidth disabled={state === "uploading" || !file} className="min-h-[52px] rounded-md">
              {state === "uploading" ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                  Yükleniyor...
                </span>
              ) : (
                "Anımı Bırak ♡"
              )}
            </Button>
          </form>
        </Container>
      </section>

      {state === "success" && <SuccessModal onClose={resetForm} />}
    </>
  );
}
