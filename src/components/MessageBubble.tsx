interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function MessageBubble({ message, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg transition-all ${
          isUser
            ? 'bg-gradient-to-br from-pink-600 to-pink-500 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message}</p>
        {timestamp && (
          <p className={`text-xs mt-1.5 opacity-70 ${isUser ? 'text-pink-100' : 'text-slate-400'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
