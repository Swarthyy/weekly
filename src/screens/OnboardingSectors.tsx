import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppButton } from "../components/ui";
import { MAX_ACTIVE_SECTORS, buildCustomSectorContract } from "../data/demoData";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { SectorContract, SectorPriority } from "../types/app";

interface OnboardingSectorsProps {
  onFinalizeSectors: (sectors: SectorContract[]) => void;
  onBack: () => void;
}

type CandidateSector = {
  id: string;
  name: string;
  icon: string;
  intent: string;
  priority: SectorPriority;
  sensitive: boolean;
  active: boolean;
};

type SurveyState = {
  student: boolean | null;
  employed: boolean | null;
  creator: boolean | null;
  training: boolean | null;
  combat: boolean | null;
  music: boolean | null;
  socialLeadership: boolean | null;
  romanceFocus: boolean | null;
};

const surveyQuestions: { key: keyof SurveyState; title: string; subtitle: string }[] = [
  {
    key: "student",
    title: "Are you currently a student?",
    subtitle: "If yes, University/Study sectors will be prioritized.",
  },
  {
    key: "employed",
    title: "Are you actively employed or earning income?",
    subtitle: "Adds a Work/Income execution sector.",
  },
  {
    key: "creator",
    title: "Are you building content, business, or a brand?",
    subtitle: "Adds creator/business sectors where relevant.",
  },
  {
    key: "training",
    title: "Is training/fitness a weekly priority?",
    subtitle: "Adds Gym & Fitness tracking.",
  },
  {
    key: "combat",
    title: "Do you practice combat sports (e.g., jiujitsu/wrestling)?",
    subtitle: "Adds a combat progression sector.",
  },
  {
    key: "music",
    title: "Is music a core commitment?",
    subtitle: "Adds songwriting/rehearsal-focused sector.",
  },
  {
    key: "socialLeadership",
    title: "Do you lead groups, projects, or social dynamics?",
    subtitle: "Adds leadership/adventure sector.",
  },
  {
    key: "romanceFocus",
    title: "Do you want romance tracked intentionally?",
    subtitle: "Adds an optional sensitive sector.",
  },
];

const priorityOrder: SectorPriority[] = ["high", "normal", "low"];

function slug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function defaultIntent(name: string) {
  return `Measure weekly execution and growth in ${name}.`;
}

function seedFromSurvey(survey: SurveyState): CandidateSector[] {
  const result: CandidateSector[] = [];
  const push = (
    name: string,
    icon: string,
    intent: string,
    priority: SectorPriority = "normal",
    sensitive = false
  ) => {
    result.push({
      id: slug(`${name}-${result.length}`),
      name,
      icon,
      intent,
      priority,
      sensitive,
      active: true,
    });
  };

  if (survey.student) {
    push("University", "📚", "Track attendance, assignment progress, and learning quality.", "high");
  }
  if (survey.employed) {
    push("Work", "💼", "Track high-leverage output and income direction.", "high");
  }
  if (survey.creator) {
    push(
      "YouTube – Business & Content",
      "🎥",
      "Track publishing consistency, content quality, and momentum.",
      "high"
    );
  }
  if (survey.training) {
    push("Gym & Fitness", "💪", "Track sessions, intensity, recovery, and nutrition.", "high");
  }
  if (survey.combat) {
    push("Jiujitsu", "🥋", "Track sessions, techniques, and mat confidence progression.");
  }
  if (survey.music) {
    push("Music (Band + Solo)", "🎸", "Track rehearsals, songwriting, and performance readiness.");
  }
  if (survey.socialLeadership) {
    push("Leadership & Adventure", "🧭", "Track initiative, influence, and challenge creation.");
  }
  if (survey.romanceFocus) {
    push(
      "Romance",
      "💘",
      "Track romantic interactions with standards, integrity, and emotional control.",
      "normal",
      true
    );
  }

  push("Recovery & Optimisation", "🛌", "Track sleep, recovery protocol, and daytime energy.");
  push("Mindset & Focus", "🧠", "Track attention discipline and internal alignment.");

  return dedupeCandidates(result);
}

