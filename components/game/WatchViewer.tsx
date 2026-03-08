"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";

interface WatchViewerProps {
  src: string;
  alt: string;
  roundNumber: number;
  totalRounds: number;
}

export default function WatchViewer({ src, alt }: WatchViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="relative w-full aspect-[3/2] max-h-[46vh]">
        <div
          ref={containerRef}
          className="relative w-full h-full rounded-lg overflow-hidden watch-glow select-none"
          style={{ background: "#F5F3EE" }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain p-2"
            priority
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-watch.jpg";
            }}
          />

          {/* Subtle vignette */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, transparent 60%, rgba(26,23,20,0.06) 100%)"
            }}
          />


        </div>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(26,23,20,0.92)" }}
            onClick={() => setIsFullscreen(false)}
          >
            <button
              className="absolute top-5 right-5 p-2 rounded transition-all"
              style={{ background: "#FFFFFF", border: "1px solid #E0D9CC", color: "#1A1714" }}
              onClick={() => setIsFullscreen(false)}
            >
              <X size={18} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-xl aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={src} alt={alt} fill className="object-contain" priority />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
