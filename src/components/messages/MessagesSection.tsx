"use client";

import { useEffect, useState } from "react";
import type { MemoryWithThumbnail } from "@/lib/types";
import { Container } from "../ui/Container";
import { MessageCard } from "./MessageCard";

export function MessagesSection() {
  const [quotes, setQuotes] = useState<MemoryWithThumbnail[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/memories?limit=20");
        const data = await res.json();
        const withMessages = (data.memories ?? []).filter(
          (m: MemoryWithThumbnail) => m.message?.trim()
        );
        if (!cancelled) setQuotes(withMessages.slice(0, 3));
      } catch {
        if (!cancelled) setQuotes([]);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (quotes.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-t border-line">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 md:mb-16 items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-3">misafir notları</p>
            <h2 className="display-serif text-[clamp(1.75rem,4vw,2.75rem)] text-ink leading-tight">
              Misafirlerden küçük notlar.
            </h2>
          </div>
          <p className="md:col-span-5 text-sm text-ink-muted md:text-right">
            Sesleri ve dilekleri de bu albümde kalsın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {quotes.map((q, i) => (
            <MessageCard key={q.id} memory={q} index={i} />
          ))}
        </div>
      </Container>
    </section>
  );
}
