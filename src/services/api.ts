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
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:8787");

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
    window.location.assign(payload.url);
  }
}

async function analyzeFoodTextDirectWithOpenAi(input: string): Promise<{
  item: string;
  calories: number;
  protein: number;
  confidence: number;
}> {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!key) {
    throw new Error("Food analysis backend unavailable and EXPO_PUBLIC_OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Estimate meal nutrition quickly. Return strict JSON only with keys item, calories, protein, confidence (0-1).",
        },
        { role: "user", content: `Estimate this meal: ${input}` },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Food analysis failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text =
    payload.output_text ||
    payload.output?.flatMap((out) => out.content || []).map((content) => content.text || "").join(" ") ||
    "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new Error("Food analysis parse failed");
  }

  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    item?: string;
    calories?: number;
    protein?: number;
    confidence?: number;
  };

  return {
    item: parsed.item || input,
    calories: Number(parsed.calories || 0),
    protein: Number(parsed.protein || 0),
    confidence: Number(parsed.confidence || 0.5),
  };
}

export async function analyzeFoodText(input: string): Promise<{
  item: string;
  calories: number;
  protein: number;
  confidence: number;
}> {
  try {
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
  } catch (_error) {
    return analyzeFoodTextDirectWithOpenAi(input);
  }
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
