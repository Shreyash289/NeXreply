export function buildAdvancedPrompt({ userMessage, intent, context, memory, negotiationData }) {

  const system = {
    role: "system",
    content: `You are NeXreply, a highly intelligent WhatsApp sales agent.

Goals:
- Convert leads into customers
- Be persuasive, natural, and human-like
- Handle objections and negotiate smartly

Rules:
- Keep responses short
- Always guide towards purchase`
  };

  const memoryMessages = memory.map(m => ({
    role: m.role,
    content: m.content
  }));

  let dynamicPrompt = "";

  if (intent === "price_query") {
    dynamicPrompt = `Product: ${context.product?.name}\nPrice: ₹${context.product?.price}`;
  }

  if (intent === "negotiation") {
    dynamicPrompt = `Offer a better deal. Suggested price: ₹${negotiationData?.offer}`;
  }

  if (intent === "purchase") {
    dynamicPrompt = `User wants to buy. Ask for confirmation and details.`;
  }

  return [
    system,
    ...memoryMessages,
    { role: "user", content: userMessage + "\n" + dynamicPrompt }
  ];
}
