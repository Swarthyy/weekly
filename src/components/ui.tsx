import React, { PropsWithChildren } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, fonts, radius, spacing } from "../theme/tokens";

type ButtonVariant = "primary" | "ghost" | "bridge";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  style,
  textStyle,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "ghost" && styles.ghostButton,
        variant === "bridge" && styles.bridgeButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <Text style={[styles.buttonIcon, textStyle]}>{icon}</Text> : null}
      <Text
        style={[
          styles.buttonText,
          variant === "primary" && styles.primaryButtonText,
          variant !== "primary" && styles.secondaryButtonText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

interface FadeLabelProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export function FadeLabel({ text, style }: FadeLabelProps) {
  return <Text style={[styles.fadeLabel, style]}>{text}</Text>;
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  bridgeButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  buttonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  primaryButtonText: {
    color: colors.white,
  },
  secondaryButtonText: {
    color: colors.textMid,
  },
  buttonIcon: {
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  fadeLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: colors.textLight,
    marginBottom: spacing.md,
  },
});
