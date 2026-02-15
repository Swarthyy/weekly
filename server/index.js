const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "20mb" }));

const state = {
  hevy: {
    latestWebhookEvent: null,
    latestWebhookReceivedAt: null,
  },
  withings: {
    latestWebhookEvent: null,
    latestWebhookReceivedAt: null,
    latestAuthCode: null,
    latestAuthState: null,
  },
};

const HEVY_BASE_URL = (process.env.HEVY_BASE_URL || "https://api.hevyapp.com").replace(/\/$/, "");

// Keep credentials in local .env (not committed).
const HARDCODED_HEVY_API_KEY = "";
const HARDCODED_HEVY_WEBHOOK_SECRET = "";

function getHevyApiKey() {
  return process.env.HEVY_API_KEY || HARDCODED_HEVY_API_KEY || "";
}

function getOpenAiApiKey() {
  return process.env.OPENAI_API_KEY || "";
}

/**
 * Detect image media type from the first bytes of a base64-encoded string.
 * Falls back to "image/jpeg" if the signature is unrecognised.
 */
function detectMediaTypeFromBytes(base64Str) {
  const header = base64Str.slice(0, 16);
  try {
    const bytes = Buffer.from(header, "base64");
    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return "image/png";
    }
    // GIF: 47 49 46
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return "image/gif";
    }
    // WEBP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return "image/webp";
    }
    // JPEG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
  } catch {
    // ignore decode errors
  }
  return "image/jpeg";
}

function getWithingsClientId() {
  return process.env.WITHINGS_CLIENT_ID || "";
}

function getWithingsRedirectUri(req) {
  const configured = process.env.WITHINGS_REDIRECT_URI;
  if (configured) return configured;
  return `${req.protocol}://${req.get("host")}/api/auth/withings/callback`;
}

