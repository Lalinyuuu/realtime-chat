import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, Session } from '@/types/chat';
import { fetchMessages, sendMessage, clearMessages, fetchSessions, createSession } from '@/lib/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const loadMessages = useCallback(async (sessionId?: string | null) => {
    try {
      setError(null);
      const fetchedMessages = await fetchMessages(sessionId || undefined);
      setMessages(fetchedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  }, []);

  const loadSessions = useCallback(async (): Promise<Session[]> => {
    try {
      const fetchedSessions = await fetchSessions();
      setSessions(fetchedSessions);
      return fetchedSessions;
    } catch {
      return [];
    }
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoadingRef.current) return;

    setIsLoading(true);
    setError(null);

    let sessionId = currentSessionId || createSession();
    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
      sessionId,
    };
    
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await sendMessage(content, sessionId);
      
      if (response.sessionId && response.sessionId !== sessionId) {
        setCurrentSessionId(response.sessionId);
        sessionId = response.sessionId;
      }
      
      setMessages((prev) => {
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        return [...withoutTemp, response.userMessage, response.aiMessage];
      });
      
      await loadSessions();
    } catch (err) {
      setMessages((prev) => prev.filter(msg => msg.id !== tempUserMessage.id));
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, loadSessions]);

  const handleClearChat = useCallback(async () => {
    try {
      setMessages([]);
      setError(null);
      const newSessionId = createSession();
      setCurrentSessionId(newSessionId);
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new chat');
    }
  }, [loadSessions]);

  const handleSelectConversation = useCallback(async (sessionId: string) => {
    try {
      setCurrentSessionId(sessionId);
      await loadMessages(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    }
  }, [loadMessages]);

  const handleNewChat = useCallback(() => {
    if (!isLoading) {
      handleClearChat();
    }
  }, [isLoading, handleClearChat]);

  const handleClearClick = useCallback(() => {
    if (messages.length > 0 && !isLoading) {
      setShowClearModal(true);
    }
  }, [messages.length, isLoading]);

  const handleConfirmClear = useCallback(() => {
    handleClearChat();
    setShowClearModal(false);
  }, [handleClearChat]);

  return {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    error,
    showClearModal,
    loadMessages,
    loadSessions,
    handleSendMessage,
    handleClearChat,
    handleSelectConversation,
    handleNewChat,
    handleClearClick,
    handleConfirmClear,
    setError,
    setShowClearModal,
  };
}
