import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme/tokens";
import { ReviewStep } from "../types/app";

const steps: ReviewStep[] = ["obj", "reflect", "scoring", "summary", "locked"];

interface ProgressPipsProps {
  currentStep: ReviewStep;
}

export function ProgressPips({ currentStep }: ProgressPipsProps) {
  const currentIndex = steps.indexOf(currentStep);
  return (
    <View style={styles.row}>
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const current = step === currentStep;
        return (
          <View
            key={step}
            style={[
              styles.pip,
              done && styles.donePip,
              current && styles.currentPip,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pip: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  donePip: {
    backgroundColor: colors.green,
  },
  currentPip: {
    width: 20,
    backgroundColor: colors.accent,
  },
});
