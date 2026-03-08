"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Lock, Unlock } from "lucide-react";
import { HintItem } from "@/lib/types";

interface HintSystemProps {
  hints: HintItem[];
  onReveal: (label: string) => void;
  disabled?: boolean;
}

export default function HintSystem({ hints, onReveal, disabled }: HintSystemProps) {
  const revealedCount = hints.filter((h) => h.revealed).length;

  return (
    <div className="w-full">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={14} className="text-[#B8962E]" />
          <span className="text-xs text-[#3D3730] uppercase tracking-widest font-sans font-bold">
            Hints — costs {hints[0]?.cost ?? 100} pts each
          </span>
          {revealedCount > 0 && (
            <span className="ml-auto text-xs text-[#9B2335] font-mono font-bold">
              -{revealedCount * (hints[0]?.cost ?? 100)} pts
            </span>
          )}
        </div>

        <div className="mt-1.5 text-[10px] font-sans text-[#9C9189]">
          <span className="font-semibold text-[#6B6259]">Brand + Model</span> <span className="font-mono font-bold">+1,000</span>
          <span className="mx-2 text-[#C8BFB5]">·</span>
          <span className="font-semibold text-[#6B6259]">Brand only</span> <span className="font-mono font-bold">+300</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {hints.map((hint) => (
          <AnimatePresence key={hint.label} mode="wait">
            {hint.revealed ? (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-sm"
                style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
              >
                <Unlock size={12} className="text-[#B8962E] shrink-0" />
                <span className="text-[#6B6259] text-sm font-sans font-semibold">{hint.label}:</span>
                <span className="text-[#1A1714] text-sm font-bold font-sans">{hint.value}</span>
              </motion.div>
            ) : (
              <motion.button
                key="locked"
                onClick={() => !disabled && onReveal(hint.label)}
                disabled={disabled}
                whileTap={{ scale: 0.97 }}
                className="
                  flex items-center gap-2 px-3 py-2
                  bg-white border border-[#E0D9CC]
                  hover:border-[#B8962E]/40 hover:bg-[#FAFAF8]
                  rounded-sm transition-all duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                  group
                "
              >
                <Lock size={12} className="text-[#9C9189] group-hover:text-[#B8962E] transition-colors shrink-0" />
                <span className="text-[#3D3730] group-hover:text-[#1A1714] text-sm font-sans font-semibold transition-colors">
                  {hint.label}
                </span>
                <span className="text-[#9C9189] text-xs font-mono font-bold group-hover:text-[#B8962E] transition-colors">
                  -{hint.cost}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}
