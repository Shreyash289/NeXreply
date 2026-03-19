const memoryStore = {};

export function getMemory(userId) {
  return memoryStore[userId] || [];
}

export function updateMemory(userId, userMsg, botReply) {
  if (!memoryStore[userId]) memoryStore[userId] = [];

  memoryStore[userId].push({ role: "user", content: userMsg });
  memoryStore[userId].push({ role: "assistant", content: botReply });

  memoryStore[userId] = memoryStore[userId].slice(-10);
}
