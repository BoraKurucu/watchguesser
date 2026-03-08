"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { loadWatches } from "@/lib/csvParser";
import { buildSession, preloadSessionImages } from "@/lib/gameManager";
import { Watch } from "@/lib/types";
import { signOutUser, getUserHighScore, getChallenge, Challenge } from "@/lib/auth";
import { incrementGamesPlayed, incrementGuestGamesPlayed, collectWatch } from "@/lib/subscription";
import { assignTier, GameMode, GAME_MODES } from "@/lib/tiers";
import { useAuth } from "@/context/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import LoginScreen from "@/components/game/LoginScreen";
import StartScreen from "@/components/game/StartScreen";
import GameBoard from "@/components/game/GameBoard";
import SubscriptionModal from "@/components/game/SubscriptionModal";
import WatchBox from "@/components/game/WatchBox";
import LeaderboardModal from "@/components/game/LeaderboardModal";
import HistoryModal from "@/components/game/HistoryModal";
import HallOfFameModal from "@/components/game/HallOfFameModal";
import PremiumHallOfFameModal from "@/components/game/PremiumHallOfFameModal";

type AppPhase = "auth" | "loading" | "start" | "playing";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, premiumUntil, gamesRemaining, canPlay, dailyPlayedToday, watchBox, loading: premiumLoading, refresh: refreshPremium } =
    usePremium(user?.uid ?? null);

  const [appPhase, setAppPhase] = useState<AppPhase>("loading");
  const [allWatches, setAllWatches] = useState<Watch[]>([]);
  const [totalRounds, setTotalRounds] = useState(8);
  const [gameMode, setGameMode] = useState<GameMode>(GAME_MODES.WORLD_TOUR);
  const [gameKey, setGameKey] = useState(0);
  const isGuest = !user;
  const [dataError, setDataError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showWatchBox, setShowWatchBox] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [showPremiumHallOfFame, setShowPremiumHallOfFame] = useState(false);
  const [userHighScore, setUserHighScore] = useState(0);
  const [userGamesPlayed, setUserGamesPlayed] = useState(0);
  const [userTotalScore, setUserTotalScore] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

  // Fetch user stats when user logs in
  useEffect(() => {
    if (!user) {
      setUserHighScore(0);
      setUserGamesPlayed(0);
      setUserTotalScore(0);
      setUserStreak(0);
      return;
    }
    getUserHighScore(user.uid).then(setUserHighScore).catch(() => { });
    import("firebase/firestore").then(({ doc, getDoc }) => {
      import("@/lib/firebase").then(({ db }) => {
        getDoc(doc(db, "users", user.uid)).then((snap) => {
          const data = snap.data();
          setUserGamesPlayed(data?.gamesPlayed ?? 0);
          setUserTotalScore(data?.totalScore ?? 0);

          // Check if streak is still active today or yesterday
          const lastPlayed = data?.lastPlayedDate;
          const today = new Date().toISOString().slice(0, 10);
          let streak = data?.currentStreak ?? 0;

          if (lastPlayed && lastPlayed !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastPlayed !== yesterday.toISOString().slice(0, 10)) {
              streak = 0; // Streak broken
            }
          }
          setUserStreak(streak);
        }).catch(() => { });
      });
    });
  }, [user]);

  // Watches filtered by tier for current mode
  const filteredWatches = useMemo(() => {
    if (!allWatches.length) return [];
    if (gameMode === GAME_MODES.WORLD_TOUR) {
      return allWatches;
    }
    // Daily Challenge uses all watches (seeded RNG handles variety)
    if (gameMode === GAME_MODES.DAILY_CHALLENGE) return allWatches;
    // Other premium modes use all watches
    return allWatches;
  }, [allWatches, gameMode]);

  // Load watches immediately
  useEffect(() => {
    if (authLoading || premiumLoading) return;

    if (allWatches.length === 0) {
      setAppPhase("loading");
      loadWatches()
        .then((watches) => {
          setAllWatches(watches);
          setAppPhase("start");
        })
        .catch((err) => {
          console.error(err);
          setDataError("Failed to load watch data. Please refresh.");
        });
    } else {
      setAppPhase("start");
    }
  }, [authLoading, premiumLoading, allWatches.length]);

  // Challenge Loading
  useEffect(() => {
    if (typeof window === "undefined" || allWatches.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get("challenge");

    if (challengeId && !activeChallenge) {
      setChallengeLoading(true);
      getChallenge(challengeId).then((challenge) => {
        if (challenge) {
          setActiveChallenge(challenge);
          // Auto-start or just show in StartScreen? 
          // Let's just show in StartScreen for now, it's safer.
          // But we need to make sure the watch pool is restricted.
        } else {
          console.warn("Challenge not found");
        }
      }).finally(() => setChallengeLoading(false));
    }
  }, [allWatches.length, activeChallenge]);

  // Guest mode and upgrade events
  useEffect(() => {
    function handleUpgrade() { setShowUpgrade(true); }

    document.addEventListener("watchguesser:upgrade", handleUpgrade);
    return () => {
      document.removeEventListener("watchguesser:upgrade", handleUpgrade);
    };
  }, []);

  async function handleStart(rounds: number, mode: GameMode) {
    if (!canPlay) { setShowUpgrade(true); return; }
    if (mode === GAME_MODES.DAILY_CHALLENGE && dailyPlayedToday) return;

    setTotalRounds(rounds);
    setGameMode(mode);
    setGameKey((k) => k + 1);

    const { markDailyPlayed, markGuestDailyPlayed } = await import("@/lib/subscription");

    if (user) {
      incrementGamesPlayed(user.uid).then(refreshPremium).catch(() => { });
      if (mode === GAME_MODES.DAILY_CHALLENGE) {
        await markDailyPlayed(user.uid);
      }
      setUserGamesPlayed((n) => n + 1);
    } else if (isGuest) {
      incrementGuestGamesPlayed();
      if (mode === GAME_MODES.DAILY_CHALLENGE) {
        markGuestDailyPlayed();
      }
      refreshPremium();
    }
    setAppPhase("playing");
  }

  const handleRestart = useCallback(() => {
    if (!canPlay) { setShowUpgrade(true); return; }
    setGameKey((k) => k + 1);
    if (user) {
      incrementGamesPlayed(user.uid).then(refreshPremium).catch(() => { });
      setUserGamesPlayed((n) => n + 1);
    } else if (isGuest) {
      incrementGuestGamesPlayed();
      refreshPremium();
    }
    setAppPhase("playing");
  }, [canPlay, user, isGuest, refreshPremium]);

  async function handleCollectWatch(watch: Watch) {
    if (!user || !isPremium) return;
    try { await collectWatch(user.uid, watch); refreshPremium(); } catch { }
  }

  async function handleSignOut() {
    await signOutUser();
    setAllWatches([]);
    setAppPhase("loading");
  }

  // MUST be before any conditional return — Rules of Hooks
  const roundWatches = useMemo(() => {
    if (activeChallenge && allWatches.length) {
      // Find the specific watches for the challenge
      const picks = activeChallenge.watchIds
        .map(id => allWatches.find(w => w.id.toString() === id))
        .filter((w): w is Watch => !!w);

      if (picks.length > 0) {
        preloadSessionImages(picks);
        return picks;
      }
    }

    const pool = filteredWatches.length ? filteredWatches : allWatches;
    if (!pool.length) return [];
    const isDaily = gameMode === "daily_challenge";
    const { picks } = buildSession({
      watches: pool,
      count: totalRounds,
      mode: gameMode,
      daily: isDaily,
      useWeighting: true,
    });
    preloadSessionImages(picks);
    return picks;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, filteredWatches, allWatches, totalRounds, gameMode]);

  if (dataError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <p className="text-[#9B2335] text-center px-4 font-sans text-sm">{dataError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8" }}>
      {/* Header */}
      <header className="px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #E0D9CC", background: "#FFFFFF" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (appPhase !== "auth") {
                setAppPhase("start");
                setGameKey(prev => prev + 1); // Reset game state
              }
            }}
            className="flex items-center hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
          >
            <span className="font-serif text-xl font-bold text-[#1A1714]">Watch</span>
            <span className="font-serif text-xl italic font-bold text-[#B8962E]">Guesser</span>
          </button>

          <div className="flex items-center gap-4">
            {appPhase === "playing" && (
              <button
                onClick={() => setAppPhase("start")}
                className="text-[#3D3730] hover:text-[#1A1714] text-sm font-sans font-bold tracking-widest uppercase transition-colors"
              >
                ← Menu
              </button>
            )}
            {(user || isGuest) && appPhase !== "auth" && (
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    {user.photoURL ? (
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#E0D9CC]">
                        <Image src={user.photoURL} alt={user.displayName ?? "User"} fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#F5EDD0] border border-[#E0D9CC] flex items-center justify-center">
                        <span className="text-[#B8962E] text-xs font-sans font-bold">
                          {(user.displayName ?? "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (!isPremium) {
                          setShowUpgrade(true);
                          return;
                        }
                        setShowHistory(true);
                      }}
                      className="text-[#6B6259] hover:text-[#B8962E] text-xs font-sans font-semibold tracking-widest uppercase transition-colors"
                    >
                      History
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="text-[#6B6259] hover:text-[#1A1714] text-xs font-sans font-semibold tracking-widest uppercase transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <span className="text-[#6B6259] text-xs font-sans font-bold tracking-widest uppercase">Guest</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center py-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {authLoading && (
            <motion.div key="auth-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="w-10 h-10 rounded-full animate-spin mx-auto" style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }} />
            </motion.div>
          )}

          {!authLoading && appPhase === "auth" && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <LoginScreen />
            </motion.div>
          )}

          {!authLoading && appPhase === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <div className="w-10 h-10 rounded-full animate-spin mx-auto mb-4" style={{ border: "2px solid #E0D9CC", borderTopColor: "#B8962E" }} />
              <p className="text-[#9C9189] text-xs font-sans tracking-widest uppercase">Loading collection…</p>
            </motion.div>
          )}

          {!authLoading && appPhase === "start" && (
            <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <StartScreen
                totalWatches={allWatches.length}
                isPremium={isPremium}
                isGuest={isGuest}
                premiumUntil={premiumUntil}
                gamesRemaining={gamesRemaining}
                dailyPlayedToday={dailyPlayedToday}
                watchBoxCount={watchBox.length}
                userTotalScore={userTotalScore}
                userStreak={userStreak}
                onStart={handleStart}
                onUpgrade={() => setShowUpgrade(true)}
                onOpenWatchBox={() => {
                  if (!isPremium) {
                    setShowUpgrade(true);
                    return;
                  }
                  setShowWatchBox(true);
                }}
                onOpenLeaderboard={() => setShowLeaderboard(true)}
                onOpenHallOfFame={() => setShowHallOfFame(true)}
                onOpenPremiumHallOfFame={() => setShowPremiumHallOfFame(true)}
                activeChallenge={activeChallenge}
                onClearChallenge={() => setActiveChallenge(null)}
              />
            </motion.div>
          )}

          {!authLoading && appPhase === "playing" && (
            <motion.div key={`game-${gameKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <GameBoard
                key={gameKey}
                watches={roundWatches}
                totalRounds={totalRounds}
                allWatches={allWatches}
                userId={user?.uid ?? null}
                userDisplayName={user?.displayName ?? null}
                userPhotoURL={user?.photoURL ?? null}
                gameMode={gameMode}
                isPremium={isPremium}
                canPlay={canPlay}
                onCollectWatch={handleCollectWatch}
                onRestart={handleRestart}
                onUpgrade={() => setShowUpgrade(true)}
                activeChallenge={activeChallenge}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-6 text-center shrink-0" style={{ borderTop: "1px solid #E0D9CC", background: "#FFFFFF" }}>
        <p className="text-[#9C9189] text-xs font-mono font-semibold tracking-widest mb-3">
          WATCHGUESSER
        </p>
        <div className="flex items-center justify-center gap-6">
          <Link href="/terms" className="text-[#9C9189] hover:text-[#B8962E] text-[10px] font-sans font-bold tracking-widest uppercase transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-[#9C9189] hover:text-[#B8962E] text-[10px] font-sans font-bold tracking-widest uppercase transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>

      {/* Modals */}
      <SubscriptionModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => setShowUpgrade(false)}
        gamesRemaining={gamesRemaining}
        userEmail={user?.email ?? null}
      />
      <WatchBox
        open={showWatchBox}
        onClose={() => setShowWatchBox(false)}
        watches={watchBox}
        isPremium={isPremium}
        onUpgrade={() => { setShowWatchBox(false); setShowUpgrade(true); }}
      />
      {showLeaderboard && (
        <LeaderboardModal
          open={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentUid={user?.uid ?? null}
          isPremium={isPremium}
          onUpgrade={() => setShowUpgrade(true)}
        />
      )}
      {user && (
        <HistoryModal
          open={showHistory}
          onClose={() => setShowHistory(false)}
          uid={user.uid}
          displayName={user.displayName}
          highScore={userHighScore}
          gamesPlayed={userGamesPlayed}
        />
      )}
      <HallOfFameModal
        open={showHallOfFame}
        onClose={() => setShowHallOfFame(false)}
        currentUid={user?.uid ?? null}
        isPremium={isPremium}
        onUpgrade={() => setShowUpgrade(true)}
      />
      <PremiumHallOfFameModal
        open={showPremiumHallOfFame}
        onClose={() => setShowPremiumHallOfFame(false)}
        currentUid={user?.uid ?? null}
      />
    </div>
  );
}
