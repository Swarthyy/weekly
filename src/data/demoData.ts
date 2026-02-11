import {
  ChartSeries,
  IdentitySnapshot,
  PresetPack,
  ReflectionInsights,
  SectorContract,
  SectorPriority,
  SectorScore,
  TimelineWeek,
  WeeklyEntryMap,
  WeeklySectorEntry,
} from "../types/app";

export const MAX_ACTIVE_SECTORS = 7;

export const topBarWeekLabel = "Week 7 · 2026";
export const reviewTitle = "Week 7 Review";
export const reviewDateRange = "Feb 3 – Feb 9, 2026";

function idFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeContract(input: {
  id?: string;
  name: string;
  icon: string;
  intent: string;
  priority?: SectorPriority;
  sensitive?: boolean;
  active?: boolean;
  signals: string[];
  antiPatterns: string[];
  prompts: string[];
  advancedPrompts?: string[];
}) {
  const id = input.id ?? idFromName(input.name);
  return {
    id,
    name: input.name,
    icon: input.icon,
    intent: input.intent,
    priority: input.priority ?? "normal",
    sensitive: input.sensitive ?? false,
    active: input.active ?? false,
    signals: input.signals,
    antiPatterns: input.antiPatterns,
    rubric: {
      zero: "Avoided core behaviors and ignored standards.",
      five: "Mixed execution with visible inconsistency.",
      eight: "Strong execution with one clear gap.",
      ten: "Elite execution aligned to intent and standards.",
    },
    prompts: [
      ...input.prompts.map((label, index) => ({
        id: `${id}-p${index + 1}`,
        label,
        type: "text" as const,
        placeholder: "Write a concise reflection...",
      })),
      ...(input.advancedPrompts ?? []).map((label, index) => ({
        id: `${id}-a${index + 1}`,
        label,
        type: "text" as const,
        placeholder: "Optional deeper note...",
        advanced: true,
      })),
    ],
  };
}

export const starterSectorContracts: SectorContract[] = [
  makeContract({
    name: "University",
    icon: "📚",
    active: true,
    priority: "high",
    intent: "Show up, progress assignments, and compound real understanding.",
    signals: ["Attendance", "Assignment progress", "Focus in lectures"],
    antiPatterns: ["Skipping classes", "No assignment tracking"],
    prompts: [
      "Classes attended",
      "Assignments progressed or submitted",
      "Assessment tracker updated?",
      "Lecture presence and focus",
      "Class interactions and networking",
      "Learning highlights",
    ],
    advancedPrompts: ["What would have made it a 10?"],
  }),
  makeContract({
    name: "Gym & Fitness",
    icon: "💪",
    active: true,
    priority: "high",
    intent: "Train with intent and execute recovery + nutrition around it.",
    signals: ["Workouts done", "Intensity", "Nutrition"],
    antiPatterns: ["Missed sessions", "Undereating protein"],
    prompts: [
      "Workouts completed",
      "Training intensity and key PRs",
      "Nutrition (calories + protein)",
      "Bodyweight check-in",
      "Physical changes/comments",
    ],
    advancedPrompts: ["SR impact on training"],
  }),
  makeContract({
    name: "Work",
    icon: "💼",
    active: true,
    priority: "high",
    intent: "Move high-leverage work and income forward each week.",
    signals: ["Hours worked", "Income actions", "Execution quality"],
    antiPatterns: ["Drift", "Low leverage busywork"],
    prompts: [
      "Hours worked",
      "Income generated",
      "Job search or alt-income steps",
      "Alignment with ideal work life",
    ],
  }),
  makeContract({
    name: "Recovery & Optimisation",
    icon: "🛌",
    active: true,
    priority: "normal",
    intent: "Recover aggressively so output quality compounds.",
    signals: ["Sleep routine", "Energy", "Recovery habits"],
    antiPatterns: ["Late-night drift", "No recovery protocol"],
    prompts: [
      "Sleep routine (lights out / wake-up)",
      "Magnesium + glycine consistency",
      "Stretching / mobility / sauna / cold",
      "Sunlight exposure",
      "Energy levels during the day",
    ],
  }),
  makeContract({
    name: "Mindset & Focus",
    icon: "🧠",
    active: true,
    priority: "normal",
    intent: "Protect mental clarity and direct attention to meaningful action.",
    signals: ["Journaling", "Focus quality", "Dopamine discipline"],
    antiPatterns: ["Compulsive scrolling", "Unstructured reactivity"],
    prompts: [
      "Journaling quality and frequency",
      "Mental clarity and purpose in action",
      "Scrolling/dopamine discipline",
      "Visualization or presence practice",
      "Handling of stress or chaos",
    ],
  }),
];