async function hevyGet(path) {
  const apiKey = getHevyApiKey();
  if (!apiKey) {
    throw new Error("HEVY_API_KEY is not configured");
  }
  const response = await fetch(`${HEVY_BASE_URL}${path}`, {
    headers: {
      "api-key": apiKey,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Hevy ${path} failed (${response.status}): ${body}`);
  }
  return response.json();
}

function computeVolumeKg(workout) {
  if (!workout || !Array.isArray(workout.exercises)) return 0;
  return workout.exercises.reduce((workoutSum, exercise) => {
    const setSum = (exercise.sets || []).reduce((sum, set) => {
      const weight = Number(set.weight_kg || 0);
      const reps = Number(set.reps || 0);
      return sum + weight * reps;
    }, 0);
    return workoutSum + setSum;
  }, 0);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.get("/api/hevy/connect-url", (_req, res) => {
  res.json({
    url: "https://hevy.com/settings?developer",
    mode: "env-api-key",
  });
});

app.get("/api/withings/connect-url", (req, res) => {
  const clientId = getWithingsClientId();
  if (!clientId) {
    return res.status(400).json({ error: "WITHINGS_CLIENT_ID is not configured" });
  }

  const redirectUri = getWithingsRedirectUri(req);
  const stateToken = Math.random().toString(36).slice(2);
  const url = new URL("https://account.withings.com/oauth2_user/authorize2");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "user.info,user.metrics");
  url.searchParams.set("state", stateToken);

  return res.json({ url: url.toString(), state: stateToken, redirectUri });
});

app.get("/api/hevy/summary", async (_req, res) => {
  try {
    const [userInfo, countInfo, workoutsInfo] = await Promise.all([
      hevyGet("/v1/user/info"),
      hevyGet("/v1/workouts/count"),
      hevyGet("/v1/workouts?page=1&pageSize=1"),
    ]);

    const lastWorkout = workoutsInfo?.workouts?.[0] || null;
    res.json({
      connected: true,
      user: userInfo?.data || null,
      workoutCount: countInfo?.workout_count || 0,
      lastWorkout: lastWorkout
        ? {
            id: lastWorkout.id,
            title: lastWorkout.title,
            start_time: lastWorkout.start_time || lastWorkout.created_at,
            exercise_count: Array.isArray(lastWorkout.exercises)
              ? lastWorkout.exercises.length
              : 0,
            volume_kg: computeVolumeKg(lastWorkout),
          }
        : null,
    });
  } catch (error) {
    res.status(200).json({
      connected: false,
      workoutCount: 0,
      lastWorkout: null,
      error: error instanceof Error ? error.message : "Hevy summary failed",
    });
  }
});

app.post("/api/webhooks/hevy", (req, res) => {
  const expected = process.env.HEVY_WEBHOOK_SECRET || HARDCODED_HEVY_WEBHOOK_SECRET || "";
  const provided = req.headers.authorization || "";

  if (!expected || provided !== expected) {
    return res.status(401).json({ ok: false, error: "Invalid authorization header" });
  }

  state.hevy.latestWebhookEvent = req.body || null;
  state.hevy.latestWebhookReceivedAt = new Date().toISOString();
  return res.status(200).json({ ok: true });
});

app.get("/api/webhooks/hevy/latest", (_req, res) => {
  res.json({
    latest: state.hevy.latestWebhookEvent,
    receivedAt: state.hevy.latestWebhookReceivedAt,
  });
});

// Withings OAuth callback target: must be publicly reachable and fast 200 for provider test.
app.get("/api/auth/withings/callback", (req, res) => {
  state.withings.latestAuthCode = typeof req.query.code === "string" ? req.query.code : null;
  state.withings.latestAuthState = typeof req.query.state === "string" ? req.query.state : null;
  return res.status(200).send("Withings callback received");
});

app.post("/api/webhooks/withings", (req, res) => {
  state.withings.latestWebhookEvent = req.body || null;
  state.withings.latestWebhookReceivedAt = new Date().toISOString();
  return res.status(200).json({ ok: true });
});

app.get("/api/webhooks/withings/latest", (_req, res) => {
  res.json({
    latest: state.withings.latestWebhookEvent,
    receivedAt: state.withings.latestWebhookReceivedAt,
    latestAuthCode: state.withings.latestAuthCode,
    latestAuthState: state.withings.latestAuthState,
  });
});

app.post("/api/food/analyze-text", async (req, res) => {
  const input = `${req.body?.input || ""}`.trim();
  if (!input) return res.status(400).json({ error: "input is required" });

  const openaiKey = getOpenAiApiKey();
  if (!openaiKey) {
    // deterministic fallback
    return res.json({
      item: input,
      calories: 500,
      protein: 20,
      confidence: 0.25,
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              'You estimate food nutrition quickly. Return strict JSON only with keys: item, calories, protein, confidence. confidence must be 0-1.',
          },
          {
            role: "user",
            content: `Estimate this food entry: ${input}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI text analyze failed (${response.status}): ${body}`);
    }

    const payload = await response.json();
    const text =
      payload.output_text ||
      payload.output?.flatMap((o) => o.content || []).map((c) => c.text).join(" ") ||
      "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("No JSON found in OpenAI response");
    const parsed = JSON.parse(text.slice(start, end + 1));
    return res.json({
      item: parsed.item || input,
      calories: Number(parsed.calories || 0),
      protein: Number(parsed.protein || 0),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence || 0.5))),
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Analysis failed" });
  }
});

app.post("/api/food/analyze-image", async (req, res) => {
  const rawBase64 = `${req.body?.base64Image || ""}`.trim();
  if (!rawBase64) return res.status(400).json({ error: "base64Image is required" });

  // Detect media type from data-URI prefix, magic bytes, or explicit field
  let mediaType = `${req.body?.mediaType || ""}`.trim();
  let base64Data = rawBase64;

  const dataUriMatch = rawBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  if (dataUriMatch) {
    mediaType = mediaType || dataUriMatch[1];
    base64Data = rawBase64.slice(dataUriMatch[0].length);
  }

  if (!mediaType) {
    mediaType = detectMediaTypeFromBytes(base64Data);
  }

  const openaiKey = getOpenAiApiKey();
  if (!openaiKey) {
    return res.json({
      item: "Unknown meal",
      calories: 600,
      protein: 25,
      confidence: 0.2,
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "Analyze food image and return JSON only: {item, calories, protein, confidence}.",
          },
          {
            role: "user",
            content: [
              { type: "input_text", text: "Estimate calories and protein from this meal image." },
              {
                type: "input_image",
                image_url: `data:${mediaType};base64,${base64Data}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI image analyze failed (${response.status}): ${body}`);
    }

    const payload = await response.json();
    const text =
      payload.output_text ||
      payload.output?.flatMap((o) => o.content || []).map((c) => c.text).join(" ") ||
      "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("No JSON found in OpenAI response");
    const parsed = JSON.parse(text.slice(start, end + 1));
    return res.json({
      item: parsed.item || "Unknown meal",
      calories: Number(parsed.calories || 0),
      protein: Number(parsed.protein || 0),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence || 0.5))),
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Image analysis failed" });
  }
});

const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`API server listening on http://${HOST}:${PORT}`);
});