function dedupeCandidates(items: CandidateSector[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractCustomSectorNamesFromText(text: string): string[] {
  const names = new Set<string>();
  const calledMatches = Array.from(text.matchAll(/(?:called|named)\s+([a-zA-Z0-9][a-zA-Z0-9\s_-]{2,32})/gi));
  calledMatches.forEach((m) => names.add(m[1].trim()));

  text
    .split(/\n|,|\.|;|\||\//)
    .map((s) => s.trim())
    .filter((s) => s.length >= 4 && s.length <= 34)
    .forEach((chunk) => {
      if (/^(week|rating|intention|what|focus|overall)/i.test(chunk)) return;
      if (/^[a-z0-9\s&+-]+$/i.test(chunk) && /[a-z]/i.test(chunk)) {
        if (/[A-Z]/.test(chunk) || chunk.split(" ").length <= 4) {
          names.add(chunk.replace(/^[-*]\s*/, ""));
        }
      }
    });

  return Array.from(names).slice(0, 8);
}

async function extractWithAI(text: string, survey: SurveyState): Promise<CandidateSector[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) return [];

  const prompt = `Extract weekly life sectors from this user profile. Return ONLY JSON array, each item: {"name":"...","icon":"...","intent":"...","priority":"high|normal|low","sensitive":true|false}. Keep 4-10 sectors max. Prefer concrete sectors.\n\nSurvey: ${JSON.stringify(
    survey
  )}\n\nFreeform:\n${text}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.2,
    }),
  });

  if (!response.ok) return [];
  const data = await response.json();
  const raw =
    data.output_text ||
    data.output?.map((item: any) => item?.content?.map((c: any) => c?.text).join(" ")).join(" ") ||
    "";

  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start < 0 || end <= start) return [];

  const parsed = JSON.parse(raw.slice(start, end + 1));
  if (!Array.isArray(parsed)) return [];

  const result: CandidateSector[] = parsed
    .map((row: any, index: number) => {
      const name = `${row?.name ?? ""}`.trim();
      if (!name) return null;
      const priority = priorityOrder.includes(row?.priority) ? row.priority : "normal";
      return {
        id: slug(`${name}-${index}`),
        name,
        icon: `${row?.icon ?? "✨"}`.trim() || "✨",
        intent: `${row?.intent ?? defaultIntent(name)}`.trim(),
        priority,
        sensitive: Boolean(row?.sensitive),
        active: true,
      } as CandidateSector;
    })
    .filter(Boolean) as CandidateSector[];

  return dedupeCandidates(result);
}

function toContract(candidate: CandidateSector): SectorContract {
  return buildCustomSectorContract({
    name: candidate.name,
    icon: candidate.icon || "✨",
    intent: candidate.intent || defaultIntent(candidate.name),
    priority: candidate.priority,
    sensitive: candidate.sensitive,
    signals: ["Consistency", "Execution quality", "Momentum"],
    antiPatterns: ["Avoidance", "No tracking"],
    prompts: [
      "What happened in this sector this week?",
      "What did you execute well?",
      "Where did you underperform?",
    ],
    advancedPrompts: ["What would have made it a 10?"],
  });
}

export function OnboardingSectors({ onFinalizeSectors, onBack }: OnboardingSectorsProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [survey, setSurvey] = useState<SurveyState>({
    student: null,
    employed: null,
    creator: null,
    training: null,
    combat: null,
    music: null,
    socialLeadership: null,
    romanceFocus: null,
  });
  const [freeform, setFreeform] = useState("");
  const [useAI, setUseAI] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [candidates, setCandidates] = useState<CandidateSector[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  const question = surveyQuestions[stepIndex];
  const totalStepCount = surveyQuestions.length + 1;

  const activeCount = useMemo(
    () => candidates.filter((candidate) => candidate.active).length,
    [candidates]
  );

  const aiConfigured = Boolean(process.env.EXPO_PUBLIC_OPENAI_API_KEY);

  const setAnswer = (value: boolean) => {
    setSurvey((prev) => ({ ...prev, [question.key]: value }));
    if (stepIndex < surveyQuestions.length) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const generateCandidates = async () => {
    setGenerating(true);

    let generated = seedFromSurvey(survey);

    const freeformNames = extractCustomSectorNamesFromText(freeform);
    if (freeformNames.length > 0) {
      generated = generated.concat(
        freeformNames.map((name, i) => ({
          id: slug(`${name}-${i}`),
          name,
          icon: "✨",
          intent: defaultIntent(name),
          priority: "normal" as SectorPriority,
          sensitive: /romance|sex|retention|dating/i.test(name),
          active: true,
        }))
      );
    }

    if (useAI && aiConfigured && freeform.trim().length > 16) {
      try {
        const aiSectors = await extractWithAI(freeform, survey);
        if (aiSectors.length > 0) {
          generated = generated.concat(aiSectors);
        }
      } catch {
        // fall back silently
      }
    }

    generated = dedupeCandidates(generated);
    if (generated.length === 0) {
      generated = seedFromSurvey({
        ...survey,
        student: survey.student ?? false,
        employed: survey.employed ?? false,
        creator: survey.creator ?? false,
        training: true,
        combat: false,
        music: false,
        socialLeadership: false,
        romanceFocus: false,
      });
    }

    const limited = generated.map((candidate, index) => ({
      ...candidate,
      active: index < MAX_ACTIVE_SECTORS,
    }));

    setCandidates(limited);
    setReviewMode(true);
    setGenerating(false);
  };

  const updateCandidate = <K extends keyof CandidateSector>(
    id: string,
    key: K,
    value: CandidateSector[K]
  ) => {
    setCandidates((prev) =>
      prev.map((candidate) => {
        if (candidate.id !== id) return candidate;
        return { ...candidate, [key]: value };
      })
    );
  };

  const toggleCandidate = (id: string) => {
    setCandidates((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;
      if (!target.active && prev.filter((c) => c.active).length >= MAX_ACTIVE_SECTORS) {
        return prev;
      }
      return prev.map((candidate) =>
        candidate.id === id ? { ...candidate, active: !candidate.active } : candidate
      );
    });
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
  };

  const addEmptyCandidate = () => {
    setCandidates((prev) => [
      ...prev,
      {
        id: slug(`custom-${Date.now()}`),
        name: "",
        icon: "✨",
        intent: "",
        priority: "normal",
        sensitive: false,
        active: prev.filter((c) => c.active).length < MAX_ACTIVE_SECTORS,
      },
    ]);
  };

  const finalize = () => {
    const cleaned = candidates
      .map((candidate) => ({
        ...candidate,
        name: candidate.name.trim(),
        intent: candidate.intent.trim() || defaultIntent(candidate.name.trim()),
      }))
      .filter((candidate) => candidate.name.length > 1);

    const active = cleaned.filter((candidate) => candidate.active).slice(0, MAX_ACTIVE_SECTORS);
    const inactive = cleaned.filter((candidate) => !candidate.active);
    const normalized = [...active, ...inactive];

    onFinalizeSectors(normalized.map(toContract));
  };

  if (reviewMode) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Verify Your Sectors</Text>
        <Text style={styles.subtitle}>
          We extracted sectors from your profile. Edit names/intents, remove what is wrong, and keep max {MAX_ACTIVE_SECTORS} active.
        </Text>

        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>Active sectors</Text>
          <Text style={styles.counterValue}>{activeCount}/{MAX_ACTIVE_SECTORS}</Text>
        </View>

        <View style={styles.list}>
          {candidates.map((candidate) => (
            <View key={candidate.id} style={styles.card}>
              <View style={styles.rowTop}>
                <Pressable
                  onPress={() => toggleCandidate(candidate.id)}
                  style={[styles.activeChip, candidate.active && styles.activeChipOn]}
                >
                  <Text style={[styles.activeChipText, candidate.active && styles.activeChipTextOn]}>
                    {candidate.active ? "Active" : "Inactive"}
                  </Text>
                </Pressable>
                <Pressable onPress={() => removeCandidate(candidate.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>

              <View style={styles.inlineFieldRow}>
                <TextInput
                  style={[styles.input, styles.iconInput]}
                  value={candidate.icon}
                  onChangeText={(value) => updateCandidate(candidate.id, "icon", value)}
                  placeholder="✨"
                  placeholderTextColor={colors.textLight}
                />
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={candidate.name}
                  onChangeText={(value) => updateCandidate(candidate.id, "name", value)}
                  placeholder="Sector name"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <TextInput
                style={[styles.input, styles.intentInput]}
                value={candidate.intent}
                onChangeText={(value) => updateCandidate(candidate.id, "intent", value)}
                placeholder="What this sector means"
                placeholderTextColor={colors.textLight}
                multiline
              />

              <View style={styles.priorityRow}>
                {priorityOrder.map((priority) => (
                  <Pressable
                    key={priority}
                    onPress={() => updateCandidate(candidate.id, "priority", priority)}
                    style={[
                      styles.priorityChip,
                      candidate.priority === priority && styles.priorityChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityChipText,
                        candidate.priority === priority && styles.priorityChipTextActive,
                      ]}
                    >
                      {priority}
                    </Text>
                  </Pressable>
                ))}
                <View style={styles.sensitiveRow}>
                  <Text style={styles.sensitiveLabel}>Sensitive</Text>
                  <Switch
                    value={candidate.sensitive}
                    onValueChange={(value) => updateCandidate(candidate.id, "sensitive", value)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        <AppButton label="+ Add Sector" variant="bridge" onPress={addEmptyCandidate} />
        <View style={styles.space} />
        <AppButton label="Back to Questionnaire" variant="ghost" onPress={() => setReviewMode(false)} />
        <View style={styles.space} />
        <AppButton label="Use These Sectors" onPress={finalize} />
      </ScrollView>
    );
  }

  const onFreeformStep = stepIndex >= surveyQuestions.length;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Understand Your Real Life Mix</Text>
      <Text style={styles.subtitle}>
        Quick profile questionnaire first, then we auto-generate sectors you can verify and edit.
      </Text>

      <Text style={styles.progressText}>Step {Math.min(stepIndex + 1, totalStepCount)} of {totalStepCount}</Text>

      {!onFreeformStep ? (
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionSubtitle}>{question.subtitle}</Text>

          <View style={styles.answerRow}>
            <AppButton label="Yes" onPress={() => setAnswer(true)} style={styles.answerButton} />
            <AppButton label="No" variant="ghost" onPress={() => setAnswer(false)} style={styles.answerButton} />
          </View>

          <View style={styles.navRow}>
            <AppButton
              label="Back"
              variant="ghost"
              onPress={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            />
          </View>
        </View>
      ) : (
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>Tell us about your actual life right now</Text>
          <Text style={styles.questionSubtitle}>
            Add freeform detail. Include custom domains (e.g. "jamesmgmt") and responsibilities.
          </Text>

          <TextInput
            style={styles.freeformInput}
            value={freeform}
            onChangeText={setFreeform}
            multiline
            placeholder="Example: I manage my friend James' music career (jamesmgmt), study at uni, train 4x/week, and build YouTube content."
            placeholderTextColor={colors.textLight}
            textAlignVertical="top"
          />

          <View style={styles.aiRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>Use AI extraction (simple model)</Text>
              <Text style={styles.aiHint}>
                {aiConfigured
                  ? "Enabled via EXPO_PUBLIC_OPENAI_API_KEY."
                  : "No API key found. Falling back to deterministic extraction."}
              </Text>
            </View>
            <Switch value={useAI && aiConfigured} onValueChange={setUseAI} disabled={!aiConfigured} />
          </View>

          {generating ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.loadingText}>Generating sectors...</Text>
            </View>
          ) : (
            <AppButton label="Generate My Sectors" onPress={generateCandidates} />
          )}

          <View style={styles.space} />
          <AppButton
            label="Back"
            variant="ghost"
            onPress={() => setStepIndex((prev) => Math.max(0, prev - 1))}
          />
        </View>
      )}

      <View style={styles.space} />
      <AppButton label="← Back to Welcome" variant="ghost" onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  progressText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  questionTitle: {
    fontFamily: fonts.serif,
    fontSize: 25,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  questionSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  answerRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  answerButton: {
    flex: 1,
  },
  navRow: {
    alignItems: "flex-start",
  },
  freeformInput: {
    minHeight: 160,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    padding: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  aiTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
  },
  aiHint: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  counterCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  counterValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.accent,
  },
  list: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  activeChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.bgInput,
  },
  activeChipOn: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  activeChipText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  activeChipTextOn: {
    color: colors.accent,
  },
  removeText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.accent,
  },
  inlineFieldRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    color: colors.text,
    fontSize: 12,
  },
  iconInput: {
    width: 64,
    textAlign: "center",
  },
  nameInput: {
    flex: 1,
  },
  intentInput: {
    minHeight: 60,
    marginBottom: spacing.sm,
  },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  priorityChip: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.bgInput,
  },
  priorityChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  priorityChipText: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  priorityChipTextActive: {
    color: colors.accent,
  },
  sensitiveRow: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sensitiveLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
  },
  space: { height: spacing.md },
});