const week18PackSectors: SectorContract[] = [
  makeContract({
    name: "YouTube – Business & Content",
    icon: "🎥",
    intent: "Publish consistently and grow audience with quality iterations.",
    signals: ["Uploads", "Quality", "Engagement"],
    antiPatterns: ["No publishing", "No idea capture"],
    prompts: [
      "Videos uploaded",
      "Content quality reflection",
      "Ideas generated / logged",
      "Engagement (comments, shares, DMs)",
      "Growth / metrics",
      "Creative energy / momentum",
    ],
  }),
  makeContract({
    name: "Music (Band + Solo)",
    icon: "🎸",
    intent: "Advance musicianship, songs, and performance readiness.",
    signals: ["Practice", "Songwriting", "Rehearsals"],
    antiPatterns: ["No reps", "No prep for rehearsals"],
    prompts: [
      "Rehearsals attended / led",
      "Songwriting progress / lyric ideas",
      "Practice done (guitar / vocals)",
      "Setlist refinement or gig prep",
      "Creative flow moments",
    ],
  }),
  makeContract({
    name: "Semen Retention",
    icon: "🔒",
    sensitive: true,
    intent: "Sustain discipline and redirect energy intentionally.",
    signals: ["Streak", "Trigger control", "Energy transmutation"],
    antiPatterns: ["Leak cycles", "Dopamine spirals"],
    prompts: [
      "SR streak",
      "Urges managed / transmuted",
      "Triggers noticed and countered",
      "Energy recycled into training/content/presence",
      "Any fantasy / scrolling / leaks",
      "Internal power reflection",
    ],
  }),
  makeContract({
    name: "Jiujitsu",
    icon: "🥋",
    intent: "Develop technical sharpness and mat confidence.",
    signals: ["Sessions", "Technique reps", "Mental game"],
    antiPatterns: ["Inconsistent sessions", "No technical recall"],
    prompts: [
      "Sessions attended",
      "Techniques learned or tested",
      "Submissions attempted / landed",
      "Mental game (instinct, flow, aggression)",
      "Coach feedback / partner wins",
    ],
  }),
  makeContract({
    name: "Knowledge & Growth",
    icon: "📖",
    intent: "Turn reading into applied knowledge and insight.",
    signals: ["Pages read", "Zettels", "Applied ideas"],
    antiPatterns: ["Passive intake", "No synthesis"],
    prompts: [
      "Pages read or books studied",
      "Zettels created or refined",
      "Ideas applied in real life/content",
      "Personal insight or paradigm shift",
    ],
  }),
  makeContract({
    name: "Leadership & Adventure",
    icon: "🧭",
    intent: "Initiate momentum and bring others into action.",
    signals: ["Leadership moves", "Challenges proposed", "Novelty"],
    antiPatterns: ["Passive following", "No initiative"],
    prompts: [
      "Did you lead or elevate a group dynamic?",
      "Did you propose a challenge/mission/trip?",
      "1-on-1 influence moments",
      "Adventure / novelty experienced",
    ],
  }),
  makeContract({
    name: "Social Life",
    icon: "🕺",
    intent: "Build meaningful connection and social momentum.",
    signals: ["Events", "Depth of connection", "Group energy"],
    antiPatterns: ["Isolation", "Low-quality social loops"],
    prompts: [
      "Hangouts or events attended",
      "1-on-1 bonding moments",
      "Any group drama / awareness moments",
      "Leadership / vibe elevation",
    ],
  }),
  makeContract({
    name: "Romance",
    icon: "💘",
    sensitive: true,
    intent: "Lead interactions with integrity, standards, and emotional control.",
    signals: ["Interaction quality", "Frame", "Decision quality"],
    antiPatterns: ["Reactive behavior", "Blurred standards"],
    prompts: [
      "Interactions this week",
      "Frame maintenance / magnetic energy",
      "Sexual control in romantic contexts",
      "Reflections or shifts in standards",
    ],
  }),
  makeContract({
    name: "Aesthetics & Presentation",
    icon: "💈",
    priority: "low",
    intent: "Maintain presentation standards without letting vanity dominate.",
    signals: ["Grooming", "Confidence", "Consistency"],
    antiPatterns: ["Neglect", "Over-focus"],
    prompts: [
      "Outfits or grooming enhancements",
      "Comments / noticing from others",
      "Self-perception / confidence spike",
    ],
  }),
];

