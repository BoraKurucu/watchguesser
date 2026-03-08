export interface Watch {
  id: number;
  brand: string;
  name: string;
  price: string;
  image_name: string;
  reference?: string;
  caliber?: string;
  case_material?: string;
  water_resistance?: string;
  year_introduced?: string;
}

export type GameStatus = "idle" | "playing" | "result" | "finished";

export interface HintItem {
  label: string;
  value: string;
  cost: number;
  revealed: boolean;
}

export interface RoundResult {
  watch: Watch;
  userBrand: string;
  userModel: string;
  brandCorrect: boolean;
  modelCorrect: boolean;
  pointsEarned: number;
  hintCost: number;
  skipped: boolean;
  timeExpired: boolean;
}

export interface GameState {
  status: GameStatus;
  watches: Watch[];
  currentRound: number;
  totalRounds: number;
  score: number;
  results: RoundResult[];
  hints: HintItem[];
}

export type GameAction =
  | { type: "START_ROUND" }
  | { type: "SUBMIT_GUESS"; brand: string; model: string }
  | { type: "SKIP" }
  | { type: "TIME_EXPIRE" }
  | { type: "REVEAL_HINT"; label: string }
  | { type: "NEXT_ROUND" }
  | { type: "RESTART"; watches: Watch[] };
