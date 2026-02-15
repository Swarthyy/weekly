import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/ui";
import { analyzeFoodText } from "../services/api";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { DailyLog } from "../types/app";

interface CaptureTabProps {
  onAddDailyLog: (log: DailyLog) => void;
}

const quickFoods = [
  { label: "Protein Shake", calories: 210, protein: 30, emoji: "🥤" },
  { label: "Coffee", calories: 5, protein: 0, emoji: "☕" },
  { label: "Chicken Rice", calories: 620, protein: 45, emoji: "🍗" },
  { label: "Eggs x3", calories: 210, protein: 18, emoji: "🥚" },
  { label: "Oats", calories: 300, protein: 10, emoji: "🥣" },
  { label: "Banana", calories: 105, protein: 1, emoji: "🍌" },
];

export function CaptureTab({ onAddDailyLog }: CaptureTabProps) {
  const [foodInput, setFoodInput] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [lastAdded, setLastAdded] = useState("");

  const addQuick = (item: { label: string; calories: number; protein: number }) => {
    onAddDailyLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "quick_add",
      item: item.label,
      calories: item.calories,
      protein: item.protein,
      createdAt: new Date().toISOString(),
      confidence: 1,
    });
    setLastAdded(item.label);
    setTimeout(() => setLastAdded(""), 1500);
  };

  const analyzeText = async () => {
    if (!foodInput.trim()) return;
    setLoading(true);
    setErrorText("");
    try {
      const parsed = await analyzeFoodText(foodInput.trim());
      onAddDailyLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "food",
        item: parsed.item,
        calories: parsed.calories,
        protein: parsed.protein,
        createdAt: new Date().toISOString(),
        confidence: parsed.confidence,
      });
      setFoodInput("");
      setLastAdded(parsed.item);
      setTimeout(() => setLastAdded(""), 1500);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Food parsing failed");
    } finally {
      setLoading(false);
    }
  };

  const saveVoice = () => {
    if (!voiceInput.trim()) return;
    onAddDailyLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "voice",
      item: `Voice: ${voiceInput.trim().slice(0, 60)}`,
      calories: 0,
      protein: 0,
      createdAt: new Date().toISOString(),
    });
    setVoiceInput("");
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Capture</Text>
        <Text style={styles.subtitle}>Fast logging. No gram counting.</Text>
      </View>

      {/* Toast */}
      {lastAdded ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Added {lastAdded}</Text>
        </View>
      ) : null}

      {/* Quick Add */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>QUICK ADD</Text>
        <View style={styles.chipGrid}>
          {quickFoods.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => addQuick(item)}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            >
              <Text style={styles.chipEmoji}>{item.emoji}</Text>
              <View>
                <Text style={styles.chipLabel}>{item.label}</Text>
                <Text style={styles.chipMeta}>{item.calories} cal · {item.protein}g</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Natural Language */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Describe your meal</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={foodInput}
            onChangeText={setFoodInput}
            placeholder='"Big Mac and a shake"'
            placeholderTextColor={colors.textLight}
            returnKeyType="send"
            onSubmitEditing={analyzeText}
          />
          <Pressable
            onPress={analyzeText}
            style={({ pressed }) => [
              styles.sendBtn,
              (!foodInput.trim() || loading) && styles.sendBtnDisabled,
              pressed && styles.sendBtnPressed,
            ]}
            disabled={!foodInput.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.sendIcon}>→</Text>
            )}
          </Pressable>
        </View>
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </Card>

      {/* Voice Note */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quick note</Text>
        <TextInput
          style={[styles.input, styles.voiceInput]}
          multiline
          textAlignVertical="top"
          value={voiceInput}
          onChangeText={setVoiceInput}
          placeholder="Drop a thought, observation, or voice-note transcript..."
          placeholderTextColor={colors.textLight}
        />
        {voiceInput.trim() ? (
          <Pressable onPress={saveVoice} style={styles.saveNoteBtn}>
            <Text style={styles.saveNoteBtnText}>Save Note</Text>
          </Pressable>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 40, gap: spacing.md },
  header: { marginBottom: spacing.xs },
  greeting: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 30,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Toast
  toast: {
    backgroundColor: colors.green,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
  },
  toastText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.white,
  },

  // Sections
  section: {},
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },

  // Chips
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    minWidth: "45%",
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "45%",
  },
  chipPressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipEmoji: {
    fontSize: 18,
  },
  chipLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
  },
  chipMeta: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },

  // Card
  card: {},
  cardTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.white,
    fontFamily: fonts.sansMedium,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.accent,
    marginTop: spacing.sm,
  },

  // Voice input
  voiceInput: {
    minHeight: 90,
    paddingTop: 12,
  },
  saveNoteBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgDark,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveNoteBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.white,
  },
});
