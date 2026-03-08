"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, CheckCircle2, XCircle, Clock, Star, Package, Share, Info, Users } from "lucide-react";
import Image from "next/image";
import { toBlob } from "html-to-image";
import { RoundResult, Watch } from "@/lib/types";
import { getWatchImagePath } from "@/lib/assets";
import { saveGameResult, getUserHighScore, createChallenge, Challenge } from "@/lib/auth";
import { submitDailyScore } from "@/lib/leaderboard";
import { GAME_MODES, MODE_META, GameMode } from "@/lib/tiers";
import ShareScorecard from "./ShareScorecard";
import SpecSheetModal from "./SpecSheetModal";

interface GameOverProps {
  results: RoundResult[];
  totalScore: number;
  totalRounds: number;
  allWatches: Watch[];
  userId: string | null;
  userDisplayName: string | null;
  userPhotoURL: string | null;
  gameMode: string;
  isPremium: boolean;
  canPlay: boolean;
  onCollectWatch: (watch: Watch) => Promise<void>;
  onRestart: () => void;
  onUpgrade?: () => void;
  activeChallenge?: Challenge | null;
}

function getRank(accuracy: number) {
  if (accuracy >= 90) return { label: "Master Horologist", sub: "You see what others miss" };
  if (accuracy >= 70) return { label: "Watch Connoisseur", sub: "A refined eye for detail" };
  if (accuracy >= 50) return { label: "Enthusiast", sub: "The passion is there" };
  if (accuracy >= 30) return { label: "Apprentice", sub: "Keep studying the dial" };
  return { label: "Novice", sub: "Every expert was once a beginner" };
}

