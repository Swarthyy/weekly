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

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Status</Text>
        <Text style={styles.subtitle}>Daily cockpit for real-time telemetry.</Text>
      </View>

      {isSunday ? (
        <Pressable onPress={onBeginReview} style={styles.hero}>
          <Text style={styles.heroLabel}>Week Complete</Text>
          <Text style={styles.heroTitle}>Begin Sunday Review</Text>
          <Text style={styles.heroBody}>
            Review your fact sheet and score the week from evidence.
          </Text>
        </Pressable>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Nutrition Today</Text>
        <MetricRow
          label="Calories"
          value={`${Math.round(caloriesToday)}`}
          hint={`${Math.max(0, caloriesTarget - caloriesToday)} remaining`}
        />
        <MetricRow
          label="Protein"
          value={`${Math.round(proteinToday)}g`}
          hint={`${Math.max(0, proteinTarget - proteinToday)}g to target`}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Hevy Training</Text>
        {!hevySummary?.connected ? (
          <Pressable onPress={onConnectHevy} style={styles.connectBtn}>
            <Text style={styles.connectBtnText}>{hevyLoading ? "Connecting..." : "Connect Hevy"}</Text>
          </Pressable>
        ) : (
          <>
            <MetricRow
              label="Total Workouts"
              value={`${hevySummary.workoutCount}`}
              hint={hevySummary.user?.name ?? "Connected"}
            />
            <MetricRow
              label="Last Workout"
              value={hevySummary.lastWorkout?.title ?? "None"}
              hint={
                hevySummary.lastWorkout
                  ? `${Math.round(hevySummary.lastWorkout.volume_kg)}kg volume`
                  : "No workout found"
              }
            />
          </>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Daily Logs</Text>
        {dailyLogs.length === 0 ? (
          <Text style={styles.empty}>No entries captured yet. Use Capture tab.</Text>
        ) : (
          dailyLogs
            .slice(0, 8)
            .reverse()
            .map((log) => (
              <View key={log.id} style={styles.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logItem}>{log.item}</Text>
                  <Text style={styles.logMeta}>
                    {new Date(log.createdAt).toLocaleTimeString()} · {log.type}
                  </Text>
                </View>
                <Text style={styles.logMacro}>{Math.round(log.calories)} kcal</Text>
              </View>
            ))
        )}
      </Card>
    </ScrollView>
  );
}

function MetricRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={styles.metricRow}>
      <View>
        <Text style={styles.metricLabel}>{label}</Text>
        {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 32, gap: spacing.sm },
  header: { marginBottom: spacing.md },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.text },
  subtitle: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  hero: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: 6,
  },
  heroTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.text, marginBottom: 4 },
  heroBody: { fontFamily: fonts.sans, fontSize: 11, color: colors.textMid, lineHeight: 17 },
  card: { marginBottom: spacing.sm },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.text, marginBottom: spacing.sm },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  metricLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.textMuted },
  metricHint: { fontFamily: fonts.sans, fontSize: 10, color: colors.textLight, marginTop: 1 },
  metricValue: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.text },
  connectBtn: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    alignItems: "center",
  },
  connectBtnText: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.white },
  empty: { fontFamily: fonts.sans, fontSize: 11, color: colors.textMuted },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  logItem: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.text },
  logMeta: { fontFamily: fonts.sans, fontSize: 10, color: colors.textMuted, marginTop: 1 },
  logMacro: { fontFamily: fonts.mono, fontSize: 10, color: colors.textMid },
});
