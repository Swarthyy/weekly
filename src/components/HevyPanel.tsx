import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "./ui";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import {
  computeWorkoutVolumeKg,
  fetchHevyDashboardSummary,
  HevyWorkout,
} from "../services/hevy";

interface HevyPanelProps {
  desktopMode: boolean;
}

export function HevyPanel({ desktopMode }: HevyPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookAuth, setWebhookAuth] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [workoutCount, setWorkoutCount] = useState<number | null>(null);
  const [workouts, setWorkouts] = useState<HevyWorkout[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setApiKey(window.localStorage.getItem("weekly.hevy.apiKey") ?? "");
    setWebhookUrl(window.localStorage.getItem("weekly.hevy.webhookUrl") ?? "");
    setWebhookAuth(window.localStorage.getItem("weekly.hevy.webhookAuth") ?? "");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly.hevy.apiKey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly.hevy.webhookUrl", webhookUrl);
  }, [webhookUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("weekly.hevy.webhookAuth", webhookAuth);
  }, [webhookAuth]);

  const hasApiKey = apiKey.trim().length > 0;

  const webhookPreview = useMemo(
    () =>
      JSON.stringify(
        {
          id: "00000000-0000-0000-0000-000000000001",
          payload: {
            workoutId: "f1085cdb-32b2-4003-967d-53a3af8eaecb",
          },
        },
        null,
        2
      ),
    []
  );

  const loadHevy = async () => {
    if (!hasApiKey) return;

    setLoading(true);
    setErrorText("");
    try {
      const summary = await fetchHevyDashboardSummary(apiKey.trim());
      setUserName(summary.user?.name ?? null);
      setProfileUrl(summary.user?.url ?? null);
      setWorkoutCount(summary.workoutCount);
      setWorkouts(summary.workouts);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      const fallback =
        "Could not load Hevy data. Check API key and CORS. If blocked, use a backend proxy.";
      setErrorText(error instanceof Error ? error.message : fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.heading}>Hevy Link (Dev)</Text>
      <Text style={styles.subheading}>
        Connect your Hevy account for dashboard aggregation. Keep secrets in env or local dev
        only.
      </Text>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Hevy API Key (`api-key` header)</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Paste your Hevy API key"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Webhook URL (update old build URL here)</Text>
        <TextInput
          style={styles.input}
          value={webhookUrl}
          onChangeText={setWebhookUrl}
          placeholder="https://your-new-endpoint/hevyWebhook"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Webhook Authorization Header</Text>
        <TextInput
          style={styles.input}
          value={webhookAuth}
          onChangeText={setWebhookAuth}
          placeholder="Bearer <your-secret>"
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
        />
      </View>

      <Pressable
        onPress={loadHevy}
        style={[styles.loadButton, !hasApiKey && styles.loadButtonDisabled]}
      >
        <Text style={styles.loadButtonText}>{loading ? "Loading..." : "Pull Hevy Data"}</Text>
      </Pressable>

      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

      <View style={styles.metaGrid}>
        <MetaCell label="User" value={userName ?? "Not loaded"} />
        <MetaCell label="Workouts" value={`${workoutCount ?? 0}`} />
        <MetaCell
          label="Last Synced"
          value={lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
        />
      </View>

      {profileUrl ? <Text style={styles.profileUrl}>{profileUrl}</Text> : null}

      {desktopMode ? (
        <View style={styles.previewWrap}>
          <Text style={styles.previewTitle}>Webhook Payload Example</Text>
          <Text style={styles.codeBlock}>{webhookPreview}</Text>
        </View>
      ) : null}

      <Text style={styles.previewTitle}>Recent Workouts</Text>
      <ScrollView style={styles.workoutList} nestedScrollEnabled>
        {workouts.length === 0 ? (
          <Text style={styles.emptyText}>No workouts loaded yet.</Text>
        ) : (
          workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutRow}>
              <View style={styles.flexGrow}>
                <Text style={styles.workoutTitle}>{workout.title || "Untitled workout"}</Text>
                <Text style={styles.workoutMeta}>
                  {new Date(workout.start_time || workout.created_at).toLocaleDateString()} ·{" "}
                  {workout.exercises.length} exercises
                </Text>
              </View>
              <Text style={styles.volumeValue}>{computeWorkoutVolumeKg(workout).toFixed(0)} kg</Text>
            </View>
          ))
        )}
      </ScrollView>
    </Card>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  heading: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  subheading: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  fieldWrap: {
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textMid,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bgInput,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.text,
  },
  loadButton: {
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  loadButtonDisabled: {
    opacity: 0.45,
  },
  loadButtonText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.white,
  },
  errorText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  metaGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  metaLabel: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 3,
  },
  metaValue: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.text,
  },
  profileUrl: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  previewWrap: {
    marginBottom: spacing.sm,
  },
  previewTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textMid,
    marginBottom: 5,
  },
  codeBlock: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMid,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  workoutList: {
    maxHeight: 220,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 8,
  },
  flexGrow: {
    flex: 1,
  },
  workoutTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
  },
  workoutMeta: {
    fontFamily: fonts.sans,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  volumeValue: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMid,
  },
});
