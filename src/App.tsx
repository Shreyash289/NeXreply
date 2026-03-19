import { useState, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatBox from './components/ChatBox';
import { sendMessage } from './services/api';
import { createConversation, saveMessage, loadMessages } from './services/database';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const getUserId = () => {
  let userId = localStorage.getItem('nexreply_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('nexreply_user_id', userId);
  }
  return userId;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userId] = useState(getUserId());

  useEffect(() => {
    const initConversation = async () => {
      const conversation = await createConversation(userId);
      if (conversation) {
        setConversationId(conversation.id);
        const savedMessages = await loadMessages(conversation.id);
        const formattedMessages = savedMessages.map((msg) => ({
          id: msg.id,
          text: msg.text,
          isUser: msg.is_user,
          timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        setMessages(formattedMessages);
      }
    };

    initConversation();
  }, [userId]);

  const handleSendMessage = async (text: string) => {
    if (!conversationId) return;

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    await saveMessage(conversationId, text, true);

    try {
      const reply = await sendMessage(text, userId);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
      await saveMessage(conversationId, reply, false);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn\'t process your message. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(conversationId, errorMessage.text, false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[700px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl shadow-fuchsia-900/20 overflow-hidden flex flex-col border border-slate-700/50">
        <ChatHeader />
        <ChatBox messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
