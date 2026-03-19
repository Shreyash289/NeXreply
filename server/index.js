import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { processNeXreplyMessage } from "../services/llmEngine.js";

// Ensure we load the project's root `.env` regardless of the current working directory.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

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
    const isMissingOpenAiKey = err?.message?.includes("Missing OPENAI_API_KEY");
    const reply = isMissingOpenAiKey
      ? "Server misconfigured: OPENAI_API_KEY is missing."
      : "Sorry, I couldn't process your message.";
    return res.status(500).json({ reply });
  }
});

app.post("/webhook", async (req, res) => {
  // Twilio will send Body and From in urlencoded body.
  const userMessage = req.body?.Body;
  const from = req.body?.From;

  console.log("[NeXreply][/webhook] incoming:", { from, body: req.body });

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
    const { reply } = await processNeXreplyMessage(userMessage, from);
    const xml = `<Response><Message>${escapeXml(reply)}</Message></Response>`;
    console.log("[NeXreply][/webhook] reply:", { from, reply });
    return res.status(200).type("text/xml").send(xml);
  } catch (err) {
    console.error(err);
    const isMissingOpenAiKey = err?.message?.includes("Missing OPENAI_API_KEY");
    const fallbackText = isMissingOpenAiKey
      ? "Server misconfigured: OPENAI_API_KEY is missing."
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

