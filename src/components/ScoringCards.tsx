import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { SectorScore } from "../types/app";

interface ScoringCardsProps {
  scores: SectorScore[];
}

export function ScoringCards({ scores }: ScoringCardsProps) {
  const animValuesRef = useRef<Animated.Value[]>([]);

  if (animValuesRef.current.length !== scores.length) {
    animValuesRef.current = scores.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    const animations = animValuesRef.current.map((value, index) => {
      value.setValue(0);
      return Animated.timing(value, {
        toValue: 1,
        duration: 450,
        delay: index * 160,
        useNativeDriver: false,
      });
    });
    Animated.stagger(40, animations).start();
  }, [scores]);

  return (
    <View style={styles.container}>
      {scores.map((score, index) => (
        <View key={score.id} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.sector}>
              <Text style={styles.icon}>{score.icon}</Text>
              <Text style={styles.name}>{score.name}</Text>
            </View>
            <Text style={styles.value}>{score.score.toFixed(1)}</Text>
          </View>
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                {
                  width: animValuesRef.current[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", `${Math.max(6, score.score * 10)}%`],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.rationale}>{score.rationale}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
  },
  value: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: colors.accent,
  },
  barTrack: {
    backgroundColor: colors.border,
    height: 6,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
  rationale: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMid,
    lineHeight: 19,
  },
});
