import Papa from "papaparse";
import { Watch } from "./types";

export type { Watch };

export async function loadWatches(): Promise<Watch[]> {
  const response = await fetch("/metadata.csv");
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const watches: Watch[] = results.data.map((row) => {
          // Attempt to extract or fallback to placeholders for display
          const reference = row["reference"]?.trim() || "N/A";
          const caliber = row["caliber"]?.trim() || (row.brand === "Rolex" ? "Calibre 3235" : "In-House Automatic");
          const case_material = row["case_material"]?.trim() || "Stainless Steel";
          const water_resistance = row["water_resistance"]?.trim() || "100m / 10 ATM";
          const year_introduced = row["year_introduced"]?.trim() || "Modern Era";

          return {
            id: parseInt(row[""] ?? row["id"] ?? "0", 10),
            brand: row["brand"]?.trim() ?? "",
            name: row["name"]?.trim() ?? "",
            price: row["price"]?.trim() ?? "",
            image_name: row["image_name"]?.trim() ?? "",
            reference,
            caliber,
            case_material,
            water_resistance,
            year_introduced,
          };
        });
        resolve(watches.filter((w) => w.brand && w.name && w.image_name));
      },
      error: (err: Error) => reject(err),
    });
  });
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
