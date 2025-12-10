'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { MAX_MESSAGE_LENGTH } from '@/lib/constants';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MAX_LENGTH = MAX_MESSAGE_LENGTH;

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled && input.length <= MAX_LENGTH) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remainingChars = MAX_LENGTH - input.length;
  const isOverLimit = input.length > MAX_LENGTH;

  return (
    <div className="px-4 py-3 border-t border-gray-3 bg-black-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            disabled={disabled}
            rows={1}
            maxLength={MAX_LENGTH + 10}
            className={`w-full px-4 py-3 rounded-lg text-sm resize-none outline-none transition-all duration-200 border min-h-[44px] max-h-[200px] ${
              isOverLimit
                ? `border-red-4 text-red-4 ${disabled ? 'bg-gray-3' : 'bg-red-4/10'}`
                : `border-gray-5 text-white-1 ${disabled ? 'bg-gray-3' : 'bg-gray-2'} focus:border-gray-6 focus:bg-gray-3`
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim() || isOverLimit}
          className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors min-w-[60px] h-[44px] flex items-center justify-center border ${
            disabled || !input.trim() || isOverLimit
              ? 'bg-gray-3 text-gray-7 border-gray-4 cursor-not-allowed'
              : 'bg-gray-2 text-gray-10 border-gray-4 hover:bg-gray-3 cursor-pointer'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {isOverLimit && (
        <div className="text-xs mt-2 ml-1 font-medium flex items-center gap-2 animate-shake text-red-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Message must be {MAX_LENGTH} characters or less</span>
        </div>
      )}
    </div>
  );
}

