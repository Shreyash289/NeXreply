import OpenAI from "openai";

import { detectIntentAdvanced } from "../utils/intentDetector.js";
import { buildAdvancedPrompt } from "../utils/promptBuilder.js";
import { getMemory, updateMemory } from "../utils/memoryManager.js";
import { calculateOffer } from "../utils/negotiationEngine.js";
import { getProductFromMessage } from "../utils/productData.js";

export async function processNeXreplyMessage(userMessage, userId) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY on server.");
  }

  // NeXreply is stateful per user via in-memory "memoryManager" store.
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

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });

  const reply = response.choices[0]?.message?.content ?? "";
  updateMemory(userId, userMessage, reply);

  return { reply, intent, product };
}