export default function GameOver({ results, totalScore, totalRounds, allWatches, userId, userDisplayName, userPhotoURL, gameMode, isPremium, canPlay, onCollectWatch, onRestart, onUpgrade, activeChallenge }: GameOverProps) {
  const perfect = results.filter((r) => r.brandCorrect && r.modelCorrect).length;
  const brandOnly = results.filter((r) => r.brandCorrect && !r.modelCorrect).length;
  const missed = results.filter((r) => !r.brandCorrect).length;
  const maxPossible = totalRounds * 1000;
  const accuracy = Math.round((totalScore / maxPossible) * 100);
  const rank = getRank(accuracy);
  const [prevHighScore, setPrevHighScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const hasSaved = useRef(false);
  const scorecardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedWatchForSpecs, setSelectedWatchForSpecs] = useState<Watch | null>(null);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [challengeLink, setChallengeLink] = useState<string | null>(null);

  async function handleShare() {
    if (!scorecardRef.current) return;
    setIsSharing(true);
    try {
      // Small delay to ensure any fonts/images are ready
      await new Promise(r => setTimeout(r, 100));
      const blob = await toBlob(scorecardRef.current, { cacheBust: true, pixelRatio: 1 });
      if (!blob) throw new Error("Failed to create image");

      const file = new File([blob], "watchguesser-score.png", { type: "image/png" });
      const nav = navigator as any;
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "WatchGuesser",
          text: `I scored ${totalScore.toLocaleString()} points (${accuracy}%) on WatchGuesser! Can you beat my score?`,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "watchguesser-score.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Error sharing:", e);
      alert("Failed to share score. Please try again.");
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCreateChallenge() {
    if (!isPremium || !userId) {
      document.dispatchEvent(new Event("watchguesser:upgrade"));
      return;
    }
    setCreatingChallenge(true);
    try {
      const watchIds = results.map(r => r.watch.id.toString());
      const challengeId = await createChallenge(userId, userDisplayName || "A Friend", totalScore, watchIds);
      const link = `${window.location.origin}/?challenge=${challengeId}`;
      setChallengeLink(link);

      // Attempt to share immediately if possible
      if (navigator.share) {
        await navigator.share({
          title: "WatchGuesser Challenge",
          text: `I just scored ${totalScore.toLocaleString()} on WatchGuesser! Can you beat my score?`,
          url: link
        });
      }
    } catch (e) {
      console.error("Error creating challenge:", e);
      alert("Failed to create challenge link.");
    } finally {
      setCreatingChallenge(false);
    }
  }

  async function handleCollect(watch: Watch) {
    if (!isPremium) return;
    await onCollectWatch(watch);
    setCollected((prev) => new Set(prev).add(watch.id));
  }

  useEffect(() => {
    if (!userId || hasSaved.current) return;
    hasSaved.current = true;

    async function save() {
      setSaving(true);
      try {
        const prev = await getUserHighScore(userId!);
        setPrevHighScore(prev);
        if (totalScore > prev) setIsNewHighScore(true);

        // Generate a unique ID for Daily Challenge to prevent duplicates even on reload
        let customId: string | undefined;
        if (gameMode === GAME_MODES.DAILY_CHALLENGE) {
          const today = new Date().toISOString().slice(0, 10);
          customId = `daily_${today}`;
        }

        await saveGameResult(userId!, totalScore, totalRounds, perfect, gameMode, customId);

        // Auto-submit to daily leaderboard if this was a Daily Challenge
        if (gameMode === GAME_MODES.DAILY_CHALLENGE) {
          await submitDailyScore(
            userId!,
            userDisplayName || "Anonymous",
            userPhotoURL ?? null,
            totalScore,
            perfect
          ).catch(() => { });
        }
      } catch (e) {
        console.error("Failed to save score:", e);
      } finally {
        setSaving(false);
      }
    }
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  function handleRestart() {
    onRestart();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto px-4 pb-8"
    >
      {activeChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-sm overflow-hidden shadow-2xl border border-[#E0D9CC] mb-8 mx-auto"
        >
          {/* Challenge Header */}
          <div className="bg-[#B8962E] px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Challenge Match</span>
            </div>
            <div className="text-[10px] font-mono font-bold uppercase">
              {totalScore > activeChallenge.creatorScore ? "You Won!" : totalScore < activeChallenge.creatorScore ? "Friend Won" : "It's a Tie!"}
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative px-8 py-10 text-center bg-[#FAFAF8]">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#1A1714] flex items-center justify-center text-white mb-2 border-2 border-white shadow-md">
                  <span className="font-serif font-bold text-lg">Y</span>
                </div>
                <p className="text-[10px] font-sans font-bold text-[#6B6259] uppercase tracking-widest">You</p>
                <p className="font-mono text-sm font-bold text-[#1A1714]">{totalScore.toLocaleString()}</p>
              </div>

              <div className="text-[#B8962E] font-serif italic text-xl">vs</div>

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#B8962E] flex items-center justify-center text-white mb-2 border-2 border-white shadow-md">
                  <span className="font-serif font-bold text-lg">{activeChallenge.creatorName[0].toUpperCase()}</span>
                </div>
                <p className="text-[10px] font-sans font-bold text-[#6B6259] uppercase tracking-widest">{activeChallenge.creatorName}</p>
                <p className="font-mono text-sm font-bold text-[#1A1714]">{activeChallenge.creatorScore.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gold rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-px mb-8 origin-left"
        style={{ background: "linear-gradient(to right, #B8962E, transparent)" }}
      />

      {/* Rank */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
          style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
        >
          <Trophy size={28} className="text-[#B8962E]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-4xl font-bold text-[#1A1714] mb-1"
        >
          {rank.label}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[#6B6259] text-base font-sans font-semibold italic"
        >
          {rank.sub}
        </motion.p>

        {isNewHighScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-sm"
            style={{ background: "#F5EDD0", border: "1px solid #D4AF37" }}
          >
            <Star size={11} className="text-[#B8962E]" />
            <span className="text-[#B8962E] text-sm font-sans tracking-widest uppercase font-bold">New High Score</span>
          </motion.div>
        )}

        {saving && userId && (
          <p className="text-[#C8BFB5] text-[10px] font-sans tracking-widest uppercase mt-2">Saving…</p>
        )}
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { label: "Final Score", value: totalScore.toLocaleString(), mono: true, highlight: true },
          { label: "Accuracy", value: `${accuracy}%`, mono: true, highlight: false },
          { label: "Perfect", value: `${perfect}/${totalRounds}`, mono: true, highlight: false },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            className="text-center py-4 px-3 rounded-sm"
            style={{
              background: item.highlight ? "#F5EDD0" : "#FFFFFF",
              border: item.highlight ? "1px solid #D4AF37" : "1px solid #E0D9CC",
              boxShadow: "0 1px 4px rgba(26,23,20,0.04)",
            }}
          >
            <p
              className={`text-2xl font-bold mb-1 ${item.mono ? "font-mono" : "font-sans"}`}
              style={{ color: item.highlight ? "#B8962E" : "#1A1714" }}
            >
              {item.value}
            </p>
            <p className="text-xs text-[#6B6259] uppercase tracking-widest font-sans font-semibold">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Stat pills */}
      <div className="flex gap-3 justify-center mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm font-sans font-semibold">
          <CheckCircle2 size={14} style={{ color: "#1A6B3A" }} />
          <span className="text-[#1A1714]">{perfect} perfect</span>
        </div>
        <div className="w-px h-4 bg-[#E0D9CC]" />
        <div className="flex items-center gap-1.5 text-sm font-sans font-semibold">
          <CheckCircle2 size={14} style={{ color: "#8A6A00" }} />
          <span className="text-[#1A1714]">{brandOnly} brand only</span>
        </div>
        <div className="w-px h-4 bg-[#E0D9CC]" />
        <div className="flex items-center gap-1.5 text-sm font-sans font-semibold">
          <XCircle size={14} style={{ color: "#9B2335" }} />
          <span className="text-[#1A1714]">{missed} missed</span>
        </div>
        {prevHighScore !== null && !isNewHighScore && (
          <>
            <div className="w-px h-4 bg-[#E0D9CC]" />
            <div className="flex items-center gap-1.5 text-sm font-sans font-semibold">
              <Trophy size={14} style={{ color: "#B8962E" }} />
              <span className="text-[#6B6259]">Best: {prevHighScore.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Round-by-round breakdown */}
      <div className="space-y-1.5 mb-6 max-h-64 overflow-y-auto">
        {results.map((result, i) => {
          const outcomeColor = result.brandCorrect && result.modelCorrect
            ? "#1A6B3A" : result.brandCorrect ? "#8A6A00" : "#9B2335";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm"
              style={{ background: "#FFFFFF", border: "1px solid #E0D9CC", boxShadow: "0 1px 3px rgba(26,23,20,0.04)" }}
            >
              <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden" style={{ background: "#F5F3EE" }}>
                <Image
                  src={getWatchImagePath(result.watch.image_name)}
                  alt={result.watch.name}
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1714] text-sm font-bold font-sans truncate">
                  {result.watch.brand}
                </p>
                <p className="text-[#6B6259] text-xs font-sans font-medium truncate">{result.watch.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {result.skipped || result.timeExpired ? (
                  <Clock size={13} style={{ color: "#9C9189" }} />
                ) : result.brandCorrect && result.modelCorrect ? (
                  <CheckCircle2 size={13} style={{ color: outcomeColor }} />
                ) : result.brandCorrect ? (
                  <CheckCircle2 size={13} style={{ color: outcomeColor }} />
                ) : (
                  <XCircle size={13} style={{ color: outcomeColor }} />
                )}
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: result.pointsEarned > 0 ? "#B8962E" : "#C8BFB5" }}
                >
                  {result.pointsEarned > 0 ? `+${result.pointsEarned}` : "0"}
                </span>
                {result.brandCorrect && result.modelCorrect && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => isPremium ? setSelectedWatchForSpecs(result.watch) : document.dispatchEvent(new Event("watchguesser:upgrade"))}
                      title={isPremium ? "View Deep Dive Specs" : "Only Premium members can view deep dive specs. Upgrade now!"}
                      className="p-1 rounded transition-colors hover:opacity-100"
                      style={{ color: isPremium ? "#B8962E" : "#C8BFB5", opacity: isPremium ? undefined : 0.8 }}
                    >
                      <Info size={12} />
                    </button>
                    <button
                      onClick={() => isPremium ? handleCollect(result.watch) : document.dispatchEvent(new Event("watchguesser:upgrade"))}
                      disabled={isPremium && collected.has(result.watch.id)}
                      title={isPremium ? "Add to Watch Box" : "Only Premium members can collect watches for their personal Watch Box. Upgrade to start your collection!"}
                      className="p-1 rounded transition-colors disabled:opacity-40 hover:opacity-100"
                      style={{ color: (isPremium && collected.has(result.watch.id)) || !isPremium ? "#B8962E" : "#C8BFB5", opacity: isPremium ? undefined : 0.8 }}
                    >
                      <Package size={12} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Play again */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 mt-4"
      >
        {gameMode !== GAME_MODES.DAILY_CHALLENGE ? (
          <div className="flex flex-col gap-3">
            {canPlay ? (
              <button
                onClick={onRestart}
                disabled={saving}
                className="w-full py-4 bg-[#1A1714] text-white font-sans font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Play Again
              </button>
            ) : (
              <button
                onClick={onUpgrade}
                className="w-full py-4 bg-[#B8962E] text-white font-sans font-bold text-sm tracking-widest uppercase rounded-sm hover:bg-[#A07828] transition-all"
              >
                Become Premium to Play Again
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-center py-4 px-6 bg-[#F5EDD0] border border-[#D4AF37] rounded-sm mt-2">
              <p className="text-[#B8962E] text-sm font-sans font-bold uppercase tracking-widest mb-1">
                Challenge Complete
              </p>
              <p className="text-[#6B6259] text-xs font-sans">
                Come back tomorrow for a new mystery watch rotation!
              </p>
            </div>
          </div>
        )}
      </motion.div>

      <div
        className="h-px mt-8"
        style={{ background: "linear-gradient(to right, transparent, #E0D9CC, transparent)" }}
      />

      <SpecSheetModal
        isOpen={!!selectedWatchForSpecs}
        onClose={() => setSelectedWatchForSpecs(null)}
        watch={selectedWatchForSpecs!}
      />
    </motion.div>
  );
}
