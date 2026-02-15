import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MainTab } from "../types/app";
import { colors, fonts, radius, shadow, spacing } from "../theme/tokens";

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const navItems: { id: MainTab; label: string; icon: string; activeIcon: string }[] = [
  { id: "status", label: "Status", icon: "◯", activeIcon: "◉" },
  { id: "capture", label: "Capture", icon: "+", activeIcon: "+" },
  { id: "vault", label: "Vault", icon: "▦", activeIcon: "▦" },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const active = activeTab === item.id;
          const isCapture = item.id === "capture";
          return (
            <Pressable
              key={item.id}
              onPress={() => onTabChange(item.id)}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.pressed,
              ]}
            >
              {isCapture ? (
                <View style={[styles.captureBtn, active && styles.captureBtnActive]}>
                  <Text style={[styles.captureIcon, active && styles.captureIconActive]}>+</Text>
                </View>
              ) : (
                <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                  <Text style={[styles.icon, active && styles.iconActive]}>
                    {active ? item.activeIcon : item.icon}
                  </Text>
                </View>
              )}
              <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
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
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
  },
  container: {
    borderRadius: 20,
    backgroundColor: colors.bgDark,
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    ...shadow.md,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerActive: {
    backgroundColor: "rgba(181, 80, 58, 0.15)",
  },
  icon: {
    fontSize: 16,
    color: "rgba(255,255,255,0.4)",
    fontFamily: fonts.sansMedium,
  },
  iconActive: {
    color: colors.accent,
  },
  captureBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtnActive: {
    backgroundColor: colors.accent,
  },
  captureIcon: {
    fontSize: 20,
    color: "rgba(255,255,255,0.5)",
    fontFamily: fonts.sansLight,
    marginTop: -1,
  },
  captureIconActive: {
    color: colors.white,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.accent,
  },
});
