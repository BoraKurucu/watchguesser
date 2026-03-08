"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Crown, Medal } from "lucide-react";
import Image from "next/image";
import { getPremiumHallOfFame, PremiumHallOfFameEntry } from "@/lib/leaderboard";

interface PremiumHallOfFameModalProps {
  open: boolean;
  onClose: () => void;
  currentUid: string | null;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} style={{ color: "#B8962E" }} />;
  if (rank === 2) return <Medal size={16} style={{ color: "#9CA3AF" }} />;
  if (rank === 3) return <Medal size={16} style={{ color: "#B45309" }} />;
  return (
    <span className="text-sm font-mono font-bold text-[#9C9189] w-4 text-center">{rank}</span>
  );
}

export default function PremiumHallOfFameModal({ open, onClose, currentUid }: PremiumHallOfFameModalProps) {
  const [entries, setEntries] = useState<PremiumHallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getPremiumHallOfFame()
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
          style={{ background: "rgba(26,23,20,0.60)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="w-full max-w-md rounded-sm overflow-hidden flex flex-col"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E0D9CC",
              boxShadow: "0 12px 48px rgba(26,23,20,0.22)",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative px-5 py-5 shrink-0 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1A1714 0%, #2E2A25 100%)", borderBottom: "1px solid #B8962E" }}
            >
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "repeating-linear-gradient(45deg, #B8962E 0px, #B8962E 1px, transparent 1px, transparent 12px)"
              }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy size={16} style={{ color: "#B8962E" }} />
                    <p className="text-[#B8962E] font-sans font-bold text-xs tracking-widest uppercase">
                      Premium Hall of Fame
                    </p>
                  </div>
                  <h2 className="text-white font-serif text-xl font-bold leading-tight">
                    All-Time<br />
                    <span className="text-[#B8962E] italic">Legends</span>
                  </h2>
                  <p className="text-[#9C9189] text-xs font-sans mt-1.5">
                    Total points since the beginning
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-sm transition-colors hover:bg-white/10"
                >
                  <X size={16} className="text-[#9C9189]" />
                </button>
              </div>
            </div>

            <div
              className="grid grid-cols-2 shrink-0"
              style={{ background: "#FAFAF8", borderBottom: "1px solid #E0D9CC" }}
            >
              {[
                { label: "Competitors", value: entries.length.toString() },
                { label: "Top Total", value: entries[0]?.totalScore?.toLocaleString() ?? "—" },
              ].map(({ label, value }, i) => (
                <div
                  key={label}
                  className="flex flex-col items-center py-3 px-2"
                  style={{ borderLeft: i > 0 ? "1px solid #E0D9CC" : undefined }}
                >
                  <p className="text-[#1A1714] font-mono font-bold text-sm">{value}</p>
                  <p className="text-[#9C9189] text-[10px] font-sans uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-14">
                  <div
                    className="w-8 h-8 rounded-full animate-spin"
                    style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }}
                  />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-14">
                  <Trophy size={36} className="text-[#E0D9CC] mx-auto mb-3" />
                  <p className="text-[#6B6259] font-sans font-bold text-sm">No entries yet</p>
                  <p className="text-[#9C9189] font-sans text-xs mt-1">
                    Play games and build your all-time total.
                  </p>
                </div>
              ) : (
                entries.map((entry, i) => {
                  const rank = i + 1;
                  const isMe = entry.uid === currentUid;
                  return (
                    <motion.div
                      key={entry.uid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-sm px-3 py-3"
                      style={{
                        background: isMe
                          ? "#F5EDD0"
                          : rank === 1
                            ? "linear-gradient(135deg, #FDFAF2 0%, #F5EDD0 100%)"
                            : "#FFFFFF",
                        border: isMe
                          ? "1px solid #D4AF37"
                          : rank === 1
                            ? "1px solid #D4AF3780"
                            : "1px solid #E0D9CC",
                        boxShadow: rank <= 3 ? "0 1px 6px rgba(184,150,46,0.08)" : "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 flex items-center justify-center shrink-0">
                          <RankIcon rank={rank} />
                        </div>

                        {entry.photoURL ? (
                          <div
                            className="relative w-9 h-9 rounded-full overflow-hidden shrink-0"
                            style={{ border: rank === 1 ? "2px solid #D4AF37" : "1px solid #E0D9CC" }}
                          >
                            <Image
                              src={entry.photoURL}
                              alt={entry.displayName}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: rank === 1 ? "#F5EDD0" : "#F5F3EE",
                              border: rank === 1 ? "2px solid #D4AF37" : "1px solid #E0D9CC",
                            }}
                          >
                            <span
                              className="font-serif font-bold text-sm"
                              style={{ color: rank === 1 ? "#B8962E" : "#6B6259" }}
                            >
                              {entry.displayName[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-[#1A1714] text-sm font-sans font-bold truncate">
                            {entry.displayName}
                          </p>
                          {isMe && (
                            <span className="text-[9px] text-[#B8962E] font-sans font-bold uppercase tracking-widest">
                              you
                            </span>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className="font-mono font-bold text-base"
                            style={{ color: rank === 1 ? "#B8962E" : "#1A1714" }}
                          >
                            {entry.totalScore.toLocaleString()}
                          </p>
                          <p className="text-[9px] font-sans text-[#9C9189] uppercase tracking-widest">
                            total pts
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div
              className="px-5 py-3 text-center shrink-0"
              style={{ borderTop: "1px solid #EDE9E0", background: "#FAFAF8" }}
            >
              <p className="text-[#9C9189] text-xs font-sans">
                All-time rankings · Premium accounts only
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
