"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Medal, Crown, Star } from "lucide-react";
import Image from "next/image";
import { getDailyLeaderboard, LeaderboardEntry } from "@/lib/leaderboard";

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  currentUid: string | null;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric",
});

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} style={{ color: "#B8962E" }} />;
  if (rank === 2) return <Medal size={16} style={{ color: "#9CA3AF" }} />;
  if (rank === 3) return <Medal size={16} style={{ color: "#B45309" }} />;
  return <span className="text-sm font-mono font-bold text-[#9C9189] w-4 text-center">{rank}</span>;
}

export default function LeaderboardModal({ open, onClose, currentUid, isPremium, onUpgrade }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getDailyLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(26,23,20,0.55)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full max-w-md rounded-sm overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E0D9CC", boxShadow: "0 8px 40px rgba(26,23,20,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: "#F5EDD0", borderBottom: "1px solid #D4AF37" }}
            >
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-[#B8962E]" />
                <div>
                  <p className="text-[#B8962E] font-sans font-bold text-sm tracking-widest uppercase">
                    Daily Tournament
                  </p>
                  <p className="text-[#6B6259] text-xs font-sans">{TODAY}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-sm hover:bg-[#EDE9E0] transition-colors"
              >
                <X size={16} className="text-[#6B6259]" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {isPremium === false && (
                <button
                  onClick={() => onUpgrade?.()}
                  className="w-full mb-3 px-3 py-2 rounded-sm text-left transition-colors hover:bg-[#F5EDD0]"
                  style={{ background: "#FAFAF8", border: "1px solid #E0D9CC" }}
                >
                  <p className="text-[#1A1714] text-xs font-sans font-bold">
                    Premium members compete in the Daily Tournament.
                  </p>
                  <p className="text-[#9C9189] text-[11px] font-sans mt-0.5">
                    Join Premium to submit scores and claim a spot on the leaderboard.
                  </p>
                </button>
              )}
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div
                    className="w-8 h-8 rounded-full animate-spin"
                    style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }}
                  />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-10">
                  <Trophy size={32} className="text-[#E0D9CC] mx-auto mb-3" />
                  <p className="text-[#6B6259] font-sans font-semibold text-sm">No scores yet today</p>
                  <p className="text-[#9C9189] font-sans text-xs mt-1">Be the first to play the Daily Tournament!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, i) => {
                    const rank = i + 1;
                    const isMe = entry.uid === currentUid;
                    return (
                      <motion.div
                        key={entry.uid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-sm"
                        style={{
                          background: isMe ? "#F5EDD0" : rank <= 3 ? "#FAFAF8" : "#FFFFFF",
                          border: isMe ? "1px solid #D4AF37" : "1px solid #E0D9CC",
                        }}
                      >
                        {/* Rank */}
                        <div className="w-5 flex items-center justify-center shrink-0">
                          <RankIcon rank={rank} />
                        </div>

                        {/* Avatar */}
                        {entry.photoURL ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E0D9CC] shrink-0">
                            <Image src={entry.photoURL} alt={entry.displayName} fill className="object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
                          >
                            <span className="text-[#B8962E] text-xs font-bold font-sans">
                              {entry.displayName[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}

                        {/* Name */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="flex items-center text-[#1A1714] text-sm font-sans font-bold truncate">
                            {entry.displayName}
                            {entry.isPremium && (
                              <Star size={10} className="ml-1.5 text-[#B8962E]" fill="#B8962E" />
                            )}
                            {isMe && (
                              <span className="ml-1.5 text-[10px] text-[#B8962E] font-sans font-semibold uppercase tracking-widest">you</span>
                            )}
                          </p>
                          <p className="text-[#9C9189] text-xs font-sans">{entry.perfect}/8 perfect</p>
                        </div>

                        {/* Score */}
                        <span
                          className="font-mono font-bold text-base shrink-0"
                          style={{ color: rank === 1 ? "#B8962E" : "#1A1714" }}
                        >
                          {entry.score.toLocaleString()}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 text-center"
              style={{ borderTop: "1px solid #EDE9E0", background: "#FAFAF8" }}
            >
              <p className="text-[#9C9189] text-xs font-sans">
                Leaderboard resets daily at midnight · Play the Daily Tournament to compete
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
