"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, ArrowRight, Trophy } from "lucide-react";
import Image from "next/image";
import { RoundResult } from "@/lib/types";
import { getWatchImagePath } from "@/lib/assets";

interface ComparisonCardProps {
  result: RoundResult;
  roundNumber: number;
  totalRounds: number;
  totalScore: number;
  onNext: () => void;
}

export default function ComparisonCard({
  result,
  roundNumber,
  totalRounds,
  totalScore,
  onNext,
}: ComparisonCardProps) {
  const isLast = roundNumber >= totalRounds - 1;
  const { watch, brandCorrect, modelCorrect, pointsEarned, skipped, timeExpired } = result;

  const outcomeColor = brandCorrect && modelCorrect
    ? "#1A6B3A"
    : brandCorrect
    ? "#8A6A00"
    : "#9B2335";

  const outcomeBg = brandCorrect && modelCorrect
    ? "#EBF7F0"
    : brandCorrect
    ? "#FDF6E3"
    : "#FCEEF0";

  const outcomeLabel = brandCorrect && modelCorrect
    ? "Perfect"
    : brandCorrect
    ? "Brand Correct"
    : skipped || timeExpired
    ? timeExpired ? "Time's Up" : "Skipped"
    : "Incorrect";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* Outcome banner */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
        className="h-px mb-6 origin-left"
        style={{ background: `linear-gradient(to right, ${outcomeColor}, transparent)` }}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {brandCorrect && modelCorrect ? (
            <CheckCircle2 size={20} style={{ color: outcomeColor }} />
          ) : brandCorrect ? (
            <CheckCircle2 size={20} style={{ color: outcomeColor }} />
          ) : timeExpired ? (
            <Clock size={20} style={{ color: outcomeColor }} />
          ) : (
            <XCircle size={20} style={{ color: outcomeColor }} />
          )}
          <span
            className="font-serif text-xl font-semibold"
            style={{ color: outcomeColor }}
          >
            {outcomeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-[#B8962E]" />
          <span className="font-mono text-[#1A1714] font-bold">{totalScore.toLocaleString()}</span>
          <span className="text-[#9C9189] text-xs">pts</span>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Your guess */}
        <div className="border rounded-sm p-4" style={{ background: "#FFFFFF", border: "1px solid #E0D9CC", boxShadow: "0 1px 4px rgba(26,23,20,0.04)" }}>
          <p className="text-[10px] text-[#9C9189] uppercase tracking-widest font-sans mb-3">
            Your Guess
          </p>
          {skipped || timeExpired ? (
            <p className="text-[#9C9189] text-sm italic font-sans">No answer</p>
          ) : (
            <>
              <div className="flex items-start gap-2 mb-2">
                {brandCorrect
                  ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "#1A6B3A" }} />
                  : <XCircle size={13} className="mt-0.5 shrink-0" style={{ color: "#9B2335" }} />
                }
                <div>
                  <p className="text-[10px] text-[#9C9189] uppercase tracking-wider font-sans">Brand</p>
                  <p className="text-[#1A1714] text-sm font-semibold font-sans">{result.userBrand || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {modelCorrect
                  ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: "#1A6B3A" }} />
                  : <XCircle size={13} className="mt-0.5 shrink-0" style={{ color: "#9B2335" }} />
                }
                <div>
                  <p className="text-[10px] text-[#9C9189] uppercase tracking-wider font-sans">Model</p>
                  <p className="text-[#1A1714] text-sm font-semibold font-sans">{result.userModel || "—"}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Correct answer */}
        <div
          className="border rounded-sm p-4 relative overflow-hidden"
          style={{ background: outcomeBg, borderColor: `${outcomeColor}22` }}
        >
          <p className="text-[10px] uppercase tracking-widest font-sans mb-3" style={{ color: `${outcomeColor}80` }}>
            Correct Answer
          </p>
          <div className="flex gap-3">
            <div className="relative w-14 h-14 shrink-0 rounded overflow-hidden" style={{ background: "#F5F3EE" }}>
              <Image
                src={getWatchImagePath(watch.image_name)}
                alt={watch.name}
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#9C9189] uppercase tracking-wider font-sans">Brand</p>
              <p className="font-semibold font-sans text-sm mb-1 truncate" style={{ color: outcomeColor }}>
                {watch.brand}
              </p>
              <p className="text-[10px] text-[#9C9189] uppercase tracking-wider font-sans">Model</p>
              <p className="text-[#1A1714] font-sans text-sm truncate">{watch.name}</p>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(224,217,204,0.6)" }}>
            <p className="text-[10px] text-[#9C9189] uppercase tracking-wider font-sans">Price</p>
            <p className="text-[#6B6259] text-sm font-mono">{watch.price}</p>
          </div>
        </div>
      </div>

      {/* Points earned */}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-sm mb-5"
        style={{ background: "#F5EDD0", border: "1px solid #D4AF37", boxShadow: "0 1px 4px rgba(26,23,20,0.04)" }}
      >
        <div className="text-center">
          <p className="text-[10px] text-[#9C9189] uppercase tracking-widest font-sans mb-1">Round Points</p>
          <p
            className="text-2xl font-bold font-mono"
            style={{ color: pointsEarned > 0 ? "#B8962E" : "#C8BFB5" }}
          >
            {pointsEarned > 0 ? `+${pointsEarned}` : "0"}
          </p>
        </div>
        {result.hintCost > 0 && (
          <div className="text-center">
            <p className="text-[10px] text-[#9C9189] uppercase tracking-widest font-sans mb-1">Hint Cost</p>
            <p className="text-2xl font-bold font-mono text-[#8A6A00]">-{result.hintCost}</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-[10px] text-[#9C9189] uppercase tracking-widest font-sans mb-1">Total</p>
          <p className="text-2xl font-bold font-mono text-[#1A1714]">{totalScore.toLocaleString()}</p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="
          w-full flex items-center justify-center gap-3
          py-4 bg-[#B8962E] text-white
          font-sans font-semibold text-sm tracking-widest uppercase
          rounded-sm hover:bg-[#A07828] active:scale-[0.99]
          transition-all duration-150
        "
      >
        {isLast ? (
          <>
            <Trophy size={16} />
            Final Results
          </>
        ) : (
          <>
            Next Watch
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </motion.div>
  );
}
