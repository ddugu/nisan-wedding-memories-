"use client";

import Link from "next/link";
import { useMemories } from "@/hooks/useMemories";
import { Container } from "../ui/Container";
import { PolaroidFrame } from "../gallery/PolaroidFrame";

export function HomePolaroids() {
  const { memories, loading } = useMemories({ limit: 4 });
  const slots = [0, 1, 2, 3];

  return (
    <section className="pb-16 md:pb-20 overflow-hidden">
      <Container>
        <div className="flex flex-wrap justify-center items-end gap-6 md:gap-8 lg:gap-10 px-2">
          {loading
            ? slots.map((i) => (
                <PolaroidFrame key={i} index={i} empty className="w-[42%] sm:w-[38%] md:w-[22%] max-w-[200px]" />
              ))
            : slots.map((i) => (
                <PolaroidFrame
                  key={memories[i]?.id ?? `empty-${i}`}
                  memory={memories[i]}
                  index={i}
                  empty={!memories[i]}
                  className={`w-[42%] sm:w-[38%] md:w-[22%] max-w-[200px] ${i === 1 ? "md:mb-8" : ""} ${i === 2 ? "md:-mt-4" : ""} ${i === 3 ? "md:mb-4" : ""}`}
                />
              ))}
        </div>

        <div className="mt-12 md:mt-14 text-center">
          <Link
            href="/galeri"
            className="inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.12em] uppercase text-terracotta hover:text-terracotta-hover transition-colors duration-300"
          >
            Bütün anılarımıza göz at <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
