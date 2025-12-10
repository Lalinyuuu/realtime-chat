'use client';

import { useState, useEffect } from 'react';
import { createSession } from '@/lib/api';
import { useChat } from '@/hooks/useChat';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import LoadingIndicator from '@/components/LoadingIndicator';
import LeftSidebar from '@/components/LeftSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { AlertTriangle, X, Menu, Trash2, Sparkles } from 'lucide-react';

export default function Home() {
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  
  const {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    error,
    showClearModal,
    loadMessages,
    loadSessions,
    handleSendMessage,
    handleSelectConversation,
    handleNewChat,
    handleClearClick,
    handleConfirmClear,
    setError,
    setShowClearModal,
  } = useChat();

  const { messagesEndRef } = useAutoScroll(messages.length, isLoading);

  useEffect(() => {
    loadSessions().then((loadedSessions) => {
      if (loadedSessions.length > 0) {
        loadMessages(loadedSessions[0].id);
      } else {
        createSession();
      }
    });
  }, [loadSessions, loadMessages]);

  return (
    <>
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
        title="Clear Chat"
        message="Are you sure you want to clear all messages? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
      />

      <div className="flex h-screen overflow-hidden bg-black-1">
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-3 ${
            showLeftSidebar ? 'w-[260px] min-w-[260px]' : 'w-0 min-w-0'
          }`}
        >
          <LeftSidebar 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onNewChat={handleNewChat}
            onSelectConversation={handleSelectConversation}
            activeItem="chat" 
          />
        </div>

        <div className="flex-1 flex flex-col bg-black-2">
          <header className="px-4 md:px-6 py-3.5 border-b border-gray-3 bg-black-2/95 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                showLeftSidebar 
                  ? 'text-orange-2 bg-orange-2/10 hover:bg-orange-2/15' 
                  : 'text-gray-9 hover:bg-gray-3 hover:text-gray-10'
              } cursor-pointer active:scale-95`}
              aria-label={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 flex-1 justify-center px-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-2 shadow-lg shadow-orange-2/20">
                <Sparkles className="w-4 h-4 text-white-1" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-10 leading-tight">
                  Mini Chat App
                </span>
                <span className="text-[10px] text-gray-8 leading-tight tracking-wide uppercase">
                  Powered by Ollama
                </span>
              </div>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={handleClearClick}
                disabled={isLoading}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  isLoading
                    ? 'text-gray-7 cursor-not-allowed opacity-50'
                    : 'text-gray-9 hover:bg-red-4/10 hover:text-red-3 active:scale-95 cursor-pointer group'
                }`}
                title="Clear chat"
                aria-label="Clear chat"
              >
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto dark-scrollbar bg-black-2">
            <ChatContainer messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>

          {error && (
            <div className="px-4 py-3 border-t border-gray-3 bg-red-1 text-red-3 text-sm flex justify-between items-center animate-slide-down">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{error}</span>
              </span>
              <button
                onClick={() => setError(null)}
                className="bg-transparent border-none cursor-pointer px-2 transition-colors rounded-lg w-8 h-8 flex items-center justify-center text-gray-8 hover:text-white-1 hover:bg-gray-3"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {isLoading && <LoadingIndicator />}

          <ChatInput onSend={handleSendMessage} disabled={isLoading} />

          <div ref={messagesEndRef} />
        </div>
      </div>
    </>
  );
}

