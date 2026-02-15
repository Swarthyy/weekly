import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as Clipboard from "expo-clipboard";
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
} from "@expo-google-fonts/eb-garamond";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "./src/components/BottomNav";
import { TopBar } from "./src/components/TopBar";
import {
  buildBridgeText,
  buildInsights,
  buildSectorScores,
  createEntryMap,
  initialTimelineWeeks,
  starterSectorContracts,
  syncEntriesWithContracts,
  topBarWeekLabel,
} from "./src/data/demoData";
import { OnboardingRitual } from "./src/screens/OnboardingRitual";
import { OnboardingSectors } from "./src/screens/OnboardingSectors";
import { OnboardingWelcome } from "./src/screens/OnboardingWelcome";
import { CaptureTab } from "./src/screens/CaptureTab";
import { ReviewTab } from "./src/screens/ReviewTab";
import { StatusTab } from "./src/screens/StatusTab";
import { TimelineTab } from "./src/screens/TimelineTab";
import { connectHevy, fetchHevySummary, HevySummary } from "./src/services/api";
import { colors } from "./src/theme/tokens";
import {
  AppPhase,
  DailyLog,
  MainTab,
  OnboardingScreen,
  ReviewStep,
  SectorContract,
  TimelineWeek,
  WeeklyEntryMap,
} from "./src/types/app";

type CopyState = "idle" | "copied" | "failed";

