"use client";

import { useState, useEffect } from "react";
import { getUserSubscription, getGuestSubscription, UserSubscription } from "@/lib/subscription";
import { FREE_DAILY_LIMIT } from "@/lib/tiers";

const DEFAULT_SUB: UserSubscription = {
  isPremium: false,
  premiumSince: null,
  premiumUntil: null,
  gamesPlayedToday: 0,
  lastPlayedDate: "",
  dailyPlayedToday: false,
  watchBox: [],
};

export function usePremium(uid: string | null) {
  const [sub, setSub] = useState<UserSubscription>(DEFAULT_SUB);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setSub(getGuestSubscription());
      setLoading(false);
      return;
    }
    getUserSubscription(uid)
      .then(setSub)
      .catch(() => setSub(DEFAULT_SUB))
      .finally(() => setLoading(false));
  }, [uid]);

  const gamesRemaining = sub.isPremium
    ? Infinity
    : Math.max(0, FREE_DAILY_LIMIT - sub.gamesPlayedToday);

  const canPlay = sub.isPremium || gamesRemaining > 0;

  function refresh() {
    if (!uid) {
      setSub(getGuestSubscription());
      return;
    }
    getUserSubscription(uid).then(setSub).catch(() => { });
  }

  return {
    isPremium: sub.isPremium,
    premiumUntil: sub.premiumUntil,
    gamesRemaining,
    canPlay,
    dailyPlayedToday: sub.dailyPlayedToday,
    watchBox: sub.watchBox,
    loading,
    refresh,
  };
}
