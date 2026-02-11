export type AppPhase = "onboard" | "app";

export type OnboardingScreen = "welcome" | "sectors" | "ritual";

export type MainTab = "status" | "capture" | "vault" | "review";

export type ReviewStep = "obj" | "reflect" | "scoring" | "summary" | "locked";

export type WeekTrend = "up" | "down" | "flat";

export type SectorPriority = "high" | "normal" | "low";

export type PromptType = "text" | "number" | "checklist";

export interface PromptOption {
  id: string;
  label: string;
}

export interface PromptDefinition {
  id: string;
  label: string;
  type: PromptType;
  placeholder?: string;
  options?: PromptOption[];
  advanced?: boolean;
}

export interface SectorRubric {
  zero: string;
  five: string;
  eight: string;
  ten: string;
}

export interface SectorContract {
  id: string;
  name: string;
  icon: string;
  intent: string;
  priority: SectorPriority;
  sensitive?: boolean;
  active: boolean;
  signals: string[];
  antiPatterns: string[];
  prompts: PromptDefinition[];
  rubric: SectorRubric;
}

export interface SectorScore {
  id: string;
  icon: string;
  name: string;
  score: number;
  rationale: string;
}

export interface WeeklySectorEntry {
  sectorId: string;
  promptAnswers: Record<string, string | number | string[]>;
  rating: number | null;
  whatMakesTen: string;
  intention: string;
}

export type WeeklyEntryMap = Record<string, WeeklySectorEntry>;

export interface PresetPack {
  id: string;
  name: string;
  description: string;
  sectors: SectorContract[];
}

export interface TimelineWeek {
  week: string;
  title: string;
  dates: string;
  score?: number;
  trend?: WeekTrend;
  inProgress?: boolean;
}

export interface ChartSeries {
  id: string;
  values: number[];
  labels: string[];
  max: number;
  colorToken: string;
}

export interface IdentitySnapshot {
  priorities: string;
  strengths: string;
  failures: string;
  bottleneck: string;
}

export interface ReflectionInsights {
  facts: string;
  patterns: string;
  openLoop: string;
}

export type DailyLogType = "food" | "voice" | "quick_add";

export interface DailyLog {
  id: string;
  type: DailyLogType;
  item: string;
  calories: number;
  protein: number;
  createdAt: string;
  confidence?: number;
}

export interface ExternalMetric {
  source: "hevy" | "sleep" | "healthkit";
  key: string;
  value: number | string;
  fetchedAt: string;
}
