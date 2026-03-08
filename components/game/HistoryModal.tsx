"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, Trophy, Target, CheckCircle2, Calendar, Globe, Diamond, Archive, DollarSign } from "lucide-react";
import { getGameHistory, GameRecord } from "@/lib/auth";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  displayName: string | null;
  highScore: number;
  gamesPlayed: number;
}

const MODE_LABELS: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  world_tour: { label: "World Tour", Icon: Globe, color: "#6B6259" },
  the_boutique: { label: "The Boutique", Icon: Diamond, color: "#B8962E" },
  price_guesser: { label: "Price Guesser", Icon: DollarSign, color: "#B8962E" },
  daily_challenge: { label: "Daily Tournament", Icon: Calendar, color: "#1A6B3A" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function AccuracyBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "#1A6B3A" : pct >= 40 ? "#8A6A00" : "#9B2335";
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#EDE9E0" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function HistoryModal({ open, onClose, uid, displayName, highScore, gamesPlayed }: HistoryModalProps) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getGameHistory(uid, 30)
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [open, uid]);

  const avgScore = records.length
    ? Math.round(records.reduce((s, r) => s + r.score, 0) / records.length)
    : 0;
  const avgAccuracy = records.length
    ? Math.round(records.reduce((s, r) => s + r.accuracy, 0) / records.length)
    : 0;

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
            className="w-full max-w-lg rounded-sm overflow-hidden flex flex-col"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E0D9CC",
              boxShadow: "0 8px 40px rgba(26,23,20,0.18)",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between shrink-0"
              style={{ background: "#FAFAF8", borderBottom: "1px solid #E0D9CC" }}
            >
              <div className="flex items-center gap-2">
                <History size={18} className="text-[#B8962E]" />
                <div>
                  <p className="text-[#1A1714] font-sans font-bold text-sm">Game History</p>
                  <p className="text-[#9C9189] text-xs font-sans">{displayName ?? "Your scores"}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-sm hover:bg-[#EDE9E0] transition-colors"
              >
                <X size={16} className="text-[#6B6259]" />
              </button>
            </div>

            {/* Stats strip */}
            <div
              className="grid grid-cols-4 shrink-0"
              style={{ borderBottom: "1px solid #E0D9CC" }}
            >
              {[
                { label: "Games", value: gamesPlayed.toString(), Icon: History },
                { label: "High Score", value: highScore.toLocaleString(), Icon: Trophy },
                { label: "Avg Score", value: avgScore.toLocaleString(), Icon: Target },
                { label: "Avg Accuracy", value: `${avgAccuracy}%`, Icon: CheckCircle2 },
              ].map(({ label, value, Icon }, i) => (
                <div key={label} className="flex flex-col items-center py-3 px-2" style={{ borderLeft: i > 0 ? "1px solid #E0D9CC" : undefined }}>
                  <Icon size={13} className="text-[#B8962E] mb-1" />
                  <p className="text-[#1A1714] font-mono font-bold text-sm">{value}</p>
                  <p className="text-[#9C9189] text-[10px] font-sans uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>

            {/* Records list */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className="w-8 h-8 rounded-full animate-spin"
                    style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }}
                  />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <History size={32} className="text-[#E0D9CC] mx-auto mb-3" />
                  <p className="text-[#6B6259] font-sans font-semibold text-sm">No games yet</p>
                  <p className="text-[#9C9189] font-sans text-xs mt-1">Play a game to start tracking your scores</p>
                </div>
              ) : (
                records.map((r, i) => {
                  const modeInfo = MODE_LABELS[r.mode] ?? MODE_LABELS.world_tour;
                  const ModeIcon = modeInfo.Icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-sm px-3 py-2.5"
                      style={{ background: "#FAFAF8", border: "1px solid #E0D9CC" }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <ModeIcon size={12} style={{ color: modeInfo.color }} />
                          <span className="text-xs font-sans font-semibold" style={{ color: modeInfo.color }}>
                            {modeInfo.label}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-base text-[#1A1714]">
                          {r.score.toLocaleString()}
                          <span className="text-[#9C9189] text-xs font-sans font-normal ml-1">pts</span>
                        </span>
                      </div>

                      <AccuracyBar pct={r.accuracy} />

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[#6B6259] text-xs font-sans">
                            <span className="font-bold text-[#1A1714]">{r.perfect}</span>/{r.rounds} perfect
                          </span>
                          <span className="text-[#9C9189] text-xs font-sans">{r.accuracy}% accuracy</span>
                        </div>
                        <span className="text-[#C8BFB5] text-[10px] font-sans">{formatDate(r.playedAt)}</span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 text-center shrink-0"
              style={{ borderTop: "1px solid #EDE9E0", background: "#FAFAF8" }}
            >
              <p className="text-[#9C9189] text-xs font-sans">Last 30 games · Scores saved automatically</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
