import React from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BarChart } from "../components/BarChart";
import { HevyPanel } from "../components/HevyPanel";
import { Card } from "../components/ui";
import {
  dashboardMetrics,
  scoreChartSeries,
  sectorTrendRows,
  trainingChartSeries,
} from "../data/demoData";
import { colors, fonts, spacing } from "../theme/tokens";

interface DashboardTabProps {
  desktopMode?: boolean;
}

export function DashboardTab({ desktopMode = false }: DashboardTabProps) {
  const { width } = useWindowDimensions();
  const showDesktopGrid = desktopMode && width >= 980;

  const primaryContent = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Raw data over weeks. No advice. No alerts.</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Overall Score - 6 Weeks</Text>
        <BarChart
          values={scoreChartSeries.values}
          labels={scoreChartSeries.labels}
          max={scoreChartSeries.max}
          color={colors.accent}
          height={118}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Weight (kg)</Text>
        <Row label="Current" value={dashboardMetrics.weight.current} delta="-0.4" />
        <Row label="4-week avg" value={dashboardMetrics.weight.average} />
        <Row label="Start" value={dashboardMetrics.weight.start} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Training Sessions / Week</Text>
        <BarChart
          values={trainingChartSeries.values}
          labels={trainingChartSeries.labels}
          max={trainingChartSeries.max}
          color={colors.green}
          height={118}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Sleep (hrs avg)</Text>
        <Row label="This week" value={dashboardMetrics.sleep.current} delta="+0.3" />
        <Row label="6-week avg" value={dashboardMetrics.sleep.average} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Sector Trends - 6 Weeks</Text>
        <View style={styles.trendList}>
          {sectorTrendRows.map((row) => {
            const toneColor = row.tone === "green" ? colors.green : colors.amber;
            return (
              <View key={row.label} style={styles.trendRow}>
                <Text style={styles.trendIcon}>{row.icon}</Text>
                <Text style={styles.trendLabel}>{row.label}</Text>
                <View style={styles.trendTrack}>
                  <View
                    style={[
                      styles.trendFill,
                      { width: `${(row.score / 10) * 100}%`, backgroundColor: toneColor },
                    ]}
                  />
                </View>
                <Text style={[styles.trendScore, { color: toneColor }]}>
                  {row.score.toFixed(1)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    </>
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {showDesktopGrid ? (
        <View style={styles.desktopGrid}>
          <View style={styles.primaryCol}>{primaryContent}</View>
          <View style={styles.sideCol}>
            <HevyPanel desktopMode={desktopMode} />
          </View>
        </View>
      ) : (
        <>
          {primaryContent}
          <HevyPanel desktopMode={desktopMode} />
        </>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueWrap}>
        <Text style={styles.rowValue}>{value}</Text>
        {delta ? (
          <Text
            style={[
              styles.rowDelta,
              delta.startsWith("+") ? styles.deltaUp : styles.deltaDown,
            ]}
          >
            {" "}
            {delta}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 32,
    gap: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  rowLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
  },
  rowValueWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: colors.text,
  },
  rowDelta: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  deltaUp: {
    color: colors.green,
  },
  deltaDown: {
    color: colors.accent,
  },
  trendList: {
    gap: spacing.sm,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  trendIcon: {
    fontSize: 13,
  },
  trendLabel: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.text,
  },
  trendTrack: {
    flex: 2,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  trendFill: {
    height: "100%",
    borderRadius: 999,
  },
  trendScore: {
    fontFamily: fonts.mono,
    fontSize: 11,
    width: 30,
    textAlign: "right",
  },
  desktopGrid: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  primaryCol: {
    flex: 3,
  },
  sideCol: {
    flex: 2,
  },
});
