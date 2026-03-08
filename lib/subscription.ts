import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { Watch } from "./types";
import { FREE_DAILY_LIMIT } from "./tiers";

export interface UserSubscription {
  isPremium: boolean;
  premiumSince: string | null;
  premiumUntil: string | null;
  gamesPlayedToday: number;
  lastPlayedDate: string;
  dailyPlayedToday: boolean;
  watchBox: CollectedWatch[];
}

export interface CollectedWatch {
  id: number;
  brand: string;
  name: string;
  price: string;
  image_name: string;
  collectedAt: string;
}

export async function getUserSubscription(uid: string): Promise<UserSubscription> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data() ?? {};
  const today = new Date().toISOString().slice(0, 10);

  const premiumUntil = data.premiumUntil ?? null;
  const isPremiumActive =
    (data.isPremium ?? false) &&
    (premiumUntil === null || new Date(premiumUntil) > new Date());

  return {
    isPremium: isPremiumActive,
    premiumSince: data.premiumSince ?? null,
    premiumUntil,
    gamesPlayedToday:
      data.lastPlayedDate === today ? (data.gamesPlayedToday ?? 0) : 0,
    lastPlayedDate: data.lastPlayedDate ?? today,
    dailyPlayedToday: data.lastDailyPlayedDate === today,
    watchBox: data.watchBox ?? [],
  };
}

export async function incrementGamesPlayed(uid: string): Promise<number> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        uid,
        highScore: 0,
        gamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalScore: 0,
        gamesPlayedToday: 0,
        lastPlayedDate: null,
        watchBox: [],
        isPremium: false,
        premiumSince: null,
        premiumUntil: null,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  const data = snap.data() ?? {};
  const today = new Date().toISOString().slice(0, 10);
  const isNewDay = data.lastPlayedDate !== today;
  const newCount = isNewDay ? 1 : (data.gamesPlayedToday ?? 0) + 1;

  await updateDoc(ref, {
    gamesPlayedToday: newCount,
    lastPlayedDate: today,
  });
  return newCount;
}

export async function markDailyPlayed(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        uid,
        highScore: 0,
        gamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalScore: 0,
        gamesPlayedToday: 0,
        lastPlayedDate: null,
        watchBox: [],
        isPremium: false,
        premiumSince: null,
        premiumUntil: null,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  const today = new Date().toISOString().slice(0, 10);
  await updateDoc(ref, {
    lastDailyPlayedDate: today,
  });
}

export async function canPlayToday(uid: string, isPremium: boolean): Promise<boolean> {
  if (isPremium) return true;
  const sub = await getUserSubscription(uid);
  return sub.gamesPlayedToday < FREE_DAILY_LIMIT;
}

export async function collectWatch(uid: string, watch: Watch): Promise<void> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        uid,
        highScore: 0,
        gamesPlayed: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalScore: 0,
        gamesPlayedToday: 0,
        lastPlayedDate: null,
        watchBox: [],
        isPremium: false,
        premiumSince: null,
        premiumUntil: null,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
  const collected: CollectedWatch = {
    id: watch.id,
    brand: watch.brand,
    name: watch.name,
    price: watch.price,
    image_name: watch.image_name,
    collectedAt: new Date().toISOString(),
  };
  await updateDoc(ref, {
    watchBox: arrayUnion(collected),
  });
}

export async function grantPremium(uid: string, durationDays = 30): Promise<void> {
  const until = new Date();
  until.setDate(until.getDate() + durationDays);
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      isPremium: true,
      premiumSince: new Date().toISOString(),
      premiumUntil: until.toISOString(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Guest functionality using localStorage
const GUEST_STORAGE_KEY = "watchguesser_guest_stats";

export function getGuestSubscription(): UserSubscription {
  if (typeof window === "undefined") return { ...DEFAULT_SUB };

  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);

  if (!stored) {
    return { ...DEFAULT_SUB, lastPlayedDate: today };
  }

  try {
    const data = JSON.parse(stored);
    return {
      isPremium: false,
      premiumSince: null,
      premiumUntil: null,
      gamesPlayedToday: data.lastPlayedDate === today ? (data.gamesPlayedToday ?? 0) : 0,
      lastPlayedDate: data.lastPlayedDate ?? today,
      dailyPlayedToday: data.lastDailyPlayedDate === today,
      watchBox: [],
    };
  } catch {
    return { ...DEFAULT_SUB, lastPlayedDate: today };
  }
}

export function incrementGuestGamesPlayed(): number {
  if (typeof window === "undefined") return 0;

  const sub = getGuestSubscription();
  const today = new Date().toISOString().slice(0, 10);
  const newCount = sub.gamesPlayedToday + 1;

  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
    ...JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || "{}"),
    gamesPlayedToday: newCount,
    lastPlayedDate: today
  }));

  return newCount;
}

export function markGuestDailyPlayed(): void {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  const data = stored ? JSON.parse(stored) : {};

  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
    ...data,
    lastDailyPlayedDate: today
  }));
}

const DEFAULT_SUB: UserSubscription = {
  isPremium: false,
  premiumSince: null,
  premiumUntil: null,
  gamesPlayedToday: 0,
  lastPlayedDate: "",
  dailyPlayedToday: false,
  watchBox: [],
};
