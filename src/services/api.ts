import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ChatMessage {
  message: string;
  user_id: string;
}

export interface ChatResponse {
  reply: string;
  timestamp?: string;
}

export const sendMessage = async (message: string, userId: string = 'demo-user'): Promise<string> => {
  try {
    const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, {
      message,
      user_id: userId,
    });
    return response.data.reply;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};
