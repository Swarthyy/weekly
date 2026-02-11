import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { ProgressPips } from "../components/ProgressPips";
import { ScoringCards } from "../components/ScoringCards";
import { AppButton, Card, FadeLabel } from "../components/ui";
import { objectiveInputs, reviewDateRange, reviewTitle } from "../data/demoData";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import {
  ReflectionInsights,
  ReviewStep,
  SectorContract,
  SectorScore,
  WeeklyEntryMap,
} from "../types/app";

type CopyState = "idle" | "copied" | "failed";

interface ReviewTabProps {
  step: ReviewStep;
  onStepChange: (step: ReviewStep) => void;
  sectors: SectorContract[];
  entries: WeeklyEntryMap;
  scores: SectorScore[];
  insights: ReflectionInsights;
  overallScore: number;
  onPromptAnswerChange: (
    sectorId: string,
    promptId: string,
    value: string | number | string[]
  ) => void;
  onRatingChange: (sectorId: string, rating: number | null) => void;
  onWhatMakesTenChange: (sectorId: string, value: string) => void;
  onIntentionChange: (sectorId: string, value: string) => void;
  onLockWeek: () => void;
  copyState: CopyState;
  onCopyBridge: (includeSensitive: boolean) => void;
}

export function ReviewTab({
  step,
  onStepChange,
  sectors,
  entries,
  scores,
  insights,
  overallScore,
  onPromptAnswerChange,
  onRatingChange,
  onWhatMakesTenChange,
  onIntentionChange,
  onLockWeek,
  copyState,
  onCopyBridge,
}: ReviewTabProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (step !== "obj") {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [step]);

  const activeSectors = useMemo(
    () => sectors.filter((sector) => sector.active),
    [sectors]
  );

  const bridgeLabel = useMemo(() => {
    if (copyState === "copied") return "✓ Copied to clipboard";
    if (copyState === "failed") return "Could not copy, try again";
    return "📋 Discuss this week in ChatGPT";
  }, [copyState]);

  const bridgeTextStyle =
    copyState === "copied" ? styles.bridgeSuccessText : undefined;
  const bridgeStyle = copyState === "copied" ? styles.bridgeSuccessBtn : undefined;

  return (
    <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{reviewTitle}</Text>
        <Text style={styles.dateRange}>{reviewDateRange}</Text>
      </View>

      <ProgressPips currentStep={step} />

      {step === "obj" && (
        <View>
          <FadeLabel text="Objective Inputs" />
          <Card>
            <View style={styles.objectiveGrid}>
              {objectiveInputs.map((item) => (
                <View key={item.label} style={styles.metricCell}>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                  <Text style={styles.metricValue}>
                    {item.value}
                    <Text style={styles.metricUnit}> {item.unit}</Text>
                  </Text>
                  <Text
                    style={[
                      styles.metricDelta,
                      item.trend === "up" ? styles.deltaUp : styles.deltaDown,
                    ]}
                  >
                    {item.delta}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
          <View style={styles.space} />
          <AppButton label="Continue to Reflection ->" onPress={() => onStepChange("reflect")} />
        </View>
      )}

      {step === "reflect" && (
        <View>
          <FadeLabel text="Sector Reflection" />
          <View style={styles.strategyCard}>
            <Text style={styles.strategyTitle}>Reflection Contracts Active</Text>
            <Text style={styles.strategyBody}>
              Keep each sector concise. Core prompts are required; advanced prompts are optional.
            </Text>
          </View>
          <View style={styles.reflectionList}>
            {activeSectors.map((sector) => {
              const entry = entries[sector.id];
              const showAdvanced = advancedVisible[sector.id] ?? false;
              const visiblePrompts = sector.prompts.filter(
                (prompt) => !prompt.advanced || showAdvanced
              );
              const hasAdvanced = sector.prompts.some((prompt) => prompt.advanced);
              return (
                <Card key={sector.id}>
                  <View style={styles.reflectionHeader}>
                    <Text style={styles.reflectionIcon}>{sector.icon}</Text>
                    <View style={styles.flex1}>
                      <View style={styles.sectorTitleRow}>
                        <Text style={styles.reflectionName}>{sector.name}</Text>
                        {sector.priority === "low" && (
                          <Text style={styles.lowPriorityBadge}>Low Priority</Text>
                        )}
                        {sector.sensitive && (
                          <Text style={styles.sensitiveBadge}>Sensitive</Text>
                        )}
                      </View>
                      <Text style={styles.reflectionDesc}>{sector.intent}</Text>
                    </View>
                  </View>

                  <Text style={styles.signalRow}>
                    Signals: {sector.signals.join(" · ")}
                  </Text>
                  {sector.antiPatterns.length > 0 ? (
                    <Text style={styles.signalRowMuted}>
                      Watch-outs: {sector.antiPatterns.join(" · ")}
                    </Text>
                  ) : null}

                  {visiblePrompts.map((prompt) => (
                    <View key={prompt.id} style={styles.promptWrap}>
                      <Text style={styles.promptLabel}>{prompt.label}</Text>
                      {prompt.type !== "checklist" ? (
                        <TextInput
                          style={[
                            styles.input,
                            prompt.type === "number" && styles.numberInput,
                          ]}
                          multiline={prompt.type !== "number"}
                          keyboardType={prompt.type === "number" ? "numeric" : "default"}
                          value={`${entry?.promptAnswers[prompt.id] ?? ""}`}
                          onChangeText={(value) =>
                            onPromptAnswerChange(
                              sector.id,
                              prompt.id,
                              prompt.type === "number" ? Number(value || 0) : value
                            )
                          }
                          placeholder={prompt.placeholder ?? "Add note"}
                          placeholderTextColor={colors.textLight}
                          textAlignVertical="top"
                        />
                      ) : (
                        <View style={styles.checklistWrap}>
                          {(prompt.options ?? []).map((option) => {
                            const current =
                              (entry?.promptAnswers[prompt.id] as string[] | undefined) ?? [];
                            const selected = current.includes(option.id);
                            return (
                              <Pressable
                                key={option.id}
                                onPress={() => {
                                  const next = selected
                                    ? current.filter((id) => id !== option.id)
                                    : [...current, option.id];
                                  onPromptAnswerChange(sector.id, prompt.id, next);
                                }}
                                style={[styles.checkOption, selected && styles.checkOptionSelected]}
                              >
                                <Text style={styles.checkOptionText}>{option.label}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ))}

                  {hasAdvanced ? (
                    <Pressable
                      onPress={() =>
                        setAdvancedVisible((prev) => ({
                          ...prev,
                          [sector.id]: !(prev[sector.id] ?? false),
                        }))
                      }
                      style={styles.advancedToggle}
                    >
                      <Text style={styles.advancedToggleText}>
                        {showAdvanced ? "Hide" : "Show"} advanced prompts
                      </Text>
                    </Pressable>
                  ) : null}

                  <View style={styles.inlineMetaRow}>
                    <View style={styles.metaHalf}>
                      <Text style={styles.promptLabel}>Rating (0-10)</Text>
                      <TextInput
                        style={[styles.input, styles.numberInput]}
                        keyboardType="numeric"
                        value={
                          entry?.rating === null || typeof entry?.rating === "undefined"
                            ? ""
                            : String(entry.rating)
                        }
                        onChangeText={(value) => {
                          const parsed = Number(value);
                          if (value.trim() === "") {
                            onRatingChange(sector.id, null);
                          } else if (!Number.isNaN(parsed)) {
                            onRatingChange(sector.id, Math.min(10, Math.max(0, parsed)));
                          }
                        }}
                        placeholder="7"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                    <View style={styles.metaHalf}>
                      <Text style={styles.promptLabel}>What makes it a 10?</Text>
                      <TextInput
                        style={styles.input}
                        value={entry?.whatMakesTen ?? ""}
                        onChangeText={(value) => onWhatMakesTenChange(sector.id, value)}
                        placeholder="One concrete upgrade"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                  </View>

                  <View style={styles.promptWrap}>
                    <Text style={styles.promptLabel}>Intention for next week</Text>
                    <TextInput
                      style={styles.input}
                      value={entry?.intention ?? ""}
                      onChangeText={(value) => onIntentionChange(sector.id, value)}
                      placeholder="One high-impact intention"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
          <View style={styles.space} />
          <AppButton label="Generate AI Evaluation ->" onPress={() => onStepChange("scoring")} />
          <View style={styles.spaceSmall} />
          <AppButton label="<- Back to Inputs" variant="ghost" onPress={() => onStepChange("obj")} />
        </View>
      )}

      {step === "scoring" && (
        <View>
          <FadeLabel text="AI Evaluation - Week 7" />
          <ScoringCards scores={scores} />
          <View style={styles.space} />
          <AppButton label="View Weekly Summary ->" onPress={() => onStepChange("summary")} />
          <View style={styles.spaceSmall} />
          <AppButton label="<- Edit Reflections" variant="ghost" onPress={() => onStepChange("reflect")} />
        </View>
      )}

      {step === "summary" && (
        <View>
          <View style={styles.overall}>
            <Text style={styles.overallNum}>{overallScore.toFixed(1)}</Text>
            <Text style={styles.overallLabel}>Overall Week Score</Text>
          </View>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Facts</Text>
            <Text style={styles.summaryText}>{insights.facts}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Patterns</Text>
            <Text style={styles.summaryText}>{insights.patterns}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Open Loop</Text>
            <Text style={styles.summaryText}>{insights.openLoop}</Text>
          </Card>

          <View style={styles.privacyRow}>
            <View style={styles.flex1}>
              <Text style={styles.privacyTitle}>Include sensitive sectors in export</Text>
              <Text style={styles.privacyHint}>
                Turn off to redact Romance/SR-style sectors before sharing.
              </Text>
            </View>
            <Switch value={includeSensitive} onValueChange={setIncludeSensitive} />
          </View>

          <View style={styles.warning}>
            <Text style={styles.warningIcon}>⚠</Text>
            <Text style={styles.warningText}>
              Once submitted, this week is locked. Keep sectors lean and consistent.
            </Text>
          </View>

          <AppButton label="Lock & Submit Week 7" onPress={onLockWeek} />
          <View style={styles.spaceSmall} />
          <AppButton
            label={bridgeLabel}
            variant="bridge"
            onPress={() => onCopyBridge(includeSensitive)}
            style={bridgeStyle}
            textStyle={bridgeTextStyle}
          />
          <View style={styles.spaceSmall} />
          <AppButton label="<- Back to Scores" variant="ghost" onPress={() => onStepChange("scoring")} />
        </View>
      )}

      {step === "locked" && (
        <View style={styles.lockedWrap}>
          <Text style={styles.lockedTick}>✓</Text>
          <Text style={styles.lockedTitle}>Week 7 Locked</Text>
          <Text style={styles.lockedBody}>
            Your review has been archived with sector contracts and intentions.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 32 },
  header: { marginBottom: spacing.md },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.text },
  dateRange: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  objectiveGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.md,
  },
  metricCell: { width: "50%", paddingRight: spacing.sm },
  metricLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textLight,
    marginBottom: 4,
  },
  metricValue: { fontFamily: fonts.monoMedium, fontSize: 20, color: colors.text },
  metricUnit: { fontFamily: fonts.mono, fontSize: 11, color: colors.textLight },
  metricDelta: { fontFamily: fonts.mono, fontSize: 11, marginTop: 2 },
  deltaUp: { color: colors.green },
  deltaDown: { color: colors.accent },
  space: { height: spacing.lg },
  spaceSmall: { height: spacing.md },
  strategyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  strategyTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  strategyBody: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 17,
  },
  reflectionList: { gap: spacing.md },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reflectionIcon: { fontSize: 16 },
  flex1: { flex: 1 },
  sectorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  reflectionName: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.text },
  lowPriorityBadge: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.amber,
    borderWidth: 1,
    borderColor: colors.amber,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sensitiveBadge: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reflectionDesc: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  signalRow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textMid,
    marginBottom: 2,
  },
  signalRowMuted: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  promptWrap: {
    marginBottom: spacing.sm,
  },
  promptLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 44,
    fontFamily: fonts.sans,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  numberInput: {
    minHeight: 40,
    paddingVertical: 8,
  },
  checklistWrap: { gap: 6 },
  checkOption: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bgInput,
  },
  checkOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  checkOptionText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMid,
  },
  advancedToggle: {
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  advancedToggleText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
  },
  inlineMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaHalf: {
    flex: 1,
  },
  bridgeSuccessBtn: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  bridgeSuccessText: { color: colors.green },
  overall: { alignItems: "center", marginBottom: spacing.lg },
  overallNum: { fontFamily: fonts.monoMedium, fontSize: 48, color: colors.accent },
  overallLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
  },
  summaryCard: { marginBottom: spacing.sm },
  summaryLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textMid,
  },
  privacyRow: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  privacyTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  },
  privacyHint: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
  },
  warning: {
    backgroundColor: colors.redSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginVertical: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  warningIcon: { color: colors.accent, fontSize: 13 },
  warningText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMid,
    lineHeight: 17,
    flex: 1,
  },
  lockedWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
  },
  lockedTick: { fontSize: 38, color: colors.green, marginBottom: spacing.sm },
  lockedTitle: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  lockedBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
});
