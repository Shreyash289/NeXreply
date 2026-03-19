import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { processNeXreplyMessage } from "../services/llmEngine.js";

// Ensure we load `.env` regardless of the current working directory or deployment layout.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let envLoaded = false;
const envCandidateStatus = [];
const envCandidates = [
  // Repo root: <repo>/.env
  path.join(__dirname, "..", ".env"),
  // Server folder: <repo>/server/.env
  path.join(__dirname, ".env"),
  // Current working directory: (varies by host)
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), "server", ".env"),
];

for (const candidate of envCandidates) {
  const exists = fs.existsSync(candidate);
  envCandidateStatus.push({ candidate, exists });
  if (!exists) continue;
  const result = dotenv.config({ path: candidate });
  // `result.error` can be set even when the file exists.
  if (!result?.error && result?.parsed) {
    console.log(`[NeXreply][env] Loaded .env from: ${candidate}`);
    envLoaded = true;
    break;
  }
  console.log(`[NeXreply][env] Failed to load .env from: ${candidate}`, result?.error);
}

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
// Twilio sends webhook payload as application/x-www-form-urlencoded.
app.use(express.urlencoded({ extended: false }));

app.post("/chat", async (req, res) => {
  const { message, user_id } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ reply: "Please send a valid message." });
  }
  if (!user_id || typeof user_id !== "string") {
    return res.status(400).json({ reply: "Missing user_id." });
  }

  try {
    console.log("[NeXreply][/chat] incoming:", { user_id, message });
    const { reply } = await processNeXreplyMessage(message, user_id);
    console.log("[NeXreply][/chat] reply:", { user_id, reply });
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    const isMissingGeminiKey = err?.message?.includes("Missing GEMINI_API_KEY");
    const isQuotaError = err?.code === "insufficient_quota" || err?.message?.toLowerCase().includes("quota");
    const envStatus = envCandidateStatus
      .map((s) => `${s.exists ? "[found]" : "[notfound]"} ${s.candidate}`)
      .join(" | ");
    const missingKeyMessage = `GEMINI_API_KEY missing. Create a .env in the project root (copy from .env.example) and restart the server. (Loaded .env: ${envLoaded}). Env status: ${envStatus}`;
    const reply = isMissingGeminiKey
      ? missingKeyMessage
      : isQuotaError
        ? "Sorry, my AI engine is out of quota. Please check your Gemini key and plan."
        : "Sorry, I couldn't process your message.";
    return res.status(500).json({ reply });
  }
});

app.post("/webhook", async (req, res) => {
  // Twilio will send Body and From in urlencoded body.
  const userMessage = req.body?.Body;
  const from = req.body?.From;

  console.log("[NeXreply][/webhook] incoming:", { from, body: req.body });
  console.log("[NeXreply][/webhook] GEMINI_API_KEY loaded?", Boolean(process.env.GEMINI_API_KEY));

  if (!userMessage || typeof userMessage !== "string") {
    return res
      .status(400)
      .type("text/xml")
      .send("<Response><Message>Please send a valid WhatsApp message.</Message></Response>");
  }
  if (!from || typeof from !== "string") {
    return res
      .status(400)
      .type("text/xml")
      .send("<Response><Message>Missing sender number.</Message></Response>");
  }

  try {
    const aiPromise = processNeXreplyMessage(userMessage, from);
    const timeoutMs = 11000; // Twilio allows ~15s. Use 11s to avoid socket timeout.
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Webhook timeout")), timeoutMs);
    });

    const { reply: rawReply } = await Promise.race([aiPromise, timeoutPromise]).catch((err) => {
      // Prevent an unhandled rejection if Gemini finishes after our timeout.
      aiPromise.catch(() => {});
      throw err;
    });

    const reply = typeof rawReply === "string" && rawReply.trim().length > 0
      ? rawReply
      : "Sorry, I couldn\'t generate a response. Please try again.";

    const xml = `<Response><Message>${escapeXml(reply)}</Message></Response>`;
    console.log("[NeXreply][/webhook] reply:", { from, reply });
    return res.status(200).type("text/xml").send(xml);
  } catch (err) {
    console.error("[NeXreply][/webhook] ERROR", err?.message || err, err);
    const isMissingGeminiKey = err?.message?.includes("Missing GEMINI_API_KEY");
    const isWebhookTimeout = err?.message?.includes("Webhook timeout");
    const isQuotaError = err?.code === "insufficient_quota" || err?.message?.toLowerCase().includes("quota");
    const envStatus = envCandidateStatus
      .map((s) => `${s.exists ? "[found]" : "[notfound]"} ${s.candidate}`)
      .join(" | ");
    const missingKeyMessage = `GEMINI_API_KEY missing. Create a .env in the project root (copy from .env.example) and restart the server. (Loaded .env: ${envLoaded}). Env status: ${envStatus}`;
    const fallbackText = isMissingGeminiKey
      ? missingKeyMessage
      : isQuotaError
        ? "Sorry, my AI engine is out of quota. Please check your Gemini key and plan."
        : isWebhookTimeout
          ? "Sorry, I'm taking too long to respond. Please try again in a few seconds."
          : "Sorry, I couldn't process your message.";
    const xml = `<Response><Message>${escapeXml(fallbackText)}</Message></Response>`;
    return res.status(200).type("text/xml").send(xml);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NeXreply server listening on port ${PORT}`);
});

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

