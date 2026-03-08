"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Play, Lock, Globe, Diamond, Archive,
  DollarSign, Package, Star, Flame, Calendar, Trophy, Check, X, Users, Crown
} from "lucide-react";
import Link from "next/link";
import { signInWithGoogle, Challenge } from "@/lib/auth";
import { getNextRankProgress } from "@/lib/ranks";
import { GameMode, GAME_MODES, MODE_META, FREE_DAILY_LIMIT } from "@/lib/tiers";

interface StartScreenProps {
  totalWatches: number;
  isPremium: boolean;
  isGuest: boolean;
  premiumUntil: string | null;
  gamesRemaining: number;
  dailyPlayedToday: boolean;
  watchBoxCount: number;
  userTotalScore?: number;
  userStreak?: number;
  onStart: (rounds: number, mode: GameMode) => void;
  onUpgrade: () => void;
  onOpenWatchBox: () => void;
  onOpenLeaderboard: () => void;
  onOpenHallOfFame: () => void;
  onOpenPremiumHallOfFame: () => void;
  activeChallenge?: Challenge | null;
  onClearChallenge?: () => void;
}

const MODE_ICONS: Record<string, React.ElementType> = {
  Globe, Diamond, Archive, DollarSign, Users
};

function useMidnightCountdown() {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    }
    calc();
    const int = setInterval(calc, 60000);
    return () => clearInterval(int);
  }, []);
  return timeLeft;
}

const TODAY_LABEL = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

