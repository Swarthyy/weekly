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

function scoreColor(score: number) {
  if (score >= 7) return colors.green;
  if (score >= 5.5) return colors.amber;
  return colors.accent;
}

export function TimelineTab({ weeks }: TimelineTabProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Vault</Text>
        <Text style={styles.subtitle}>{weeks.length} weeks tracked</Text>
      </View>

      {/* Timeline */}
      <View style={styles.timeline}>
        {weeks.map((week, index) => (
          <View key={week.week} style={styles.weekCard}>
            {/* Timeline dot + line */}
            <View style={styles.timelineTrack}>
              <View style={[
                styles.dot,
                week.inProgress && styles.dotInProgress,
                !week.inProgress && { backgroundColor: scoreColor(week.score ?? 5) },
              ]} />
              {index < weeks.length - 1 ? <View style={styles.line} /> : null}
            </View>

            {/* Content */}
            <View style={[styles.weekContent, week.inProgress && styles.weekContentInProgress]}>
              <View style={styles.weekTopRow}>
                <Text style={styles.weekNum}>{week.week}</Text>
                {typeof week.score === "number" ? (
                  <View style={[styles.scoreBadge, { backgroundColor: `${scoreColor(week.score)}15` }]}>
                    <Text style={[styles.scoreText, { color: scoreColor(week.score) }]}>
                      {week.score.toFixed(1)}
                    </Text>
                  </View>
                ) : null}
                {week.trend ? (
                  <Text
                    style={[
                      styles.trendText,
                      week.trend === "up" && { color: colors.green },
                      week.trend === "down" && { color: colors.accent },
                    ]}
                  >
                    {trendSymbol(week.trend)}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.weekTitle, week.inProgress && styles.weekTitleInProgress]}>
                {week.title}
              </Text>
              <Text style={styles.weekDates}>{week.dates}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Identity Snapshot */}
      <Card>
        <Text style={styles.snapshotLabel}>IDENTITY SNAPSHOT</Text>
        <Text style={styles.snapshotUpdate}>Updated Week 6</Text>

        <View style={styles.snapshotGrid}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotDot}>●</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapshotItemLabel}>Priorities</Text>
              <Text style={styles.snapshotBody}>{identitySnapshot.priorities}</Text>
            </View>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={[styles.snapshotDot, { color: colors.green }]}>●</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapshotItemLabel}>Strengths</Text>
              <Text style={styles.snapshotBody}>{identitySnapshot.strengths}</Text>
            </View>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={[styles.snapshotDot, { color: colors.accent }]}>●</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapshotItemLabel}>Repeating Failures</Text>
              <Text style={styles.snapshotBody}>{identitySnapshot.failures}</Text>
            </View>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={[styles.snapshotDot, { color: colors.amber }]}>●</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.snapshotItemLabel}>Primary Bottleneck</Text>
              <Text style={styles.snapshotBody}>{identitySnapshot.bottleneck}</Text>
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  header: { marginBottom: spacing.xs },
  greeting: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Timeline
  timeline: {},
  weekCard: {
    flexDirection: "row",
  },
  timelineTrack: {
    width: 24,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textLight,
    marginTop: 6,
  },
  dotInProgress: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.accentGlow,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 1.5,
    flex: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },

  weekContent: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.lg,
  },
  weekContentInProgress: {
    opacity: 0.7,
  },
  weekTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  weekNum: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: colors.textMid,
  },
  scoreBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  scoreText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
  },
  trendText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
  },
  weekTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  weekTitleInProgress: {
    fontStyle: "italic",
    color: colors.textMuted,
  },
  weekDates: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textLight,
  },

  // Identity Snapshot
  snapshotLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textLight,
  },
  snapshotUpdate: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  snapshotGrid: {
    gap: spacing.md,
  },
  snapshotItem: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  snapshotDot: {
    fontSize: 8,
    color: colors.textMid,
    marginTop: 4,
  },
  snapshotItemLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.text,
    marginBottom: 3,
  },
  snapshotBody: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMid,
  },
});
