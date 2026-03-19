import OpenAI from "openai";
import { detectIntentAdvanced } from "./intentDetector.js";
import { buildAdvancedPrompt } from "./promptBuilder.js";
import { getMemory, updateMemory } from "./memoryManager.js";
import { calculateOffer } from "./negotiationEngine.js";

export async function processMessage(userMessage, userId, context = {}) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY on server.");
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const memory = getMemory(userId);
    const intent = detectIntentAdvanced(userMessage);

    let negotiationData = null;
    if (intent === "negotiation" && context.product) {
      negotiationData = calculateOffer(context.product);
    }

    const messages = buildAdvancedPrompt({
      userMessage,
      intent,
      context,
      memory,
      negotiationData
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7
    });

    const reply = response.choices[0].message.content;

    updateMemory(userId, userMessage, reply);

    return { reply, intent };

  } catch (err) {
    console.error(err);
    return { reply: "Something went wrong.", intent: "error" };
  }
}