const week12PackSectors: SectorContract[] = [
  makeContract({
    name: "Combat Training",
    icon: "🥋",
    intent: "Increase technical competence and composure under pressure.",
    signals: ["Sessions", "Wins", "Skill gain"],
    antiPatterns: ["No tracking", "No follow-up practice"],
    prompts: [
      "Sessions attended",
      "Key wins / submissions",
      "Skills learned / improved",
      "Areas to focus next week",
    ],
  }),
  makeContract({
    name: "Content & Brand",
    icon: "📱",
    intent: "Produce and distribute content with clear strategic iteration.",
    signals: ["Posts", "Growth", "Experiments"],
    antiPatterns: ["No output", "No feedback loop"],
    prompts: [
      "Posts uploaded",
      "Growth (subs/followers)",
      "Engagement handled",
      "Strategy experiment this week",
    ],
  }),
];

export const presetPacks: PresetPack[] = [
  {
    id: "week-18-framework",
    name: "Week 18 Framework",
    description: "Large life-map preset from your week 18 template.",
    sectors: week18PackSectors,
  },
  {
    id: "week-12-framework",
    name: "Week 12 Framework",
    description: "Compact preset from week 12 tracking structure.",
    sectors: week12PackSectors,
  },
];

export const objectiveInputs = [
  { label: "Weight", value: "84.2", unit: "kg", delta: "-0.4", trend: "down" },
  { label: "Training", value: "4", unit: "sessions", delta: "+1", trend: "up" },
  { label: "Avg Sleep", value: "7.1", unit: "hrs", delta: "+0.3", trend: "up" },
  { label: "Screen Time", value: "4.8", unit: "hrs/d", delta: "-0.6", trend: "down" },
] as const;

export const initialTimelineWeeks: TimelineWeek[] = [
  { week: "W07", title: "In progress...", dates: "Feb 3 – Feb 9", inProgress: true },
  { week: "W06", title: "Back on Track", dates: "Jan 27 – Feb 2", score: 6.8, trend: "up" },
  { week: "W05", title: "Scattered", dates: "Jan 20 – Jan 26", score: 5.4, trend: "down" },
  { week: "W04", title: "Steady Progress", dates: "Jan 13 – Jan 19", score: 6.6, trend: "flat" },
  { week: "W03", title: "Finding Rhythm", dates: "Jan 6 – Jan 12", score: 6.4, trend: "up" },
  { week: "W02", title: "Slow Start", dates: "Dec 30 – Jan 5", score: 5.2, trend: "down" },
  { week: "W01", title: "First Week", dates: "Dec 23 – Dec 29", score: 5.8, trend: "flat" },
];

export const identitySnapshot: IdentitySnapshot = {
  priorities:
    "Training consistency, protecting deep work blocks, establishing a learning routine.",
  strengths:
    "Physical discipline is improving reliably. Sleep hygiene gains are holding. Work output is high when focused.",
  failures:
    "Reactive meeting attendance. Product doc avoidance. Creative projects deprioritized under pressure.",
  bottleneck:
    "Inability to say no to unplanned interruptions. This cascades into lost deep work -> unfinished deliverables -> guilt -> reduced creative energy.",
};

export const scoreChartSeries: ChartSeries = {
  id: "score-series",
  values: [5.8, 5.2, 6.4, 6.6, 5.4, 6.8],
  labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
  max: 10,
  colorToken: "accent",
};

export const trainingChartSeries: ChartSeries = {
  id: "training-series",
  values: [3, 2, 3, 3, 2, 3],
  labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
  max: 5,
  colorToken: "green",
};

export const dashboardMetrics = {
  weight: { current: "84.2", delta: "-0.4", average: "84.8", start: "86.1" },
  sleep: { current: "7.1", delta: "+0.3", average: "6.7" },
};

export const sectorTrendRows = [
  { icon: "💪", label: "Health", score: 7.2, tone: "green" },
  { icon: "🏋️", label: "Gym", score: 7.8, tone: "green" },
  { icon: "💼", label: "Work", score: 6.5, tone: "amber" },
  { icon: "📚", label: "Learning", score: 5.8, tone: "amber" },
  { icon: "🎨", label: "Creativity", score: 6.0, tone: "amber" },
] as const;

export function createEntryMap(contracts: SectorContract[]): WeeklyEntryMap {
  const map: WeeklyEntryMap = {};
  contracts.forEach((contract) => {
    const promptAnswers: WeeklySectorEntry["promptAnswers"] = {};
    contract.prompts.forEach((prompt) => {
      promptAnswers[prompt.id] = prompt.type === "checklist" ? [] : "";
    });
    map[contract.id] = {
      sectorId: contract.id,
      promptAnswers,
      rating: null,
      whatMakesTen: "",
      intention: "",
    };
  });
  return map;
}

