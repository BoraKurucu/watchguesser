import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  perfect: number;
  isPremium?: boolean;
  submittedAt: string;
}

export interface HallOfFameEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  weeklyScore: number;   // sum of best daily scores this week
  daysPlayed: number;   // how many days they played this week
  bestDay: number;      // highest single-day score
  isPremium?: boolean;
}

export interface PremiumHallOfFameEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  totalScore: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // "2026-02-20"
}

/** Returns ISO date strings for Mon–today (or Mon–Sun) of the current week. */
function currentWeekDays(): string[] {
  const days: string[] = [];
  const now = new Date();
  // getDay(): 0=Sun, 1=Mon … 6=Sat
  const dayOfWeek = now.getDay();
  // Monday-based offset
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  for (let i = 0; i <= (dayOfWeek === 0 ? 6 : dayOfWeek - 1); i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export async function submitDailyScore(
  uid: string,
  displayName: string,
  photoURL: string | null,
  score: number,
  perfect: number,
  isPremium?: boolean
): Promise<void> {
  const day = todayKey();
  const ref = doc(db, "leaderboard", day, "scores", uid);
  await setDoc(ref, {
    uid,
    displayName: displayName || "Anonymous",
    photoURL: photoURL ?? null,
    score,
    perfect,
    isPremium: isPremium ?? false,
    submittedAt: serverTimestamp(),
  });
}

export async function getDailyLeaderboard(day?: string): Promise<LeaderboardEntry[]> {
  const d = day ?? todayKey();
  const ref = collection(db, "leaderboard", d, "scores");
  const q = query(ref, where("isPremium", "==", true), orderBy("score", "desc"), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL ?? null,
      score: data.score,
      perfect: data.perfect,
      isPremium: data.isPremium ?? false,
      submittedAt: data.submittedAt?.toDate?.()?.toISOString() ?? "",
    };
  });
}

/**
 * Fetches the current Mon–today daily score docs in parallel,
 * aggregates per-user totals, and returns the top-10 by weekly score.
 */
export async function getWeeklyHallOfFame(): Promise<HallOfFameEntry[]> {
  const days = currentWeekDays();

  // Fetch all days in parallel
  const daySnaps = await Promise.all(
    days.map((day) => {
      const ref = collection(db, "leaderboard", day, "scores");
      return getDocs(ref);
    })
  );

  // Aggregate by uid
  const map = new Map<string, HallOfFameEntry>();
  for (const snap of daySnaps) {
    for (const d of snap.docs) {
      const data = d.data();
      if (data.isPremium !== true) continue;
      const uid: string = data.uid;
      const score: number = data.score ?? 0;
      if (map.has(uid)) {
        const entry = map.get(uid)!;
        entry.weeklyScore += score;
        entry.daysPlayed += 1;
        entry.bestDay = Math.max(entry.bestDay, score);
      } else {
        map.set(uid, {
          uid,
          displayName: data.displayName ?? "Anonymous",
          photoURL: data.photoURL ?? null,
          weeklyScore: score,
          daysPlayed: 1,
          bestDay: score,
          isPremium: true,
        });
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.weeklyScore - a.weeklyScore)
    .slice(0, 10);
}

export async function getPremiumHallOfFame(): Promise<PremiumHallOfFameEntry[]> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("isPremium", "==", true), orderBy("totalScore", "desc"), limit(10));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: data.uid ?? d.id,
      displayName: data.displayName ?? "Anonymous",
      photoURL: data.photoURL ?? null,
      totalScore: data.totalScore ?? 0,
    };
  });
}
