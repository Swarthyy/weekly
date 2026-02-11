import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../components/ui";
import { colors, fonts, spacing } from "../theme/tokens";

interface OnboardingRitualProps {
  onStart: () => void;
  onBack: () => void;
}

const ritualItems = [
  "Reviews happen weekly on your chosen day",
  "Reviews are locked once submitted",
  "Scores matter over time, not week-to-week",
  "This is a long-term system",
];

export function OnboardingRitual({ onStart, onBack }: OnboardingRitualProps) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>The Review Ritual</Text>
      <Text style={styles.subtitle}>
        Every week, you'll reflect on each sector, receive an AI evaluation, and
        lock your scores into a permanent record.
      </Text>

      <View style={styles.steps}>
        {ritualItems.map((item, index) => (
          <View key={item} style={styles.stepRow}>
            <Text style={styles.stepIndex}>{`${String(index + 1).padStart(
              2,
              "0"
            )}`}</Text>
            <Text style={styles.stepText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.quoteBox}>
        <Text style={styles.quote}>
          "This works if you're honest. It doesn't work if you perform."
        </Text>
      </View>

      <AppButton label="Start Week 7" onPress={onStart} />
      <View style={styles.space} />
      <AppButton label="← Back" variant="ghost" onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 33,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.sans,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  steps: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  stepIndex: {
    fontFamily: fonts.mono,
    fontSize: 10,
    marginTop: 2,
    color: colors.accent,
  },
  stepText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMid,
    flex: 1,
  },
  quoteBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.lg,
    marginBottom: spacing.xl,
  },
  quote: {
    fontFamily: fonts.serifItalic,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textMid,
  },
  space: {
    height: spacing.md,
  },
});
