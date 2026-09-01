"use client";

import { useEffect, useState, useCallback } from "react";
import type { MemoryWithThumbnail } from "@/lib/types";

interface UseMemoriesOptions {
  limit?: number;
  autoFetch?: boolean;
}

export function useMemories({ limit = 12, autoFetch = true }: UseMemoriesOptions = {}) {
  const [memories, setMemories] = useState<MemoryWithThumbnail[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMemories = useCallback(async (nextCursor?: string | null) => {
    const isInitial = !nextCursor;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();

      if (isInitial) {
        setMemories(data.memories ?? []);
      } else {
        setMemories((prev) => [...prev, ...(data.memories ?? [])]);
      }
      setCursor(data.nextCursor);
      setHasMore(data.hasMore ?? false);
      if (typeof data.total === "number") setTotal(data.total);
    } catch {
      if (isInitial) setMemories([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!autoFetch) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(limit));
        const res = await fetch(`/api/memories?${params}`);
        const data = await res.json();
        if (!cancelled) {
          setMemories(data.memories ?? []);
          setCursor(data.nextCursor);
          setHasMore(data.hasMore ?? false);
          if (typeof data.total === "number") setTotal(data.total);
        }
      } catch {
        if (!cancelled) setMemories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limit, autoFetch]);

  const removeMemory = useCallback((memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    setTotal((prev) => Math.max(0, prev - 1));
  }, []);

  return { memories, loading, cursor, hasMore, loadingMore, total, fetchMemories, removeMemory };
}
