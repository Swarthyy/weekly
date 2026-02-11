export interface HevyUserInfoResponse {
  data: {
    id: string;
    name: string;
    url: string;
  };
}

export interface HevyWorkoutSet {
  weight_kg: number | null;
  reps: number | null;
}

export interface HevyWorkoutExercise {
  title: string;
  sets: HevyWorkoutSet[];
}

export interface HevyWorkout {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  created_at: string;
  exercises: HevyWorkoutExercise[];
}

export interface HevyWorkoutsResponse {
  page: number;
  page_count: number;
  workouts: HevyWorkout[];
}

export interface HevyWorkoutCountResponse {
  workout_count: number;
}

export interface HevyDashboardSummary {
  user: HevyUserInfoResponse["data"] | null;
  workoutCount: number;
  workouts: HevyWorkout[];
}

function getBaseUrl() {
  return (process.env.EXPO_PUBLIC_HEVY_BASE_URL ?? "https://api.hevyapp.com").replace(
    /\/$/,
    ""
  );
}

async function getJson<T>(path: string, apiKey: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `Hevy request failed (${response.status}). ${bodyText || "No response body"}`
    );
  }

  return (await response.json()) as T;
}

export async function fetchHevyDashboardSummary(
  apiKey: string
): Promise<HevyDashboardSummary> {
  const [userInfo, countInfo, workoutsInfo] = await Promise.all([
    getJson<HevyUserInfoResponse>("/v1/user/info", apiKey),
    getJson<HevyWorkoutCountResponse>("/v1/workouts/count", apiKey),
    getJson<HevyWorkoutsResponse>("/v1/workouts?page=1&pageSize=10", apiKey),
  ]);

  return {
    user: userInfo.data ?? null,
    workoutCount: countInfo.workout_count ?? 0,
    workouts: workoutsInfo.workouts ?? [],
  };
}

export function computeWorkoutVolumeKg(workout: HevyWorkout): number {
  return workout.exercises.reduce((workoutVolume, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setVolume, set) => {
      const weight = set.weight_kg ?? 0;
      const reps = set.reps ?? 0;
      return setVolume + weight * reps;
    }, 0);
    return workoutVolume + exerciseVolume;
  }, 0);
}
