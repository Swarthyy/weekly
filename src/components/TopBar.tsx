import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../theme/tokens";

interface TopBarProps {
  weekLabel: string;
  desktopMode?: boolean;
  onToggleDesktopMode?: () => void;
}

export function TopBar({
  weekLabel,
  desktopMode = false,
  onToggleDesktopMode,
}: TopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.logo}>Weekly</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.weekPill}>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  logo: {
    fontFamily: fonts.serifItalic,
    fontSize: 26,
    color: colors.accent,
    letterSpacing: -0.5,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  weekPill: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  weekLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 0.3,
  },
});
