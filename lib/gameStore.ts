import { Watch } from "./csvParser";

export type GamePhase = "idle" | "playing" | "round_result" | "game_over";

export interface HintReveal {
  label: string;
  value: string;
  cost: number;
}

export interface RoundResult {
  watch: Watch;
  userBrand: string;
  userModel: string;
  brandCorrect: boolean;
  modelCorrect: boolean;
  pointsEarned: number;
  hintsUsed: HintReveal[];
  hintCost: number;
  skipped: boolean;
}

export interface GameState {
  phase: GamePhase;
  watches: Watch[];
  currentRoundIndex: number;
  totalRounds: number;
  score: number;
  results: RoundResult[];
  revealedHints: HintReveal[];
}

export const SCORES = {
  BRAND_AND_MODEL: 1000,
  BRAND_ONLY: 300,
  HINT_COST: 100,
} as const;

export function getAvailableHints(watch: Watch): HintReveal[] {
  return [
    { label: "Price Range", value: watch.price, cost: SCORES.HINT_COST },
    {
      label: "Brand Initial",
      value: `Starts with "${watch.brand[0].toUpperCase()}"`,
      cost: SCORES.HINT_COST,
    },
    {
      label: "Name Length",
      value: `${watch.name.split(" ").length} words`,
      cost: SCORES.HINT_COST,
    },
  ];
}

export function calculateScore(
  watch: Watch,
  userBrand: string,
  userModel: string,
  hintsUsed: HintReveal[]
): { brandCorrect: boolean; modelCorrect: boolean; pointsEarned: number; hintCost: number } {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  const brandCorrect =
    normalize(userBrand).includes(normalize(watch.brand)) ||
    normalize(watch.brand).includes(normalize(userBrand));

  const modelCorrect =
    normalize(userModel).includes(normalize(watch.name)) ||
    normalize(watch.name).includes(normalize(userModel));

  let pointsEarned = 0;
  if (brandCorrect && modelCorrect) {
    pointsEarned = SCORES.BRAND_AND_MODEL;
  } else if (brandCorrect) {
    pointsEarned = SCORES.BRAND_ONLY;
  }

  const hintCost = hintsUsed.reduce((sum, h) => sum + h.cost, 0);
  const net = Math.max(0, pointsEarned - hintCost);

  return { brandCorrect, modelCorrect, pointsEarned: net, hintCost };
}
