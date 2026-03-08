"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Medal, Star, Trophy, Flame, Calendar, TrendingUp } from "lucide-react";
import Image from "next/image";
import { getWeeklyHallOfFame, HallOfFameEntry } from "@/lib/leaderboard";

interface HallOfFameModalProps {
    open: boolean;
    onClose: () => void;
    currentUid: string | null;
    isPremium?: boolean;
    onUpgrade?: () => void;
}

const WEEK_LABEL = (() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(monday)} – ${fmt(sunday)}`;
})();

const DAYS_SO_FAR = (() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
})();

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1)
        return (
            <div className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}>
                <Crown size={14} style={{ color: "#B8962E" }} />
            </div>
        );
    if (rank === 2)
        return (
            <div className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "#F5F5F5", border: "1px solid #D1D5DB" }}>
                <Medal size={14} style={{ color: "#9CA3AF" }} />
            </div>
        );
    if (rank === 3)
        return (
            <div className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: "#FEF3E8", border: "1px solid #D97706" }}>
                <Medal size={14} style={{ color: "#B45309" }} />
            </div>
        );
    return (
        <div className="w-7 h-7 flex items-center justify-center">
            <span className="text-sm font-mono font-bold text-[#9C9189]">{rank}</span>
        </div>
    );
}

export default function HallOfFameModal({ open, onClose, currentUid, isPremium, onUpgrade }: HallOfFameModalProps) {
    const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        getWeeklyHallOfFame()
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
                        {/* ── Header ── */}
                        <div
                            className="relative px-5 py-5 shrink-0 overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #1A1714 0%, #2E2A25 100%)", borderBottom: "1px solid #B8962E" }}
                        >
                            {/* subtle gold shimmer lines */}
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: "repeating-linear-gradient(45deg, #B8962E 0px, #B8962E 1px, transparent 1px, transparent 12px)"
                            }} />
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy size={16} style={{ color: "#B8962E" }} />
                                        <p className="text-[#B8962E] font-sans font-bold text-xs tracking-widest uppercase">
                                            Hall of Fame
                                        </p>
                                    </div>
                                    <h2 className="text-white font-serif text-xl font-bold leading-tight">
                                        Weekly Tournament<br />
                                        <span className="text-[#B8962E] italic">Champions</span>
                                    </h2>
                                    <p className="text-[#9C9189] text-xs font-sans mt-1.5 flex items-center gap-1.5">
                                        <Calendar size={11} />
                                        {WEEK_LABEL}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-sm transition-colors hover:bg-white/10"
                                >
                                    <X size={16} className="text-[#9C9189]" />
                                </button>
                            </div>

                            {/* Week progress strip */}
                            <div className="relative mt-4">
                                <div className="flex gap-1">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div
                                                className="w-full h-1 rounded-full"
                                                style={{
                                                    background: i < DAYS_SO_FAR ? "#B8962E" : "rgba(184,150,46,0.2)",
                                                }}
                                            />
                                            <span className="text-[9px] font-mono" style={{ color: i < DAYS_SO_FAR ? "#B8962E" : "#6B6259" }}>
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Stats strip ── */}
                        <div
                            className="grid grid-cols-3 shrink-0"
                            style={{ background: "#FAFAF8", borderBottom: "1px solid #E0D9CC" }}
                        >
                            {[
                                { label: "Competitors", value: entries.length.toString(), Icon: Trophy },
                                { label: "Days Played", value: `${DAYS_SO_FAR}/7`, Icon: Calendar },
                                { label: "Top Score", value: entries[0]?.weeklyScore?.toLocaleString() ?? "—", Icon: TrendingUp },
                            ].map(({ label, value, Icon }, i) => (
                                <div
                                    key={label}
                                    className="flex flex-col items-center py-3 px-2"
                                    style={{ borderLeft: i > 0 ? "1px solid #E0D9CC" : undefined }}
                                >
                                    <Icon size={12} className="text-[#B8962E] mb-1" />
                                    <p className="text-[#1A1714] font-mono font-bold text-sm">{value}</p>
                                    <p className="text-[#9C9189] text-[10px] font-sans uppercase tracking-widest">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* ── List ── */}
                        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
                            {isPremium === false && (
                                <button
                                    onClick={() => onUpgrade?.()}
                                    className="w-full px-3 py-2 rounded-sm text-left transition-colors hover:bg-[#F5EDD0]"
                                    style={{ background: "#FAFAF8", border: "1px solid #E0D9CC" }}
                                >
                                    <p className="text-[#1A1714] text-xs font-sans font-bold">
                                        Weekly Hall of Fame is for Premium competitors.
                                    </p>
                                    <p className="text-[#9C9189] text-[11px] font-sans mt-0.5">
                                        Join Premium to submit tournament scores and chase the crown.
                                    </p>
                                </button>
                            )}
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
                                    <p className="text-[#6B6259] font-sans font-bold text-sm">No champions yet this week</p>
                                    <p className="text-[#9C9189] font-sans text-xs mt-1">
                                        Play the Daily Tournament to claim your spot!
                                    </p>
                                </div>
                            ) : (
                                entries.map((entry, i) => {
                                    const rank = i + 1;
                                    const isMe = entry.uid === currentUid;
                                    const daysBar = Math.round((entry.daysPlayed / 7) * 100);

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
                                                {/* Rank */}
                                                <RankBadge rank={rank} />

                                                {/* Avatar */}
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
                                                        <span className="font-serif font-bold text-sm" style={{ color: rank === 1 ? "#B8962E" : "#6B6259" }}>
                                                            {entry.displayName[0]?.toUpperCase() ?? "?"}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Name + meta */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <p className="text-[#1A1714] text-sm font-sans font-bold truncate">
                                                            {entry.displayName}
                                                        </p>
                                                        {entry.isPremium && (
                                                            <Star size={10} className="text-[#B8962E] shrink-0" fill="#B8962E" />
                                                        )}
                                                        {isMe && (
                                                            <span className="text-[9px] text-[#B8962E] font-sans font-bold uppercase tracking-widest shrink-0">
                                                                you
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Days-played bar */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#EDE9E0" }}>
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{ width: `${daysBar}%`, background: "#B8962E" }}
                                                            />
                                                        </div>
                                                        <span className="text-[9px] font-mono text-[#9C9189] shrink-0">
                                                            {entry.daysPlayed}d
                                                        </span>
                                                    </div>

                                                    {/* Best day */}
                                                    <p className="text-[10px] font-sans text-[#9C9189] mt-0.5">
                                                        Best day: <span className="font-mono font-bold text-[#6B6259]">{entry.bestDay.toLocaleString()}</span>
                                                    </p>
                                                </div>

                                                {/* Weekly score */}
                                                <div className="text-right shrink-0">
                                                    <p
                                                        className="font-mono font-bold text-base"
                                                        style={{ color: rank === 1 ? "#B8962E" : "#1A1714" }}
                                                    >
                                                        {entry.weeklyScore.toLocaleString()}
                                                    </p>
                                                    <p className="text-[9px] font-sans text-[#9C9189] uppercase tracking-widest">
                                                        weekly pts
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>

                        {/* ── Footer ── */}
                        <div
                            className="px-5 py-3 text-center shrink-0"
                            style={{ borderTop: "1px solid #EDE9E0", background: "#FAFAF8" }}
                        >
                            <p className="text-[#9C9189] text-xs font-sans flex items-center justify-center gap-1.5">
                                <Flame size={11} className="text-[#B8962E]" />
                                Rankings reset every Monday · Play the Daily Tournament to compete
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
