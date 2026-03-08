import { Watch, RoundResult, HintItem } from "./types";

export const POINTS = {
  BRAND_AND_MODEL: 1000,
  BRAND_ONLY: 300,
  HINT_COST: 100,
} as const;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

export function scoreGuess(
  watch: Watch,
  userBrand: string,
  userModel: string,
  hints: HintItem[]
): Pick<RoundResult, "brandCorrect" | "modelCorrect" | "pointsEarned" | "hintCost"> {
  const nb = normalize(userBrand);
  const nm = normalize(userModel);
  const wb = normalize(watch.brand);
  const wm = normalize(watch.name);

  const brandCorrect = nb.length > 0 && (nb.includes(wb) || wb.includes(nb));
  const modelCorrect = nm.length > 0 && (nm.includes(wm) || wm.includes(nm));

  let raw = 0;
  if (brandCorrect && modelCorrect) raw = POINTS.BRAND_AND_MODEL;
  else if (brandCorrect) raw = POINTS.BRAND_ONLY;

  const hintCost = hints.filter((h) => h.revealed).reduce((s, h) => s + h.cost, 0);
  const pointsEarned = Math.max(0, raw - hintCost);

  return { brandCorrect, modelCorrect, pointsEarned, hintCost };
}

export function buildHints(watch: Watch): HintItem[] {
  return [
    {
      label: "Price Range",
      value: watch.price,
      cost: POINTS.HINT_COST,
      revealed: false,
    },
    {
      label: "Brand Initial",
      value: `Starts with "${watch.brand[0].toUpperCase()}"`,
      cost: POINTS.HINT_COST,
      revealed: false,
    },
    {
      label: "Word Count",
      value: `${watch.name.split(" ").length}-word model name`,
      cost: POINTS.HINT_COST,
      revealed: false,
    },
  ];
}
