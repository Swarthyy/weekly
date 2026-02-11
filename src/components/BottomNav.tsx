import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MainTab } from "../types/app";
import { colors, fonts, radius, shadow, spacing } from "../theme/tokens";

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const navItems: { id: MainTab; label: string; icon: string }[] = [
  { id: "status", label: "Status", icon: "📈" },
  { id: "capture", label: "Capture", icon: "+" },
  { id: "vault", label: "Vault", icon: "🗂" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onTabChange(item.id)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <Text style={[styles.icon, active && styles.activeText]}>{item.icon}</Text>
              <Text style={[styles.label, active && styles.activeText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.lg,
  },
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    flexDirection: "row",
    paddingVertical: 8,
    ...shadow.md,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 15,
    color: colors.textMuted,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  activeText: {
    color: colors.accent,
  },
});