export function syncEntriesWithContracts(
  entries: WeeklyEntryMap,
  contracts: SectorContract[]
): WeeklyEntryMap {
  const next = { ...entries };
  contracts.forEach((contract) => {
    if (!next[contract.id]) {
      next[contract.id] = {
        sectorId: contract.id,
        promptAnswers: {},
        rating: null,
        whatMakesTen: "",
        intention: "",
      };
    }
    contract.prompts.forEach((prompt) => {
      if (!(prompt.id in next[contract.id].promptAnswers)) {
        next[contract.id].promptAnswers[prompt.id] =
          prompt.type === "checklist" ? [] : "";
      }
    });
  });
  return next;
}

export function buildSectorScores(
  contracts: SectorContract[],
  entries: WeeklyEntryMap
): SectorScore[] {
  return contracts
    .filter((contract) => contract.active)
    .map((contract) => {
      const entry = entries[contract.id];
      const score = entry?.rating ?? 5;
      const focus = entry?.intention?.trim()
        ? `Next week: ${entry.intention.trim()}`
        : "No intention set yet.";
      return {
        id: contract.id,
        icon: contract.icon,
        name: contract.name,
        score,
        rationale: focus,
      };
    });
}

export function buildInsights(scores: SectorScore[]): ReflectionInsights {
  if (scores.length === 0) {
    return {
      facts: "No active sectors configured for this week yet.",
      patterns: "Activate at least one sector to generate weekly patterns.",
      openLoop: "Define your top sector and set an intention.",
    };
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const avg = scores.reduce((sum, item) => sum + item.score, 0) / scores.length;
  const low = scores.filter((item) => item.score < 6);

  return {
    facts: `Active sectors: ${scores.length}. Average score: ${avg.toFixed(
      1
    )}/10. Strongest sector: ${sorted[0].name} (${sorted[0].score.toFixed(1)}).`,
    patterns:
      low.length > 0
        ? `Sectors under 6.0: ${low
            .map((item) => `${item.name} (${item.score.toFixed(1)})`)
            .join(", ")}.`
        : "No sectors below 6.0 this week. Maintain consistency over intensity.",
    openLoop:
      sorted[sorted.length - 1]
        ? `Primary open loop: elevate ${sorted[
            sorted.length - 1
          ].name} next week.`
        : "Primary open loop not available.",
  };
}

export function buildBridgeText(args: {
  weekLabel: string;
  contracts: SectorContract[];
  entries: WeeklyEntryMap;
  includeSensitive: boolean;
}): string {
  const activeContracts = args.contracts.filter((contract) => contract.active);
  const visibleContracts = activeContracts.filter(
    (contract) => args.includeSensitive || !contract.sensitive
  );

  const lines: string[] = [];
  lines.push(`--- WEEKLY REVIEW: ${args.weekLabel} ---`);
  lines.push("");
  lines.push("SECTOR SCORES:");

  visibleContracts.forEach((contract) => {
    const entry = args.entries[contract.id];
    const ratingText =
      typeof entry?.rating === "number" ? `${entry.rating}/10` : "Unrated";
    lines.push(`- ${contract.name}: ${ratingText}`);
  });

  lines.push("");
  lines.push("SECTOR NOTES:");
  visibleContracts.forEach((contract) => {
    const entry = args.entries[contract.id];
    lines.push(`- ${contract.name}:`);
    const highlights = contract.prompts
      .slice(0, 2)
      .map((prompt) => {
        const value = entry?.promptAnswers[prompt.id];
        const text = Array.isArray(value) ? value.join(", ") : `${value ?? ""}`;
        return text.trim();
      })
      .filter(Boolean);
    lines.push(
      highlights.length > 0
        ? `  ${highlights.join(" | ")}`
        : "  No key notes captured yet."
    );
    lines.push(
      `  Intention: ${entry?.intention?.trim() || "No intention set yet."}`
    );
  });

  lines.push("");
  lines.push("---");
  lines.push(
    "Challenge my self-assessment, surface blind spots, and help prioritize the next week."
  );

  return lines.join("\n");
}

export function mergePresetPack(
  current: SectorContract[],
  pack: PresetPack
): SectorContract[] {
  const map = new Map(current.map((sector) => [sector.id, sector]));
  pack.sectors.forEach((sector) => {
    if (!map.has(sector.id)) {
      map.set(sector.id, sector);
    }
  });
  return Array.from(map.values());
}

export function buildCustomSectorContract(input: {
  name: string;
  icon: string;
  intent: string;
  priority: SectorPriority;
  sensitive: boolean;
  signals: string[];
  antiPatterns: string[];
  prompts: string[];
  advancedPrompts: string[];
}): SectorContract {
  return makeContract({
    name: input.name,
    icon: input.icon,
    intent: input.intent,
    priority: input.priority,
    sensitive: input.sensitive,
    active: true,
    signals: input.signals,
    antiPatterns: input.antiPatterns,
    prompts: input.prompts,
    advancedPrompts: input.advancedPrompts,
  });
}
