import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../theme/tokens";

interface BarChartProps {
  values: number[];
  labels: string[];
  max: number;
  color: string;
  height?: number;
}

export function BarChart({
  values,
  labels,
  max,
  color,
  height = 120,
}: BarChartProps) {
  const animatedHeightsRef = useRef<Animated.Value[]>([]);

  if (animatedHeightsRef.current.length !== values.length) {
    animatedHeightsRef.current = values.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    const animations = animatedHeightsRef.current.map((animatedValue, index) => {
      animatedValue.setValue(0);
      const clampedPercent = Math.max((values[index] / max) * 100, 8);
      const targetHeight = (clampedPercent / 100) * height;
      return Animated.timing(animatedValue, {
        toValue: targetHeight,
        duration: 420,
        delay: 100 + index * 80,
        useNativeDriver: false,
      });
    });

    Animated.parallel(animations).start();
  }, [height, max, values]);

  return (
    <View style={[styles.chart, { height }]}>
      {values.map((value, index) => (
        <View key={`${labels[index]}-${index}`} style={styles.barCol}>
          <Text style={styles.valueLabel}>{value}</Text>
          <View style={styles.track}>
            <Animated.View
              style={[
                styles.bar,
                {
                  backgroundColor: color,
                  height: animatedHeightsRef.current[index],
                },
              ]}
            />
          </View>
          <Text style={styles.weekLabel}>{labels[index]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  valueLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMid,
  },
  track: {
    height: "100%",
    width: 22,
    justifyContent: "flex-end",
    borderRadius: 8,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 8,
  },
  weekLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textLight,
  },
});
