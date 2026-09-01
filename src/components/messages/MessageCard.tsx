"use client";

import type { MemoryWithThumbnail } from "@/lib/types";
import { Quote } from "./Quote";

const OFFSETS = ["md:-translate-y-4", "", "md:translate-y-6"];

interface MessageCardProps {
  memory: MemoryWithThumbnail;
  index: number;
}

export function MessageCard({ memory, index }: MessageCardProps) {
  return (
    <div className={`paper-card rounded-xl p-6 md:p-8 transition-transform duration-500 ${OFFSETS[index % OFFSETS.length]}`}>
      <Quote text={memory.message!} author={memory.guest_name || "Misafir"} />
    </div>
  );
}
