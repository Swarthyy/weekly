import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/ui";
import { identitySnapshot } from "../data/demoData";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { TimelineWeek } from "../types/app";

interface TimelineTabProps {
  weeks: TimelineWeek[];
}

function trendSymbol(trend: TimelineWeek["trend"]) {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}

export function TimelineTab({ weeks }: TimelineTabProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
      </View>

      <View style={styles.list}>
        {weeks.map((week) => (
          <View
            key={week.week}
            style={[
              styles.weekRow,
              week.inProgress && styles.weekRowInProgress,
            ]}
          >
            <Text style={styles.weekNum}>{week.week}</Text>
            <View style={styles.weekInfo}>
              <Text
                style={[
                  styles.weekTitle,
                  week.inProgress && styles.weekTitleInProgress,
                ]}
              >
                {week.title}
              </Text>
              <Text style={styles.weekDates}>{week.dates}</Text>
            </View>
            {typeof week.score === "number" ? (
              <Text style={styles.weekScore}>{week.score.toFixed(1)}</Text>
            ) : null}
            {week.trend ? (
              <Text
                style={[
                  styles.weekTrend,
                  week.trend === "up" && styles.weekTrendUp,
                  week.trend === "down" && styles.weekTrendDown,
                ]}
              >
                {trendSymbol(week.trend)}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <Card>
        <Text style={styles.snapshotLabel}>Identity Snapshot · Updated Week 6</Text>
        <View style={styles.snapshotItem}>
          <Text style={styles.snapshotItemLabel}>Current Priorities</Text>
          <Text style={styles.snapshotBody}>{identitySnapshot.priorities}</Text>
        </View>
        <View style={styles.snapshotItem}>
          <Text style={styles.snapshotItemLabel}>Dominant Strengths</Text>
          <Text style={styles.snapshotBody}>{identitySnapshot.strengths}</Text>
        </View>
        <View style={styles.snapshotItem}>
          <Text style={styles.snapshotItemLabel}>Repeating Failures</Text>
          <Text style={styles.snapshotBody}>{identitySnapshot.failures}</Text>
        </View>
        <View>
          <Text style={styles.snapshotItemLabel}>Primary Bottleneck</Text>
          <Text style={styles.snapshotBody}>{identitySnapshot.bottleneck}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 32,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.text,
  },
  list: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  weekRow: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  weekRowInProgress: {
    borderStyle: "dashed",
    opacity: 0.65,
  },
  weekNum: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.text,
    width: 34,
  },
  weekInfo: {
    flex: 1,
  },
  weekTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
  },
  weekTitleInProgress: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
  weekDates: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  weekScore: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.text,
  },
  weekTrend: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    width: 20,
    textAlign: "right",
  },
  weekTrendUp: {
    color: colors.green,
  },
  weekTrendDown: {
    color: colors.accent,
  },
  snapshotLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  snapshotItem: {
    marginBottom: spacing.md,
  },
  snapshotItemLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  snapshotBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textMid,
  },
});
