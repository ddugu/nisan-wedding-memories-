import Image from "next/image";
import type { MemoryWithThumbnail } from "@/lib/types";

const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-[2.5deg]"] as const;

interface PolaroidFrameProps {
  memory?: MemoryWithThumbnail;
  index?: number;
  empty?: boolean;
  className?: string;
}

export function PolaroidFrame({ memory, index = 0, empty = false, className = "" }: PolaroidFrameProps) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  if (empty || !memory) {
    return (
      <div className={`polaroid ${rotation} ${className}`}>
        <div className="aspect-[4/5] bg-bg-warm/60 flex items-center justify-center">
          <span className="text-ink-muted/25 text-[10px] tracking-[0.3em] uppercase">—</span>
        </div>
      </div>
    );
  }

  const date = new Date(memory.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className={`polaroid polaroid-tape relative ${rotation} ${className}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-warm">
        <Image
          src={memory.thumbnail_url || memory.image_url || ""}
          alt={memory.guest_name ? `${memory.guest_name} anısı` : "Anı"}
          fill
          className="object-cover"
          sizes="(max-width:768px) 45vw, 220px"
          loading="lazy"
        />
      </div>
      {(memory.guest_name || date) && (
        <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-ink-muted tracking-wide">
          {memory.guest_name || "Misafir"} · {date}
        </p>
      )}
    </div>
  );
}
