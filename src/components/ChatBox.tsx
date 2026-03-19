import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatBox({ messages, onSendMessage, isLoading }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={32} className="text-pink-400" />
              </div>
              <p className="text-slate-300 text-center text-lg font-medium">
                Start your conversation
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Ask about products, pricing, or anything else
              </p>
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-sm"></div>
                <div className="w-2 h-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-sm"></div>
                <div className="w-2 h-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-sm"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-slate-800 text-slate-100 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg border border-slate-700">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-5 py-3 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-slate-900 disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-pink-600 to-pink-500 text-white p-3 rounded-full hover:from-pink-500 hover:to-pink-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-pink-500/50 disabled:shadow-none"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
