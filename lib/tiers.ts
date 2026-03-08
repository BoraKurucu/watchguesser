export type WatchTier = "free" | "premium";

// Premium brands — high-end, independents, vintage-focused
const PREMIUM_BRANDS = new Set([
  "Patek Philippe",
  "A. Lange & Söhne",
  "F.P. Journe",
  "MB&F",
  "Philippe Dufour",
  "Richard Mille",
  "Audemars Piguet",
  "Vacheron Constantin",
  "Jaeger-LeCoultre",
  "Breguet",
  "Blancpain",
  "Greubel Forsey",
  "Roger Dubuis",
  "H. Moser & Cie",
  "De Bethune",
  "Urwerk",
  "Ressence",
  "Laurent Ferrier",
  "Voutilainen",
  "Kari Voutilainen",
  "Czapek",
  "Bovet",
  "Arnold & Son",
  "Zenith",
  "IWC",
  "Panerai",
  "Cartier",
  "Chopard",
  "Girard-Perregaux",
  "Ulysse Nardin",
  "Hublot",
  "TAG Heuer",
  "Breitling",
  "Omega",
  "Rolex",
  "Tudor",
  "Grand Seiko",
  "Nomos",
  "Longines",
  "Rado",
  "Mido",
]);

// Free tier brands — entry-level, fashion, sport
const FREE_BRANDS = new Set([
  "Seiko",
  "Citizen",
  "Casio",
  "Timex",
  "Fossil",
  "Armani Exchange",
  "Emporio Armani",
  "Michael Kors",
  "Guess",
  "Versace",
  "VERSUS Versace",
  "Superdry",
  "TW Steel",
  "Fitbit",
  "Garmin",
  "Polar",
  "Suunto",
  "Swatch",
  "Hamilton",
  "Tissot",
  "Paul Hewitt",
  "Philipp Plein",
  "TONY+WILL",
  "Missoni",
]);

export type WatchRarity = "Legendary" | "Rare" | "Common";

const LEGENDARY_BRANDS = new Set([
  "Patek Philippe",
  "Audemars Piguet",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "F.P. Journe",
  "Richard Mille",
  "Philippe Dufour",
]);

const RARE_BRANDS = new Set([
  "Rolex",
  "Omega",
  "Zenith",
  "Cartier",
  "IWC",
  "Jaeger-LeCoultre",
  "Grand Seiko",
  "Tudor",
  "Breitling",
  "Breguet",
  "H. Moser & Cie",
]);

export function getRarity(brand: string): WatchRarity {
  if (LEGENDARY_BRANDS.has(brand)) return "Legendary";
  if (RARE_BRANDS.has(brand)) return "Rare";
  return "Common";
}

export function assignTier(brand: string): WatchTier {
  if (FREE_BRANDS.has(brand)) return "free";
  if (PREMIUM_BRANDS.has(brand)) return "premium";
  // Default: brands not explicitly listed go free to keep free pool healthy
  return "free";
}

export const GAME_MODES = {
  DAILY_CHALLENGE: "daily_challenge",
  WORLD_TOUR: "world_tour",
  FRIEND_CHALLENGE: "friend_challenge",
  PRICE_GUESSER: "price_guesser",
} as const;

export type GameMode = (typeof GAME_MODES)[keyof typeof GAME_MODES];

export const MODE_META: Record<GameMode, {
  label: string;
  description: string;
  premium: boolean;
  icon: string;
}> = {
  world_tour: {
    label: "World Tour",
    description: "Guess watches from all brands",
    premium: false,
    icon: "Globe",
  },
  friend_challenge: {
    label: "Friend Challenge",
    description: "Multiplayer: Two friends, 5 watches, one winner.",
    premium: true,
    icon: "Users",
  },
  price_guesser: {
    label: "Price Guesser",
    description: "Estimate market values within 10%",
    premium: true,
    icon: "DollarSign",
  },
  daily_challenge: {
    label: "Daily Tournament",
    description: "Same 8 watches for everyone today",
    premium: false,
    icon: "Calendar",
  },
};

export const FREE_DAILY_LIMIT = 2;
