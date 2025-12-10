import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex mb-4 px-4 gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-3 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-5 h-5 text-gray-9" />
        </div>
      )}
      <div
        className={`max-w-[75%] md:max-w-[65%] min-w-[120px] wrap-break-word px-4 py-3 ${
          isUser 
            ? 'bg-orange-2 text-white-1 rounded-lg' 
            : 'bg-gray-3 text-white-1 rounded-lg'
        }`}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-sm">
          {message.content}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-orange-2 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-white-1" />
        </div>
      )}
    </div>
  );
}

