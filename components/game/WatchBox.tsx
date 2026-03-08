"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Lock, Diamond, Star, Award } from "lucide-react";
import Image from "next/image";
import { CollectedWatch } from "@/lib/subscription";
import { getWatchImagePath } from "@/lib/assets";
import { getRarity, WatchRarity } from "@/lib/tiers";

interface WatchBoxProps {
  open: boolean;
  onClose: () => void;
  watches: CollectedWatch[];
  isPremium: boolean;
  onUpgrade: () => void;
}

const RARITY_META: Record<WatchRarity, { color: string; bg: string; icon: any; border: string }> = {
  Legendary: { color: "#B8962E", bg: "#FFF9E6", icon: Diamond, border: "#D4AF37" },
  Rare: { color: "#6B6259", bg: "#F5F3EE", icon: Award, border: "#C8BFB5" },
  Common: { color: "#9C9189", bg: "#FAFAF8", icon: Star, border: "#E0D9CC" },
};

export default function WatchBox({ open, onClose, watches, isPremium, onUpgrade }: WatchBoxProps) {
  // Group watches by rarity
  const grouped = watches.reduce((acc, w) => {
    const rarity = getRarity(w.brand);
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(w);
    return acc;
  }, {} as Record<WatchRarity, CollectedWatch[]>);

  const rarities: WatchRarity[] = ["Legendary", "Rare", "Common"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5,5,5,0.92)", perspective: "1000px" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="w-full max-w-2xl rounded-sm overflow-hidden flex flex-col"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E0D9CC",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              maxHeight: "85vh"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-6"
              style={{ borderBottom: "1px solid #EDE9E0", background: "#FAFAF8" }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Diamond size={14} className="text-[#B8962E]" />
                  <p className="text-[10px] text-[#B8962E] uppercase font-bold tracking-[0.3em]">
                    The Private Gallery
                  </p>
                </div>
                <h2 className="font-serif text-2xl text-[#1A1714]">Museum of Time</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-[#C8BFB5] hover:text-[#1A1714] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-4 bg-[#FAFAF8]">
              {!isPremium ? (
                <div className="text-center py-16">
                  <div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                    style={{ background: "#F5EDD0", border: "1px solid #D4AF37", boxShadow: "inset 0 0 20px rgba(212,175,55,0.1)" }}
                  >
                    <Lock size={32} className="text-[#B8962E]/60" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1A1714] mb-3">
                    Unlock Your Private Vault
                  </h3>
                  <p className="text-[#6B6259] text-sm font-sans mb-10 max-w-sm mx-auto leading-relaxed">
                    Collect the world&apos;s most prestigious timepieces as you play. Premium members get full access to their private watch gallery.
                  </p>
                  <button
                    onClick={onUpgrade}
                    className="
                      px-10 py-4 bg-[#B8962E] text-white
                      font-sans font-bold text-sm tracking-[0.2em] uppercase
                      rounded-sm hover:bg-[#A07828] transition-all
                      shadow-lg shadow-gold/20 active:scale-95
                    "
                  >
                    Start Your Collection
                  </button>
                </div>
              ) : watches.length === 0 ? (
                <div className="text-center py-16">
                  <div
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                    style={{ background: "#F5F3EE", border: "1px solid #E0D9CC" }}
                  >
                    <Package size={32} className="text-[#C8BFB5]" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1A1714] mb-2">The collection is currently empty</h3>
                  <p className="text-[#9C9189] text-sm font-sans">
                    Guess a watch perfectly to secure it in your gallery
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {rarities.map(rarity => {
                    const items = grouped[rarity];
                    if (!items?.length) return null;
                    const meta = RARITY_META[rarity];
                    const Icon = meta.icon;

                    return (
                      <div key={rarity}>
                        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#E0D9CC]/50">
                          <Icon size={16} style={{ color: meta.color }} />
                          <h4 className="text-xs font-sans font-bold tracking-[0.2em] uppercase" style={{ color: meta.color }}>
                            {rarity} Pieces
                          </h4>
                          <span className="ml-auto text-[10px] font-mono text-[#9C9189] uppercase">
                            {items.length} Timepiece{items.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {items.map((w, idx) => (
                            <motion.div
                              key={`${w.id}-${idx}`}
                              whileHover={{
                                scale: 1.05,
                                rotateY: 5,
                                rotateX: 5,
                                z: 20
                              }}
                              className="group relative rounded-sm overflow-hidden flex flex-col"
                              style={{
                                background: "#FFFFFF",
                                border: `1px solid ${meta.border}`,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                              }}
                            >
                              <div
                                className="relative aspect-[4/3] w-full"
                                style={{ background: "linear-gradient(45deg, #FAFAF8, #FFFFFF)" }}
                              >
                                <Image
                                  src={getWatchImagePath(w.image_name)}
                                  alt={w.name}
                                  fill
                                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                  unoptimized
                                />
                                {rarity === "Legendary" && (
                                  <div className="absolute top-2 right-2">
                                    <Diamond size={10} className="text-[#B8962E] animate-pulse" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3 bg-white border-t border-[#E0D9CC]/50">
                                <p className="text-[#1A1714] text-[11px] font-bold font-sans truncate mb-0.5">
                                  {w.brand}
                                </p>
                                <p className="text-[#9C9189] text-[10px] font-sans truncate">
                                  {w.name}
                                </p>
                              </div>

                              {/* Museum Plaque Overlay */}
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4"
                                style={{ background: "rgba(26,23,20,0.85)", backdropFilter: "blur(2px)" }}
                              >
                                <p className="text-white font-serif italic text-center text-xs mb-2">
                                  {w.brand}
                                </p>
                                <div className="h-px w-8 bg-[#B8962E] mb-2" />
                                <p className="text-[#B8962E] font-mono font-bold text-[10px]">
                                  Est. {w.price}
                                </p>
                                <span className="absolute bottom-2 text-[8px] text-[#C8BFB5] uppercase tracking-widest">
                                  Collected {new Date(w.collectedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {isPremium && watches.length > 0 && (
              <div
                className="px-8 py-5 flex items-center justify-between"
                style={{ borderTop: "1px solid #EDE9E0", background: "#FFFFFF" }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#B8962E]" />
                    <span className="text-[10px] font-sans font-bold text-[#1A1714] uppercase tracking-widest">
                      Museum Grade
                    </span>
                  </div>
                </div>
                <p className="text-[#9C9189] text-[10px] font-mono uppercase">
                  Curated Collection — {watches.length} watches
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
