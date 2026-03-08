"use client";

import { useRef, useCallback } from "react";

interface UseSoundOptions {
  volume?: number;
}

export function useSound(src: string, options: UseSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.volume = options.volume ?? 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {
      // Silently fail if audio is not supported
    }
  }, [src, options.volume]);

  return { play };
}
