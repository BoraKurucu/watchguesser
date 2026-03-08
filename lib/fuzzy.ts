import Fuse from "fuse.js";
import { Watch } from "./types";

export interface SearchResult {
  brand: string;
  name: string;
  display: string;
}

let fuseInstance: Fuse<SearchResult> | null = null;
let indexedWatches: SearchResult[] = [];

export function buildSearchIndex(watches: Watch[]): void {
  const seen = new Set<string>();
  indexedWatches = watches
    .map((w) => ({
      brand: w.brand,
      name: w.name,
      display: `${w.brand} – ${w.name}`,
    }))
    .filter((s) => {
      const key = s.display.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  fuseInstance = new Fuse(indexedWatches, {
    keys: [
      { name: "brand", weight: 0.4 },
      { name: "name", weight: 0.4 },
      { name: "display", weight: 0.2 },
    ],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 1,
    shouldSort: true,
  });
}

export function search(query: string, limit = 12): SearchResult[] {
  if (!fuseInstance || !query.trim()) return [];
  return fuseInstance.search(query).slice(0, limit).map((r) => r.item);
}
