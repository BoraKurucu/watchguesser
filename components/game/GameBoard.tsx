"use client";

import { useReducer, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, SkipForward } from "lucide-react";
import { Watch } from "@/lib/types";
import { Challenge } from "@/lib/auth";
import { gameReducer, createInitialState } from "@/lib/gameReducer";
import { getWatchImagePath, preloadImage } from "@/lib/assets";
import { useTimer } from "@/hooks/useTimer";
import { playSound } from "@/lib/audio";
import WatchViewer from "./WatchViewer";
import GuessInput from "./GuessInput";
import HintSystem from "./HintSystem";
import ComparisonCard from "./ComparisonCard";
import GameOver from "./GameOver";

interface GameBoardProps {
  watches: Watch[];
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
  onUpgrade: () => void;
  activeChallenge?: Challenge | null;
}

const ROUND_TIME = 15;

export default function GameBoard({ watches, totalRounds, allWatches, userId, userDisplayName, userPhotoURL, gameMode, isPremium, canPlay, onCollectWatch, onRestart, onUpgrade, activeChallenge }: GameBoardProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    { watches, totalRounds },
    ({ watches: w, totalRounds: t }) => createInitialState(w, t)
  );
  const timerAudioRef = useRef<HTMLAudioElement | null>(null);

  const isPlaying = state.status === "playing";

  const timeLeft = useTimer(
    ROUND_TIME,
    isPlaying,
    () => dispatch({ type: "TIME_EXPIRE" }),
    state.currentRound
  );

  // Preload next watch image while user is guessing current
  useEffect(() => {
    const nextIndex = state.currentRound + 1;
    if (nextIndex < state.watches.length) {
      preloadImage(getWatchImagePath(state.watches[nextIndex].image_name));
    }
  }, [state.currentRound, state.watches]);

  // Audio feedback
  useEffect(() => {
    if (state.status === "result") {
      // Stop timer sound when showing result
      if (timerAudioRef.current) {
        timerAudioRef.current.pause();
        timerAudioRef.current = null;
      }

      const lastResult = state.results[state.results.length - 1];
      if (lastResult.brandCorrect) {
        playSound("correct");
      } else if (!lastResult.skipped && !lastResult.timeExpired) {
        playSound("incorrect");
      }
    } else if (state.status === "playing") {
      // Start timer sound when round starts
      if (timerAudioRef.current) {
        timerAudioRef.current.pause();
      }
      timerAudioRef.current = playSound("timer");
    }

    return () => {
      if (timerAudioRef.current) {
        timerAudioRef.current.pause();
      }
    };
  }, [state.status, state.results, state.currentRound]);

  const currentWatch = state.watches[state.currentRound];

  if (state.status === "finished") {
    return (
      <GameOver
        results={state.results}
        totalScore={state.score}
        totalRounds={state.totalRounds}
        allWatches={allWatches}
        userId={userId}
        userDisplayName={userDisplayName}
        userPhotoURL={userPhotoURL}
        gameMode={gameMode}
        isPremium={isPremium}
        canPlay={canPlay}
        onCollectWatch={onCollectWatch}
        onRestart={onRestart}
        onUpgrade={onUpgrade}
        activeChallenge={activeChallenge}
      />
    );
  }

  if (state.status === "result") {
    const lastResult = state.results[state.results.length - 1];
    return (
      <ComparisonCard
        result={lastResult}
        roundNumber={state.currentRound}
        totalRounds={state.totalRounds}
        totalScore={state.score}
        onNext={() => dispatch({ type: "NEXT_ROUND" })}
      />
    );
  }

  const timerColor =
    timeLeft > 6 ? "#B8962E" : timeLeft > 3 ? "#8A6A00" : "#9B2335";
  const timerPercent = (timeLeft / ROUND_TIME) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-[#B8962E]" />
          <AnimatePresence mode="wait">
            <motion.span
              key={state.score}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-mono font-bold text-[#1A1714] text-xl"
            >
              {state.score.toLocaleString()}
            </motion.span>
          </AnimatePresence>
          <span className="text-[#6B6259] text-sm font-sans font-semibold">pts</span>
        </div>

        {/* Round pips */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: state.totalRounds }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background:
                    i < state.currentRound
                      ? "#B8962E"
                      : i === state.currentRound
                        ? "rgba(184,150,46,0.5)"
                        : "#E0D9CC",
                  transform: i === state.currentRound ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <span className="text-[#3D3730] text-sm font-mono font-bold">
            {state.currentRound + 1}/{state.totalRounds}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-[#9C9189]" />
          <span
            className="font-mono font-bold text-xl transition-colors duration-300"
            style={{ color: timerColor }}
          >
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Power-reserve timer bar */}
      <div className="relative w-full h-px mb-3 overflow-hidden" style={{ background: "#EDE9E0" }}>
        <motion.div
          className="absolute left-0 top-0 h-full"
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.8, ease: "linear" }}
          style={{ background: `linear-gradient(to right, ${timerColor}60, ${timerColor})` }}
        />
      </div>

      {/* Watch image */}
      <div className="mb-3">
        {currentWatch && (
          <WatchViewer
            src={getWatchImagePath(currentWatch.image_name)}
            alt="Mystery watch"
            roundNumber={state.currentRound + 1}
            totalRounds={state.totalRounds}
          />
        )}
      </div>

      {/* Guess input */}
      <div className="mb-3">
        <GuessInput
          watches={allWatches}
          onSubmit={(brand, model) =>
            dispatch({ type: "SUBMIT_GUESS", brand, model })
          }
          disabled={!isPlaying}
        />
      </div>

      {/* Hints + Skip */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <HintSystem
            hints={state.hints}
            onReveal={(label) => dispatch({ type: "REVEAL_HINT", label })}
            disabled={!isPlaying}
          />
        </div>
        <button
          onClick={() => dispatch({ type: "SKIP" })}
          className="
            flex items-center gap-1.5 px-3 py-2 mt-5
            bg-white border border-[#E0D9CC]
            hover:border-[#9B2335]/40 hover:text-[#9B2335]
            text-[#9C9189] rounded-sm transition-all duration-150
            text-sm font-sans font-semibold tracking-widest uppercase shrink-0
          "
        >
          <SkipForward size={12} />
          Skip
        </button>
      </div>
    </div>
  );
}
