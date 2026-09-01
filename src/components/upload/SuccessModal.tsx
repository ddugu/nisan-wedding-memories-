"use client";

import { useEffect } from "react";
import { Button } from "../ui/Button";

interface SuccessModalProps {
  onClose: () => void;
}

export function SuccessModal({ onClose }: SuccessModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-labelledby="success-title">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-bg max-w-sm w-full text-center animate-heart-pop px-8 py-12">
        <div className="polaroid rotate-1 max-w-[140px] mx-auto mb-8">
          <div className="aspect-square flex items-center justify-center bg-bg-warm/50">
            <span className="text-3xl text-terracotta">♡</span>
          </div>
        </div>
        <h3 id="success-title" className="display-serif text-3xl text-ink">
          Anınız bizimle <span className="text-terracotta">♡</span>
        </h3>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">
          Bu güzel kareyi albümümüze ekledik.
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <Button href="/galeri" fullWidth>Anılara bak →</Button>
          <Button variant="ghost" onClick={onClose} fullWidth>Başka anı bırak</Button>
        </div>
      </div>
    </div>
  );
}
