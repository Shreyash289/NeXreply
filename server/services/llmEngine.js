import { detectIntentAdvanced } from "../utils/intentDetector.js";
import { buildAdvancedPrompt } from "../utils/promptBuilder.js";
import { getMemory, updateMemory } from "../utils/memoryManager.js";
import { calculateOffer } from "../utils/negotiationEngine.js";
import { getProductFromMessage } from "../utils/productData.js";

const DEFAULT_GEMINI_MODEL = "text-bison-001";

function buildGeminiPrompt(messages) {
  return messages
    .map((msg) => {
      const role = msg.role ? msg.role.toUpperCase() : "USER";
      return `${role}: ${msg.content}`;
    })
    .join("\n\n");
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  const oauthToken = process.env.GEMINI_OAUTH_TOKEN;
  if (!apiKey && !oauthToken) {
    throw new Error("Missing GEMINI_API_KEY or GEMINI_OAUTH_TOKEN on server.");
  }

  const apiUrl = process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta2";
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  let url = `${apiUrl}/models/${model}:generateText`;
  const headers = { "Content-Type": "application/json" };

  if (oauthToken) {
    headers.Authorization = `Bearer ${oauthToken}`;
  } else {
    url = `${url}?key=${encodeURIComponent(apiKey)}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: { text: prompt },
      temperature: 0.7,
      maxOutputTokens: 512,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data.error?.message || data.error || "Unknown Gemini API error";
    const err = new Error(`Gemini API error: ${msg}`);
    err.code = data.error?.code || response.status;
    throw err;
  }

  const generated = data?.candidates?.[0]?.content;
  if (!generated) {
    throw new Error("Gemini returned empty response.");
  }
  return generated;
}

export async function processNeXreplyMessage(userMessage, userId) {
  const memory = getMemory(userId);
  const intent = detectIntentAdvanced(userMessage);

  const product = getProductFromMessage(userMessage);
  let negotiationData = null;
  if (intent === "negotiation" && product) {
    negotiationData = calculateOffer(product);
  }

  const messages = buildAdvancedPrompt({
    userMessage,
    intent,
    context: { product },
    memory,
    negotiationData,
  });

  const prompt = buildGeminiPrompt(messages);
  const reply = await callGemini(prompt);

  updateMemory(userId, userMessage, reply);

  return { reply, intent, product };
}