export default function App() {
  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_400Regular_Italic,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [appPhase, setAppPhase] = useState<AppPhase>("onboard");
  const [onboardingScreen, setOnboardingScreen] =
    useState<OnboardingScreen>("welcome");
  const [sectorContracts, setSectorContracts] = useState<SectorContract[]>(
    starterSectorContracts
  );
  const [activeTab, setActiveTab] = useState<MainTab>("status");
  const [reviewStep, setReviewStep] = useState<ReviewStep>("obj");
  const [timelineWeeks, setTimelineWeeks] =
    useState<TimelineWeek[]>(initialTimelineWeeks);
  const [entries, setEntries] = useState<WeeklyEntryMap>(() =>
    createEntryMap(starterSectorContracts)
  );
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [hevySummary, setHevySummary] = useState<HevySummary | null>(null);
  const [hevyLoading, setHevyLoading] = useState(false);
  const [desktopMode, setDesktopMode] = useState(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("desktop") === "1";
  });
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEntries((prev) => syncEntriesWithContracts(prev, sectorContracts));
  }, [sectorContracts]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
    };
  }, []);

  const activeSectorCount = useMemo(
    () => sectorContracts.filter((sector) => sector.active).length,
    [sectorContracts]
  );

  const scores = useMemo(
    () => buildSectorScores(sectorContracts, entries),
    [sectorContracts, entries]
  );

  const overallScore = useMemo(() => {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  }, [scores]);

  const insights = useMemo(() => buildInsights(scores), [scores]);

  const enterApp = useCallback(() => {
    setAppPhase("app");
    setActiveTab("status");
    setReviewStep("obj");
  }, []);

  const isSunday = useMemo(() => new Date().getDay() === 0, []);

  const lockWeek = useCallback(() => {
    setReviewStep("locked");
    setTimelineWeeks((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next[0] = {
        ...next[0],
        inProgress: false,
        title: "Strong Foundation",
        score: Number(overallScore.toFixed(1)),
        trend: "up",
      };
      return next;
    });
  }, [overallScore]);

  const copyBridge = useCallback(
    async (includeSensitive: boolean) => {
      const text = buildBridgeText({
        weekLabel: "Week 7 (Feb 3-9, 2026)",
        contracts: sectorContracts,
        entries,
        includeSensitive,
      });

      try {
        await Clipboard.setStringAsync(text);
        setCopyState("copied");
      } catch {
        setCopyState("failed");
      }

      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = setTimeout(() => setCopyState("idle"), 2000);
    },
    [sectorContracts, entries]
  );

  const updatePromptAnswer = useCallback(
    (sectorId: string, promptId: string, value: string | number | string[]) => {
      setEntries((prev) => ({
        ...prev,
        [sectorId]: {
          ...(prev[sectorId] ?? {
            sectorId,
            promptAnswers: {},
            rating: null,
            whatMakesTen: "",
            intention: "",
          }),
          promptAnswers: {
            ...(prev[sectorId]?.promptAnswers ?? {}),
            [promptId]: value,
          },
        },
      }));
    },
    []
  );

  const updateRating = useCallback((sectorId: string, rating: number | null) => {
    setEntries((prev) => ({
      ...prev,
      [sectorId]: {
        ...(prev[sectorId] ?? {
          sectorId,
          promptAnswers: {},
          rating: null,
          whatMakesTen: "",
          intention: "",
        }),
        rating,
      },
    }));
  }, []);

  const updateWhatMakesTen = useCallback((sectorId: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [sectorId]: {
        ...(prev[sectorId] ?? {
          sectorId,
          promptAnswers: {},
          rating: null,
          whatMakesTen: "",
          intention: "",
        }),
        whatMakesTen: value,
      },
    }));
  }, []);

  const updateIntention = useCallback((sectorId: string, value: string) => {
    setEntries((prev) => ({
      ...prev,
      [sectorId]: {
        ...(prev[sectorId] ?? {
          sectorId,
          promptAnswers: {},
          rating: null,
          whatMakesTen: "",
          intention: "",
        }),
        intention: value,
      },
    }));
  }, []);

  const finalizeOnboardingSectors = useCallback((sectors: SectorContract[]) => {
    setSectorContracts(sectors);
    setEntries(createEntryMap(sectors));
    setOnboardingScreen("ritual");
  }, []);

  const addDailyLog = useCallback((log: DailyLog) => {
    setDailyLogs((prev) => [...prev, log]);
  }, []);

  const refreshHevySummary = useCallback(async () => {
    setHevyLoading(true);
    try {
      const summary = await fetchHevySummary();
      setHevySummary(summary);
    } catch {
      setHevySummary((prev) => prev ?? { connected: false, workoutCount: 0, lastWorkout: null });
    } finally {
      setHevyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (appPhase !== "app") return;
    refreshHevySummary();
  }, [appPhase, refreshHevySummary]);

  const onConnectHevy = useCallback(async () => {
    await connectHevy();
    setTimeout(() => {
      refreshHevySummary();
    }, 1000);
  }, [refreshHevySummary]);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loaderShell}>
          <ActivityIndicator color={colors.accent} />
          <StatusBar style="dark" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <View style={[styles.appShell, desktopMode && styles.appShellDesktop]}>
          {appPhase === "onboard" ? (
            <>
              {onboardingScreen === "welcome" && (
                <OnboardingWelcome onBeginSetup={() => setOnboardingScreen("sectors")} />
              )}
              {onboardingScreen === "sectors" && (
                <OnboardingSectors
                  onFinalizeSectors={finalizeOnboardingSectors}
                  onBack={() => setOnboardingScreen("welcome")}
                />
              )}
              {onboardingScreen === "ritual" && (
                <OnboardingRitual
                  onStart={enterApp}
                  onBack={() => setOnboardingScreen("sectors")}
                />
              )}
            </>
          ) : (
            <>
              <TopBar
                weekLabel={`${topBarWeekLabel} · ${activeSectorCount} sectors`}
              />
              <View style={styles.screenContainer}>
                {activeTab === "status" && (
                  <StatusTab
                    isSunday={isSunday}
                    onBeginReview={() => setActiveTab("review")}
                    onConnectHevy={onConnectHevy}
                    hevySummary={hevySummary}
                    hevyLoading={hevyLoading}
                    dailyLogs={dailyLogs}
                    caloriesTarget={2800}
                    proteinTarget={180}
                  />
                )}
                {activeTab === "capture" && <CaptureTab onAddDailyLog={addDailyLog} />}
                {activeTab === "review" && (
                  <ReviewTab
                    step={reviewStep}
                    onStepChange={setReviewStep}
                    sectors={sectorContracts}
                    entries={entries}
                    scores={scores}
                    insights={insights}
                    overallScore={overallScore}
                    onPromptAnswerChange={updatePromptAnswer}
                    onRatingChange={updateRating}
                    onWhatMakesTenChange={updateWhatMakesTen}
                    onIntentionChange={updateIntention}
                    onLockWeek={lockWeek}
                    copyState={copyState}
                    onCopyBridge={copyBridge}
                  />
                )}
                {activeTab === "vault" && <TimelineTab weeks={timelineWeeks} />}
              </View>
              <BottomNav
                activeTab={activeTab === "review" ? "status" : activeTab}
                onTabChange={setActiveTab}
              />
            </>
          )}
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loaderShell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },
  appShell: {
    flex: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: colors.bg,
  },
  appShellDesktop: {
    maxWidth: 1280,
  },
  screenContainer: {
    flex: 1,
    paddingBottom: 88,
  },
});