export default function StartScreen({
  totalWatches,
  isPremium,
  isGuest,
  premiumUntil,
  gamesRemaining,
  dailyPlayedToday,
  watchBoxCount,
  userTotalScore = 0,
  userStreak = 0,
  onStart,
  onUpgrade,
  onOpenWatchBox,
  onOpenLeaderboard,
  onOpenHallOfFame,
  onOpenPremiumHallOfFame,
  activeChallenge,
  onClearChallenge,
}: StartScreenProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const modes = Object.values(GAME_MODES);
  const countdown = useMidnightCountdown();

  const rankData = getNextRankProgress(userTotalScore);

  const handleSignUp = () => {
    if (!accepted) return;
    setLoading(true);
    signInWithGoogle()
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto px-4"
    >
      {/* Gold rule top */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-px mb-6 origin-left"
        style={{ background: "linear-gradient(to right, transparent, #B8962E, transparent)" }}
      />

      {/* Wordmark + status row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-6"
      >
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1A1714] leading-none mb-1">Watch</h1>
          <h1 className="font-serif text-3xl italic font-bold text-[#B8962E] leading-none">Guesser</h1>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[#9C9189] text-[10px] font-sans font-bold tracking-widest uppercase">{isPremium ? "Tries" : "Plays Remaining"}</span>
            <span className="text-[#B8962E] text-xs font-mono font-bold px-1.5 py-0.5 bg-[#F5EDD0] rounded-sm">
              {isPremium ? "∞" : `${gamesRemaining} left`}
            </span>
          </div>
          {!isPremium && (
            <button
              onClick={onUpgrade}
              className="mt-1 text-[#B8962E] text-[9px] font-sans font-bold tracking-tight uppercase hover:underline opacity-80 hover:opacity-100 transition-all"
            >
              Unlock Premium for infinite games
            </button>
          )}
        </div>
      </motion.div>

      {/* Top CTA for Guests or Signed-in non-premium */}
      {isGuest ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4 p-4 bg-white border border-[#E0D9CC] rounded-sm shadow-sm"
        >
          <button
            onClick={handleSignUp}
            disabled={!accepted || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-sm transition-all duration-200 text-sm font-sans font-bold tracking-widest uppercase hover:border-[#B8962E] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#FFFFFF", border: "2px solid #B8962E", color: "#B8962E" }}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full animate-spin" style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {loading ? "Signing in…" : "Sign Up to Save Scores"}
          </button>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 text-left">
            <button
              onClick={() => setAccepted(!accepted)}
              className={`
                mt-0.5 w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center shrink-0
                ${accepted ? "bg-[#B8962E] border-[#B8962E]" : "bg-white border-[#E0D9CC]"}
              `}
            >
              {accepted && <Check size={12} className="text-white" />}
            </button>
            <p className="text-[#6B6259] text-[11px] leading-relaxed font-sans font-medium">
              I agree to the{" "}
              <Link href="/terms" className="text-[#B8962E] hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[#B8962E] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </motion.div>
      ) : !isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4 p-4 bg-[#F5EDD0] border border-[#D4AF37] rounded-sm shadow-sm"
        >
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-sm transition-all duration-200 text-sm font-sans font-bold tracking-widest uppercase bg-[#B8962E] text-white hover:bg-[#A07828] active:scale-[0.99]"
          >
            <Star size={16} />
            Become Premium — $3.99/mo
          </button>
          <p className="text-[#B8962E] text-[10px] text-center font-sans font-bold uppercase tracking-widest">
            Unlock all modes, specs & infinite games
          </p>
        </motion.div>
      )}

      {/* Player Badge (Rank & Streak) */}
      {!isGuest && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-sm p-3 relative overflow-hidden flex flex-col gap-3 border border-[#E0D9CC] bg-[#FFFFFF] shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#9C9189] font-sans uppercase tracking-widest font-bold mb-0.5">Current Rank</p>
              <p className="text-sm font-sans font-bold text-[#B8962E]">{rankData.current.name}</p>
            </div>
            {userStreak > 0 && (
              <div className="flex items-center gap-1.5 bg-[#FCEEF0] border border-[#9B233530] px-2 py-1 rounded-sm">
                <Flame size={12} className="text-[#9B2335]" />
                <span className="text-xs font-mono font-bold text-[#9B2335]">{userStreak} Day Streak</span>
              </div>
            )}
          </div>

          {rankData.next && (
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[9px] font-sans font-semibold text-[#6B6259]">Next: {rankData.next.name}</span>
                <span className="text-[9px] font-mono text-[#9C9189]">{userTotalScore.toLocaleString()} / {rankData.next.minScore.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-1.5 bg-[#F5F3EE] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rankData.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#B8962E]"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#1A1714] text-xs font-sans font-bold tracking-widest uppercase">Select Challenge</h2>
          <button
            onClick={() => (isPremium ? onOpenWatchBox() : onUpgrade())}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-[#F5F3EE] transition-colors border border-transparent hover:border-[#E0D9CC]"
          >
            <Archive size={13} className="text-[#6B6259]" />
            <span className="text-[#6B6259] text-[10px] font-sans font-bold tracking-widest uppercase">Watch Box ({watchBoxCount})</span>
            {!isPremium && <Lock size={12} className="text-[#C8BFB5]" />}
          </button>
        </div>

        <div className="space-y-3">
          {modes.map((mode) => {
            const meta = MODE_META[mode];
            const Icon = MODE_ICONS[meta.icon] ?? Globe;
            const locked = meta.premium && !isPremium;
            const isDaily = mode === GAME_MODES.DAILY_CHALLENGE;
            const completed = isDaily && dailyPlayedToday;

            return (
              <div
                key={mode}
                className="relative rounded-sm overflow-hidden"
                style={{
                  background: locked || completed ? "#FAFAF8" : "#FFFFFF",
                  border: locked || completed ? "1px solid #EDE9E0" : "1px solid #E0D9CC",
                  boxShadow: locked || completed ? "none" : "0 1px 4px rgba(26,23,20,0.04)",
                }}
              >
                <button
                  onClick={() => locked ? onUpgrade() : onStart(8, mode)}
                  disabled={completed || (!isPremium && !meta.premium && gamesRemaining === 0)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left group transition-all hover:bg-[#FAFAF8] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div
                    className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0"
                    style={{
                      background: locked ? "#F5F3EE" : completed ? "#EBF7F0" : meta.premium ? "#F5EDD0" : "#F5F3EE",
                      border: locked ? "1px solid #EDE9E0" : completed ? "1px solid #1A6B3A40" : meta.premium ? "1px solid #D4AF37" : "1px solid #E0D9CC",
                    }}
                  >
                    {locked ? (
                      <Lock size={13} className="text-[#C8BFB5]" />
                    ) : completed ? (
                      <Trophy size={13} className="text-[#1A6B3A]" />
                    ) : (
                      <Icon size={13} style={{ color: meta.premium ? "#B8962E" : "#6B6259" }} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-base font-sans font-bold"
                        style={{ color: locked ? "#9C9189" : "#1A1714" }}
                      >
                        {meta.label}
                      </span>
                      {meta.premium && (
                        <span
                          className="text-[9px] font-sans tracking-widest uppercase px-1.5 py-0.5 rounded-sm font-semibold"
                          style={{
                            background: locked ? "#F5F3EE" : "#F5EDD0",
                            color: locked ? "#C8BFB5" : "#B8962E",
                            border: locked ? "1px solid #EDE9E0" : "1px solid #D4AF37",
                          }}
                        >
                          Premium
                        </span>
                      )}
                      {completed && (
                        <span className="text-[9px] font-sans tracking-widest uppercase px-1.5 py-0.5 rounded-sm font-bold bg-[#EBF7F0] text-[#1A6B3A] border border-[#1A6B3A20]">
                          Finished
                        </span>
                      )}
                    </div>
                    {isDaily ? (
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs font-sans font-semibold" style={{ color: completed ? "#1A6B3A" : "#B8962E" }}>
                          {completed ? "Challenge complete — see you tomorrow!" : TODAY_LABEL}
                        </span>
                        <span className="text-[#C8BFB5] text-[10px]">·</span>
                        <span className="text-xs font-mono font-bold" style={{ color: "#6B6259" }}>
                          New in {countdown}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-sans font-medium mt-0.5" style={{ color: locked ? "#B8962E" : "#6B6259" }}>
                          {meta.description}
                        </p>
                        {!isPremium && !locked && gamesRemaining === 1 && mode === GAME_MODES.WORLD_TOUR && (
                          <div className="mt-1.5 inline-block">
                            <span className="text-[9px] font-sans font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-[#FCEEF0] text-[#9B2335] border border-[#9B233520]">
                              Last play today
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!locked && !completed && (
                    <Play
                      size={13}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: meta.premium ? "#B8962E" : "#9C9189" }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        {/* Leaderboard button */}
        <div className="relative group">
          <button
            onClick={onOpenLeaderboard}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm transition-all duration-200 text-sm font-sans font-semibold tracking-widest uppercase hover:bg-[#F5F3EE] active:scale-[0.99]"
            style={{ background: "#FFFFFF", border: "1px solid #E0D9CC", color: "#6B6259" }}
          >
            <Trophy size={14} className="text-[#B8962E]" />
            Daily Tournament Leaderboard
          </button>
          {!isPremium && (
            <div className="absolute -top-2 -right-1 bg-[#B8962E] text-white text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-widest uppercase pointer-events-none">
              Premium
            </div>
          )}
        </div>

        {/* Hall of Fame button */}
        <div className="relative group">
          <button
            onClick={onOpenHallOfFame}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm transition-all duration-200 text-sm font-sans font-semibold tracking-widest uppercase hover:bg-[#1A1714] active:scale-[0.99]"
            style={{ background: "#1A1714", border: "1px solid #1A1714", color: "#B8962E" }}
          >
            <Crown size={14} className="text-[#B8962E]" />
            Weekly Hall of Fame
          </button>
          {!isPremium && (
            <div className="absolute -top-2 -right-1 bg-[#B8962E] text-white text-[8px] font-sans font-bold px-1.5 py-0.5 rounded-sm shadow-sm tracking-widest uppercase pointer-events-none">
              Premium
            </div>
          )}
        </div>

        {/* Premium Hall of Fame button */}
        {isPremium ? (
          <button
            onClick={onOpenPremiumHallOfFame}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm transition-all duration-200 text-sm font-sans font-semibold tracking-widest uppercase hover:bg-[#F5F3EE] active:scale-[0.99]"
            style={{ background: "#FFFFFF", border: "1px solid #D4AF37", color: "#6B6259" }}
          >
            <Trophy size={14} className="text-[#B8962E]" />
            Premium Hall of Fame
          </button>
        ) : null}

        {isPremium ? (
          /* Premium badge */
          <div
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-sm"
            style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
          >
            <Star size={15} className="text-[#B8962E]" />
            <div className="text-center">
              <p className="text-[#B8962E] text-sm font-sans font-bold tracking-widest uppercase">Collector&apos;s Club Member</p>
              {premiumUntil && (
                <p className="text-[#9C9189] text-xs font-sans mt-0.5">
                  Active until {new Date(premiumUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Non-premium CTAs */
          <div className="space-y-4">
            {/* Catch-all for non-premium signed-in? No, moved to top. */}
          </div>
        )}
      </motion.div>

      {/* Gold rule bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.45 }}
        className="h-px mt-10 origin-right"
        style={{ background: "linear-gradient(to left, transparent, #B8962E, transparent)" }}
      />
    </motion.div>
  );
}
