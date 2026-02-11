import { DailyLog } from "../types/app";

export interface HevySummary {
  connected: boolean;
  user?: {
    id: string;
    name: string;
    url: string;
  };
  workoutCount: number;
  lastWorkout?: {
    id: string;
    title: string;
    start_time: string;
    volume_kg: number;
    exercise_count: number;
  } | null;
}

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8787";

export async function fetchHevySummary(): Promise<HevySummary> {
  const response = await fetch(`${API_BASE}/api/hevy/summary`);
  if (!response.ok) throw new Error(`Hevy summary failed (${response.status})`);
  return (await response.json()) as HevySummary;
}

export async function connectHevy(): Promise<void> {
  const response = await fetch(`${API_BASE}/api/hevy/connect-url`);
  if (!response.ok) throw new Error("Could not get Hevy connect URL");
  const payload = (await response.json()) as { url: string };
  if (typeof window !== "undefined") {
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }
}

export async function analyzeFoodText(input: string): Promise<{
  item: string;
  calories: number;
  protein: number;
  confidence: number;
}> {
  const response = await fetch(`${API_BASE}/api/food/analyze-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!response.ok) {
    throw new Error(`Food analysis failed (${response.status})`);
  }
  return (await response.json()) as {
    item: string;
    calories: number;
    protein: number;
    confidence: number;
  };
}

export async function analyzeFoodPhoto(base64Image: string): Promise<{
  item: string;
  calories: number;
  protein: number;
  confidence: number;
}> {
  const response = await fetch(`${API_BASE}/api/food/analyze-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image }),
  });
  if (!response.ok) {
    throw new Error(`Food image analysis failed (${response.status})`);
  }
  return (await response.json()) as {
    item: string;
    calories: number;
    protein: number;
    confidence: number;
  };
}

export function calculateDailyMacroTotals(logs: DailyLog[]) {
  return logs.reduce(
    (acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      return acc;
    },
    { calories: 0, protein: 0 }
  );
}
