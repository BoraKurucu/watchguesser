import { GameState, GameAction, Watch } from "./types";
import { scoreGuess, buildHints } from "./scoring";

export function createInitialState(watches: Watch[], totalRounds: number): GameState {
  // watches are already picked & ordered by GameManager — do NOT re-shuffle
  return {
    status: "playing",
    watches,
    currentRound: 0,
    totalRounds,
    score: 0,
    results: [],
    hints: buildHints(watches[0]),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "REVEAL_HINT": {
      return {
        ...state,
        hints: state.hints.map((h) =>
          h.label === action.label ? { ...h, revealed: true } : h
        ),
      };
    }

    case "SUBMIT_GUESS": {
      if (state.status !== "playing") return state;
      const watch = state.watches[state.currentRound];
      const { brandCorrect, modelCorrect, pointsEarned, hintCost } = scoreGuess(
        watch,
        action.brand,
        action.model,
        state.hints
      );
      const result = {
        watch,
        userBrand: action.brand,
        userModel: action.model,
        brandCorrect,
        modelCorrect,
        pointsEarned,
        hintCost,
        skipped: false,
        timeExpired: false,
      };
      return {
        ...state,
        status: "result",
        score: Math.max(0, state.score + pointsEarned),
        results: [...state.results, result],
      };
    }

    case "SKIP":
    case "TIME_EXPIRE": {
      if (state.status !== "playing") return state;
      const watch = state.watches[state.currentRound];
      const result = {
        watch,
        userBrand: "",
        userModel: "",
        brandCorrect: false,
        modelCorrect: false,
        pointsEarned: 0,
        hintCost: 0,
        skipped: action.type === "SKIP",
        timeExpired: action.type === "TIME_EXPIRE",
      };
      return {
        ...state,
        status: "result",
        results: [...state.results, result],
      };
    }

    case "NEXT_ROUND": {
      if (state.status !== "result") return state;
      const nextRound = state.currentRound + 1;
      if (nextRound >= state.totalRounds) {
        return { ...state, status: "finished", currentRound: nextRound };
      }
      return {
        ...state,
        status: "playing",
        currentRound: nextRound,
        hints: buildHints(state.watches[nextRound]),
      };
    }

    case "RESTART": {
      return createInitialState(action.watches, state.totalRounds);
    }

    default:
      return state;
  }
}
