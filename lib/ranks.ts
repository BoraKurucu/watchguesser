export interface Rank {
    id: string;
    name: string;
    minScore: number;
}

export const RANKS: Rank[] = [
    { id: "novice", name: "Novice", minScore: 0 },
    { id: "apprentice", name: "Apprentice", minScore: 5000 },
    { id: "enthusiast", name: "Enthusiast", minScore: 15000 },
    { id: "collector", name: "Collector", minScore: 35000 },
    { id: "connoisseur", name: "Connoisseur", minScore: 70000 },
    { id: "expert", name: "Expert", minScore: 120000 },
    { id: "master", name: "Master Horologist", minScore: 250000 },
];

export function getUserRank(totalScore: number): Rank {
    // Return the highest rank whose minScore is <= totalScore
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (totalScore >= RANKS[i].minScore) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

export function getNextRankProgress(totalScore: number): { current: Rank; next: Rank | null; progress: number; pointsNeeded: number } {
    const current = getUserRank(totalScore);
    const currentIndex = RANKS.findIndex(r => r.id === current.id);

    if (currentIndex === RANKS.length - 1) {
        // Max rank achieved
        return { current, next: null, progress: 100, pointsNeeded: 0 };
    }

    const next = RANKS[currentIndex + 1];
    const pointsInCurrentTier = totalScore - current.minScore;
    const tierSize = next.minScore - current.minScore;
    const progress = Math.min(100, Math.max(0, (pointsInCurrentTier / tierSize) * 100));
    const pointsNeeded = next.minScore - totalScore;

    return { current, next, progress, pointsNeeded };
}
