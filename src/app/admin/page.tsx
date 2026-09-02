"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { getMemoryPhotoUrls } from "@/lib/memory-normalize";
import { downloadMemoryPhotos } from "@/lib/download-photos";
import type { Memory } from "@/lib/types";

interface AdminStats {
  totalMemories: number;
  totalUsedBytes: number;
  maxTotalBytes: number;
  remainingBytes: number;
  totalUsedFormatted: string;
  maxTotalFormatted: string;
  remainingFormatted: string;
}

export default function AdminDashboard() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/memories");
        if (cancelled) return;

        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setMemories(data.memories ?? []);
        setStats(data.stats ?? null);
      } catch {
        console.error("Failed to fetch admin data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [router]);

  const refreshData = async () => {
    const res = await fetch("/api/admin/memories");
    if (res.ok) {
      const data = await res.json();
      setMemories(data.memories ?? []);
      setStats(data.stats ?? null);
    }
  };

  const handleDownload = async (memory: Memory) => {
    const photos = getMemoryPhotoUrls(memory);
    if (photos.length === 0) {
      alert("Bu anıda indirilecek fotoğraf yok.");
      return;
    }

    setDownloading(memory.id);
    try {
      await downloadMemoryPhotos(photos, memory.guest_name);
    } catch {
      alert("İndirme başarısız oldu. Tekrar deneyin.");
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu anıyı silmek istediğinize emin misiniz? Fotoğraflar kalıcı olarak silinir.")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/memories/${id}`, { method: "DELETE" });
      if (res.ok) {
        await refreshData();
      } else {
        alert("Silme işlemi başarısız oldu.");
      }
    } catch {
      alert("Silme işlemi başarısız oldu.");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta/20 border-t-terracotta rounded-full animate-spin" />
      </main>
    );
  }

  const storagePercent = stats
    ? Math.round((stats.totalUsedBytes / stats.maxTotalBytes) * 100)
    : 0;

  return (
    <main className="min-h-screen px-5 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-terracotta">Admin Panel</h1>
          <p className="font-body text-sm text-warm-brown/60 mt-1">
            Necati & Tuğçe Anı Albümü
          </p>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Çıkış
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="paper-card p-5 text-center">
            <p className="font-display text-4xl text-terracotta">{stats.totalMemories}</p>
            <p className="font-body text-sm text-warm-brown/60 mt-1">Toplam Anı</p>
          </div>
          <div className="paper-card p-5 text-center">
            <p className="font-display text-4xl text-terracotta">{stats.totalUsedFormatted}</p>
            <p className="font-body text-sm text-warm-brown/60 mt-1">Storage Kullanımı</p>
          </div>
          <div className="paper-card p-5 text-center">
            <p className="font-display text-4xl text-terracotta">{stats.remainingFormatted}</p>
            <p className="font-body text-sm text-warm-brown/60 mt-1">Kalan Alan</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="paper-card p-4 mb-8">
          <div className="flex justify-between text-sm text-warm-brown/60 mb-2">
            <span>Depolama</span>
            <span>{storagePercent}% kullanıldı</span>
          </div>
          <div className="h-3 bg-off-white rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-500"
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      <h2 className="font-display text-2xl text-terracotta mb-4">Tüm Anılar</h2>

      {memories.length === 0 ? (
        <p className="font-body text-warm-brown/60 text-center py-12">
          Henüz anı yok.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((memory) => {
            const photos = getMemoryPhotoUrls(memory);
            const cover = photos[0] ?? "";

            return (
              <div key={memory.id} className="paper-card overflow-hidden">
                <div className="relative aspect-square bg-off-white">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={memory.guest_name ?? "Anı"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-terracotta/30 text-3xl">
                      ♡
                    </div>
                  )}
                  {photos.length > 1 && (
                    <span className="absolute top-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
                      {photos.length} foto
                    </span>
                  )}
                </div>
                <div className="p-3">
                  {memory.guest_name && (
                    <p className="font-display text-lg text-terracotta truncate">
                      {memory.guest_name}
                    </p>
                  )}
                  {memory.message && (
                    <p className="font-body text-xs text-warm-brown/60 line-clamp-2 mt-0.5">
                      {memory.message}
                    </p>
                  )}
                  <p className="font-body text-[10px] text-warm-brown/40 mt-1">
                    {new Date(memory.created_at).toLocaleString("tr-TR")}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(memory)}
                      disabled={photos.length === 0 || downloading === memory.id}
                      className="text-xs text-warm-brown py-1.5 border border-terracotta/20 rounded-lg hover:bg-soft-pink/20 transition-colors disabled:opacity-50"
                    >
                      {downloading === memory.id ? "İndiriliyor..." : "İndir"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(memory.id)}
                      disabled={deleting === memory.id}
                      className="text-xs text-terracotta/70 hover:text-terracotta py-1.5 border border-terracotta/20 rounded-lg hover:bg-soft-pink/20 transition-colors disabled:opacity-50"
                    >
                      {deleting === memory.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
