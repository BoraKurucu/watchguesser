/**
 * GameManager — Session Integrity Engine
 *
 * Implements:
 *  1. Fisher-Yates shuffle on an index array (not the 15k data array)
 *  2. Brand-cap: no same brand in the last 2 picks
 *  3. Seeded RNG for Daily Challenge (same sequence for every player on a given date)
 *  4. localStorage session memory — never repeat a watch until all are seen
 *  5. Eager image preloading for the selected round watches
 *  6. Weighted sampling: 70% famous brands / 30% niche
 */

import { Watch } from "./types";
import { getWatchImagePath, preloadImage } from "./assets";
import { GameMode, GAME_MODES } from "./tiers";

// ─── Brand Weight Tiers ───────────────────────────────────────────────────────

const FAMOUS_BRANDS = new Set([
  "Rolex", "Omega", "Seiko", "TAG Heuer", "Breitling", "Tissot",
  "Longines", "Citizen", "Casio", "Cartier", "IWC", "Panerai",
  "Tudor", "Grand Seiko", "Hamilton", "Swatch", "Fossil",
  "Audemars Piguet", "Patek Philippe", "Hublot",
]);

const FAMOUS_WEIGHT = 0.70; // 70% of picks come from famous brands

// ─── Seeded RNG (Mulberry32) ──────────────────────────────────────────────────
// Deterministic, fast, good distribution. Used for Daily Challenge.

function mulberry32(seed: number) {
  return function (): number {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d; // e.g. 20260220
}

// ─── Fisher-Yates on index array ─────────────────────────────────────────────

function shuffleIndices(length: number, rng: () => number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// ─── localStorage Session Memory ─────────────────────────────────────────────

const LS_KEY = "wg_played_ids";

function getPlayedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function markPlayed(ids: number[]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getPlayedIds();
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(LS_KEY, JSON.stringify([...existing]));
  } catch {}
}

function clearPlayedIds(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(LS_KEY); } catch {}
}

// ─── Brand-Cap Logic ──────────────────────────────────────────────────────────
// Reject a candidate if its brand matches either of the last 2 picks.

function brandAllowed(candidate: Watch, recentPicks: Watch[]): boolean {
  const last2 = recentPicks.slice(-2);
  return !last2.some((w) => w.brand === candidate.brand);
}

// ─── Weighted Pool Split ──────────────────────────────────────────────────────

function splitByWeight(watches: Watch[]): { famous: Watch[]; niche: Watch[] } {
  const famous: Watch[] = [];
  const niche: Watch[] = [];
  for (const w of watches) {
    (FAMOUS_BRANDS.has(w.brand) ? famous : niche).push(w);
  }
  return { famous, niche };
}

// ─── Core Pick Function ───────────────────────────────────────────────────────

function pickWithBrandCap(
  pool: Watch[],
  shuffledIndices: number[],
  cursor: number,
  recentPicks: Watch[],
  rng: () => number,
  useWeighting: boolean
): { watch: Watch; nextCursor: number } | null {
  // Try up to pool.length candidates from the shuffled list
  const maxAttempts = Math.min(pool.length, 50);

  if (useWeighting) {
    // Weighted: decide famous vs niche for this pick
    const { famous, niche } = splitByWeight(pool);
    const useFamous = famous.length > 0 && (niche.length === 0 || rng() < FAMOUS_WEIGHT);
    const targetPool = useFamous && famous.length > 0 ? famous : niche.length > 0 ? niche : pool;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const idx = Math.floor(rng() * targetPool.length);
      const candidate = targetPool[idx];
      if (brandAllowed(candidate, recentPicks)) return { watch: candidate, nextCursor: cursor };
    }
    // Fallback: any from pool
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = pool[Math.floor(rng() * pool.length)];
      if (brandAllowed(candidate, recentPicks)) return { watch: candidate, nextCursor: cursor };
    }
    return pool.length > 0 ? { watch: pool[0], nextCursor: cursor } : null;
  }

  // Non-weighted: walk the shuffled index list
  let cur = cursor;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (cur >= shuffledIndices.length) cur = 0;
    const candidate = pool[shuffledIndices[cur % pool.length]];
    cur++;
    if (candidate && brandAllowed(candidate, recentPicks)) {
      return { watch: candidate, nextCursor: cur };
    }
  }
  // Fallback: just take next
  const fallback = pool[shuffledIndices[cursor % pool.length]];
  return fallback ? { watch: fallback, nextCursor: cursor + 1 } : null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GameManagerOptions {
  watches: Watch[];       // Already filtered for the game mode
  count: number;          // How many to pick (rounds)
  mode: GameMode;
  daily?: boolean;        // Use seeded RNG (Daily Challenge)
  useWeighting?: boolean; // Weighted brand sampling
}

export interface GameManagerResult {
  picks: Watch[];
  isDaily: boolean;
  seed?: number;
}

export function buildSession(options: GameManagerOptions): GameManagerResult {
  const { watches, count, mode, daily = false, useWeighting = true } = options;

  if (watches.length === 0) return { picks: [], isDaily: daily };

  // ── RNG setup ──────────────────────────────────────────────────────────────
  const seed = daily ? dateToSeed(new Date()) : undefined;
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;

  // ── Session memory: filter out already-seen watches ────────────────────────
  const playedIds = daily ? new Set<number>() : getPlayedIds(); // daily always fresh
  let available = watches.filter((w) => !playedIds.has(w.id));

  // If pool is exhausted, reset and use full list
  if (available.length < count) {
    if (!daily) clearPlayedIds();
    available = [...watches];
  }

  // ── Shuffle indices (not the data array) ───────────────────────────────────
  const shuffled = shuffleIndices(available.length, rng);
  let cursor = 0;

  // ── Pick `count` watches with brand-cap ────────────────────────────────────
  const picks: Watch[] = [];

  // Daily Challenge: disable weighting for pure fairness
  const applyWeighting = useWeighting && !daily;

  for (let i = 0; i < count; i++) {
    const result = pickWithBrandCap(available, shuffled, cursor, picks, rng, applyWeighting);
    if (!result) break;
    picks.push(result.watch);
    cursor = result.nextCursor;
  }

  // ── Mark played (non-daily only) ───────────────────────────────────────────
  if (!daily) {
    markPlayed(picks.map((w) => w.id));
  }

  return { picks, isDaily: daily, seed };
}

// ─── Eager Image Preloader ────────────────────────────────────────────────────
// Call this as soon as picks are known (e.g. on StartScreen mount).

export function preloadSessionImages(watches: Watch[]): void {
  watches.forEach((w) => preloadImage(getWatchImagePath(w.image_name)));
}

// ─── Daily Challenge Helpers ──────────────────────────────────────────────────

export function getDailyDateLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export function isDailyMode(mode: GameMode): boolean {
  return mode === GAME_MODES.DAILY_CHALLENGE;
}
