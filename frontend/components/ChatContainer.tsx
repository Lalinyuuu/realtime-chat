import { Message } from '@/types/chat';
import ChatMessage from './ChatMessage';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export default function ChatContainer({ messages, onSendMessage, isLoading = false, messagesEndRef }: ChatContainerProps) {
  const suggestedQuestions = [
    "What can you help me with?",
    "Tell me a fun fact",
    "Explain how AI works",
    "Write a short story"
  ];

  return (
    <div className="flex-1 overflow-y-auto py-4 min-h-0 bg-black-2">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 max-w-2xl mx-auto">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-2 text-gray-10">
              How can I help you today?
            </h2>
            <p className="text-sm mb-6 text-gray-9">
              Ask me anything and I'll do my best to help.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onSendMessage && !isLoading) {
                      onSendMessage(question);
                    }
                  }}
                  disabled={isLoading}
                  className={`px-4 py-3 rounded-lg text-left transition-colors disabled:cursor-not-allowed text-sm border ${
                    isLoading 
                      ? 'bg-gray-3 text-gray-9 border-gray-4 opacity-60' 
                      : 'bg-gray-2 text-white-1 border-gray-4 hover:bg-gray-3 cursor-pointer'
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <ChatMessage key={message.id || index} message={message} />
          ))}
          {messagesEndRef && <div ref={messagesEndRef} className="h-4" />}
        </>
      )}
    </div>
  );
}
