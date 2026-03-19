export function detectIntentAdvanced(message) {
  const msg = message.toLowerCase();

  if (msg.match(/price|cost|how much|rate/)) return "price_query";
  if (msg.match(/expensive|costly|too high|discount/)) return "negotiation";
  if (msg.match(/buy|order|confirm|take it/)) return "purchase";

  return "general";
}
