import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type { User };

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

async function ensureUserDoc(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log(`Creating new user document for ${user.email} with UID ${user.uid}`);

    // Check if email already exists with another UID (prevents duplicate user docs)
    if (user.email) {
      const { where, getDocs, collection, query } = await import("firebase/firestore");
      const emailQuery = query(collection(db, "users"), where("email", "==", user.email));
      const existingDocs = await getDocs(emailQuery);

      if (!existingDocs.empty) {
        // Email already exists with different UID - don't create duplicate
        const existingUid = existingDocs.docs[0].id;
        console.warn(
          `Email ${user.email} already exists with UID ${existingUid}, skipping creation for UID ${user.uid}`
        );
        return;
      }
    }

    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
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
      termsAcceptedAt: serverTimestamp(),
      privacyAcceptedAt: serverTimestamp(),
    });
    console.log(`Successfully created user document for ${user.email}`);
  } else {
    console.log(`User document already exists for ${user.email} with UID ${user.uid}`);
  }
}

export interface GameRecord {
  score: number;
  rounds: number;
  perfect: number;
  accuracy: number;
  mode: string;
  playedAt: string;
}

export async function saveGameResult(
  uid: string,
  score: number,
  rounds: number,
  perfect: number,
  mode = "world_tour",
  customId?: string
) {
  const accuracy = Math.round((score / (rounds * 1000)) * 100);

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const current = snap.data();
  if (!snap.exists()) {
    await setDoc(
      userRef,
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
  const lastPlayedDate = current?.lastPlayedDate;

  let newCurrentStreak = current?.currentStreak || 0;
  if (!lastPlayedDate) {
    newCurrentStreak = 1;
  } else if (lastPlayedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (lastPlayedDate === yesterdayStr) {
      newCurrentStreak += 1;
    } else {
      newCurrentStreak = 1;
    }
  } else {
    // Played today already, just keep the streak at least 1
    newCurrentStreak = Math.max(1, newCurrentStreak);
  }

  const updates: Record<string, unknown> = {
    gamesPlayed: (current?.gamesPlayed ?? 0) + 1,
    lastPlayedAt: serverTimestamp(),
    lastPlayedDate: today,
    currentStreak: newCurrentStreak,
    longestStreak: Math.max(newCurrentStreak, current?.longestStreak || 0),
    totalScore: (current?.totalScore || 0) + score,
  };

  if (score > (current?.highScore ?? 0)) {
    updates.highScore = score;
  }
  await updateDoc(userRef, updates);

  // Use customId if provided (idempotency), otherwise use timestamp
  const docId = customId || Date.now().toString();
  const gameRef = doc(db, "users", uid, "games", docId);
  await setDoc(gameRef, {
    score,
    rounds,
    perfect,
    accuracy,
    mode,
    playedAt: serverTimestamp(),
  });
}

export async function getGameHistory(uid: string, limitCount = 20): Promise<GameRecord[]> {
  const { collection, query, orderBy, limit, getDocs } = await import("firebase/firestore");
  const ref = collection(db, "users", uid, "games");
  const q = query(ref, orderBy("playedAt", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      score: data.score ?? 0,
      rounds: data.rounds ?? 5,
      perfect: data.perfect ?? 0,
      accuracy: data.accuracy ?? 0,
      mode: data.mode ?? "world_tour",
      playedAt: data.playedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  });
}

export async function getUserHighScore(uid: string): Promise<number> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.data()?.highScore ?? 0;
}

export interface Challenge {
  id: string;
  watchIds: string[];
  creatorId: string;
  creatorName: string;
  creatorScore: number;
  createdAt: any;
}

export async function createChallenge(
  creatorId: string,
  creatorName: string,
  creatorScore: number,
  watchIds: string[]
): Promise<string> {
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  const challengeRef = collection(db, "challenges");
  const docRef = await addDoc(challengeRef, {
    creatorId,
    creatorName: creatorName || "A Friend",
    creatorScore,
    watchIds,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const challengeRef = doc(db, "challenges", challengeId);
  const snap = await getDoc(challengeRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    watchIds: data.watchIds,
    creatorId: data.creatorId,
    creatorName: data.creatorName,
    creatorScore: data.creatorScore,
    createdAt: data.createdAt,
  };
}
