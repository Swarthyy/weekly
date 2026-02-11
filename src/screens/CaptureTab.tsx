import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton, Card } from "../components/ui";
import { analyzeFoodText } from "../services/api";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { DailyLog } from "../types/app";

interface CaptureTabProps {
  onAddDailyLog: (log: DailyLog) => void;
}

const quickFoods = [
  { label: "Protein Shake", calories: 210, protein: 30 },
  { label: "Coffee", calories: 5, protein: 0 },
  { label: "Chicken Rice", calories: 620, protein: 45 },
];

export function CaptureTab({ onAddDailyLog }: CaptureTabProps) {
  const [foodInput, setFoodInput] = useState("");
  const [voiceInput, setVoiceInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

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
      <View style={styles.header}>
        <Text style={styles.title}>Capture</Text>
        <Text style={styles.subtitle}>Fast logging. No gram counting.</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quick Add Staples</Text>
        <View style={styles.quickGrid}>
          {quickFoods.map((item) => (
            <Pressable key={item.label} onPress={() => addQuick(item)} style={styles.quickChip}>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickMeta}>
                {item.calories} kcal · {item.protein}g
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Natural Language Food Log</Text>
        <TextInput
          style={styles.input}
          value={foodInput}
          onChangeText={setFoodInput}
          placeholder='e.g. "Big Mac and a shake"'
          placeholderTextColor={colors.textLight}
        />
        <View style={styles.space} />
        <AppButton label={loading ? "Analyzing..." : "Analyze Food"} onPress={analyzeText} />
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Analyzing nutrition...</Text>
          </View>
        ) : null}
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Voice Note (Text Proxy)</Text>
        <TextInput
          style={[styles.input, styles.voiceInput]}
          multiline
          textAlignVertical="top"
          value={voiceInput}
          onChangeText={setVoiceInput}
          placeholder="Drop a short voice-note transcript / key thought..."
          placeholderTextColor={colors.textLight}
        />
        <View style={styles.space} />
        <AppButton label="Save Voice Note" variant="ghost" onPress={saveVoice} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 32, gap: spacing.sm },
  header: { marginBottom: spacing.md },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.text },
  subtitle: { fontFamily: fonts.sans, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  card: { marginBottom: spacing.sm },
  cardTitle: { fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.text, marginBottom: spacing.sm },
  quickGrid: { gap: spacing.sm },
  quickChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  quickLabel: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.text },
  quickMeta: { fontFamily: fonts.sans, fontSize: 10, color: colors.textMuted, marginTop: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.text,
  },
  voiceInput: { minHeight: 110 },
  space: { height: spacing.sm },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  loadingText: { fontFamily: fonts.sans, fontSize: 11, color: colors.textMuted },
  errorText: { fontFamily: fonts.sans, fontSize: 11, color: colors.accent, marginTop: spacing.sm },
});
