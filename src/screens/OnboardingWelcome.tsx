import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/ui";
import { colors, fonts, spacing } from "../theme/tokens";

interface OnboardingWelcomeProps {
  onBeginSetup: () => void;
}

const principles = [
  "Week > Day",
  "Judgment > Tracking",
  "Trends > Perfection",
  "No dopamine mechanics",
];

export function OnboardingWelcome({ onBeginSetup }: OnboardingWelcomeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Weekly</Text>
      <Text style={styles.tagline}>
        Replace vague "rolling life" with discrete, graded weeks that compound
        into long-term self-awareness.
      </Text>
      <View style={styles.principlesGrid}>
        {principles.map((text) => (
          <View key={text} style={styles.principle}>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.principleText}>{text}</Text>
          </View>
        ))}
      </View>
      <AppButton label="Begin Setup" onPress={onBeginSetup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logo: {
    fontFamily: fonts.serifItalic,
    fontSize: 52,
    color: colors.accent,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  principlesGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  principle: {
    backgroundColor: colors.bgCard,
    borderRadius: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  arrow: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
  },
  principleText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMid,
  },
});
