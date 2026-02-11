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
      <View>
        <Text style={styles.logo}>Weekly</Text>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
      </View>
      {onToggleDesktopMode ? (
        <Pressable onPress={onToggleDesktopMode} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {desktopMode ? "Desktop On" : "Desktop Off"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: fonts.serifItalic,
    fontSize: 28,
    color: colors.accent,
    letterSpacing: -0.5,
  },
  weekLabel: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -2,
  },
  toggleBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  toggleText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMid,
  },
});
