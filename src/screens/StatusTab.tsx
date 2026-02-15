import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/ui";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { DailyLog } from "../types/app";
import { HevySummary } from "../services/api";

interface StatusTabProps {
  isSunday: boolean;
  onBeginReview: () => void;
  onConnectHevy: () => void;
  hevySummary: HevySummary | null;
  hevyLoading: boolean;
  dailyLogs: DailyLog[];
  caloriesTarget: number;
  proteinTarget: number;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")}${ampm}`;
}

export function StatusTab({
  isSunday,
  onBeginReview,
  onConnectHevy,
  hevySummary,
  hevyLoading,
  dailyLogs,
  caloriesTarget,
  proteinTarget,
}: StatusTabProps) {
  const caloriesToday = dailyLogs.reduce((sum, log) => sum + log.calories, 0);
  const proteinToday = dailyLogs.reduce((sum, log) => sum + log.protein, 0);
  const calPct = Math.round((caloriesToday / caloriesTarget) * 100);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Today</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </Text>
      </View>

      {/* Sunday Review CTA */}
      {isSunday ? (
        <Pressable onPress={onBeginReview} style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.heroDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>WEEK COMPLETE</Text>
              <Text style={styles.heroTitle}>Begin Sunday Review</Text>
              <Text style={styles.heroBody}>
                Score from evidence. No guessing.
              </Text>
            </View>
            <Text style={styles.heroArrow}>›</Text>
          </View>
        </Pressable>
      ) : null}

      {/* Nutrition Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Nutrition</Text>
          <Text style={styles.cardBadge}>
            {caloriesToday > 0 ? `${calPct}%` : "—"}
          </Text>
        </View>
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <View style={styles.macroLabelRow}>
              <Text style={styles.macroLabel}>Calories</Text>
              <Text style={styles.macroValue}>
                {Math.round(caloriesToday)}{" "}
                <Text style={styles.macroTarget}>/ {caloriesTarget}</Text>
              </Text>
            </View>
            <ProgressBar value={caloriesToday} max={caloriesTarget} color={colors.accent} />
          </View>
          <View style={styles.macroItem}>
            <View style={styles.macroLabelRow}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {Math.round(proteinToday)}g{" "}
                <Text style={styles.macroTarget}>/ {proteinTarget}g</Text>
              </Text>
            </View>
            <ProgressBar value={proteinToday} max={proteinTarget} color={colors.green} />
          </View>
        </View>
      </Card>

      {/* Training Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Training</Text>
          {hevySummary?.connected ? (
            <View style={styles.connectedDot} />
          ) : null}
        </View>
        {!hevySummary?.connected ? (
          <Pressable onPress={onConnectHevy} style={styles.connectBtn}>
            <Text style={styles.connectBtnText}>{hevyLoading ? "Connecting..." : "Connect Hevy"}</Text>
            <Text style={styles.connectArrow}>›</Text>
          </Pressable>
        ) : (
          <View style={styles.trainingGrid}>
            <View style={styles.trainingStat}>
              <Text style={styles.trainingNumber}>{hevySummary.workoutCount}</Text>
              <Text style={styles.trainingLabel}>Total Workouts</Text>
            </View>
            {hevySummary.lastWorkout ? (
              <View style={styles.trainingStat}>
                <Text style={styles.trainingNumber}>
                  {Math.round(hevySummary.lastWorkout.volume_kg)}
                  <Text style={styles.trainingUnit}>kg</Text>
                </Text>
                <Text style={styles.trainingLabel}>{hevySummary.lastWorkout.title}</Text>
              </View>
            ) : null}
          </View>
        )}
      </Card>

      {/* Daily Log Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Activity</Text>
          {dailyLogs.length > 0 ? (
            <Text style={styles.cardCount}>{dailyLogs.length} entries</Text>
          ) : null}
        </View>
        {dailyLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>+</Text>
            <Text style={styles.emptyText}>
              No entries yet today.{"\n"}Use Capture to log food or notes.
            </Text>
          </View>
        ) : (
          dailyLogs
            .slice(-6)
            .reverse()
            .map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={[
                  styles.logDot,
                  log.type === "food" && { backgroundColor: colors.accent },
                  log.type === "quick_add" && { backgroundColor: colors.green },
                  log.type === "voice" && { backgroundColor: colors.amber },
                ]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logItem} numberOfLines={1}>{log.item}</Text>
                  <Text style={styles.logMeta}>{formatTime(log.createdAt)}</Text>
                </View>
                {log.calories > 0 ? (
                  <Text style={styles.logMacro}>{Math.round(log.calories)}</Text>
                ) : null}
              </View>
            ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.md },
  header: { marginBottom: spacing.xs },
  greeting: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -0.5,
  },
  date: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Hero
  hero: {
    backgroundColor: colors.bgDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  heroInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  heroLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    color: colors.white,
    marginBottom: 2,
  },
  heroBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  heroArrow: {
    fontSize: 24,
    color: "rgba(255,255,255,0.3)",
    fontFamily: fonts.sansLight,
  },

  // Cards
  card: {},
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.text,
  },
  cardBadge: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  cardCount: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textLight,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },

  // Progress bar
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Macros
  macroRow: { gap: spacing.md },
  macroItem: { gap: 6 },
  macroLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  macroLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  macroValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.text,
  },
  macroTarget: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textLight,
  },

  // Training
  connectBtn: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  connectBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.white,
  },
  connectArrow: {
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
    fontFamily: fonts.sansLight,
  },
  trainingGrid: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  trainingStat: { flex: 1 },
  trainingNumber: {
    fontFamily: fonts.monoMedium,
    fontSize: 22,
    color: colors.text,
  },
  trainingUnit: {
    fontSize: 12,
    color: colors.textMuted,
  },
  trainingLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyIcon: {
    fontSize: 24,
    color: colors.textLight,
    fontFamily: fonts.sansLight,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },

  // Log rows
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textLight,
  },
  logItem: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
  },
  logMeta: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textLight,
    marginTop: 1,
  },
  logMacro: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMid,
  },
});
