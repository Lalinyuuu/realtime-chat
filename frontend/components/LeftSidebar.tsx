'use client';

import { MessageSquare, Plus, Sparkles } from 'lucide-react';
import { Session } from '@/types/chat';
import { useMemo, useState, useEffect } from 'react';

interface LeftSidebarProps {
  sessions?: Session[];
  currentSessionId?: string | null;
  loadingSessions?: string[];
  onNewChat?: () => void;
  onSelectConversation?: (sessionId: string) => void;
  activeItem?: 'chat' | 'settings' | 'about';
}

export default function LeftSidebar({ 
  sessions = [],
  currentSessionId,
  loadingSessions = [],
  onNewChat, 
  onSelectConversation,
  activeItem = 'chat' 
}: LeftSidebarProps) {
  const handleSessionClick = (sessionId: string) => {
    if (onSelectConversation) {
      onSelectConversation(sessionId);
    }
  };

  // Use useState + useEffect to ensure re-render when loadingSessions changes
  const [loadingSessionsSet, setLoadingSessionsSet] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Create new Set to trigger re-render
    setLoadingSessionsSet(new Set(loadingSessions));
  }, [loadingSessions.length, loadingSessions.join(',')]); // Use both length and content to detect changes

  return (
    <div className="w-full h-screen flex flex-col bg-black-2">
      <div className="px-4 py-3 border-b border-gray-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-2">
            <Sparkles className="w-5 h-5 text-white-1" />
          </div>
          <span className="text-sm font-semibold text-gray-10">
            Mini Chat App
          </span>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 overflow-y-auto dark-scrollbar">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-4 text-gray-10 border border-orange-2/20 bg-orange-2/10 hover:bg-orange-2/15 cursor-pointer"
        >
          <Plus className="w-5 h-5 text-orange-2" />
          <span className="text-sm font-medium">New Chat</span>
        </button>

        {sessions.length > 0 ? (
          <div className="space-y-1">
            <div className="px-3 py-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-8">
                Recents
              </span>
            </div>
            {sessions.map((session) => {
              const isSelected = currentSessionId === session.id;
              const isLoading = loadingSessionsSet.has(session.id);
              // Use isLoading and sessions length in key to force re-render when state changes
              return (
                <button
                  key={`${session.id}-${isLoading ? 'loading' : 'idle'}-${sessions.length}-${loadingSessions.length}`}
                  onClick={() => handleSessionClick(session.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors relative cursor-pointer ${
                    isSelected 
                      ? 'border-l-[3px] border-l-orange-2 bg-orange-2/15' 
                      : 'border-l-[3px] border-l-transparent'
                  } ${!isSelected ? 'hover:bg-gray-3' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-orange-2' : 'text-gray-8'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-gray-10' : 'text-gray-9'}`}>
                          {session.title}
                        </p>
                        {isLoading && (
                          <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin border-orange-2 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2 text-gray-8">
                        {isLoading ? 'AI is thinking...' : (session.lastMessage || 'No messages yet')}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <MessageSquare className="w-12 h-12 mb-3 text-gray-7" />
            <p className="text-sm text-gray-8">
              No conversations yet
            </p>
            <p className="text-xs mt-1 text-gray-7">
              Start a new chat to see history here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
