import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, Session } from '@/types/chat';
import { fetchMessages, sendMessage, clearMessages, fetchSessions, createSession } from '@/lib/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const isLoadingRef = useRef(false);
  const activeRequestsRef = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    if (currentSessionId) {
      setIsLoading(loadingSessions.includes(currentSessionId));
    } else {
      setIsLoading(false);
    }
  }, [currentSessionId, loadingSessions]);

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

    let sessionId = currentSessionId || createSession();
    const isNewSession = !currentSessionId;
    
    if (isNewSession) {
      setCurrentSessionId(sessionId);
      const newSession: Session = {
        id: sessionId,
        title: content.trim().substring(0, 50),
        messageCount: 0,
        lastMessage: '',
        createdAt: new Date(),
      };
      setSessions((prev) => {
        if (prev.some(s => s.id === sessionId)) {
          return [...prev];
        }
        return [newSession, ...prev];
      });
    }

    setLoadingSessions((prev) => {
      if (prev.includes(sessionId)) {
        return [...prev];
      }
      return [...prev, sessionId];
    });
    setIsLoading(true);
    setError(null);

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
      sessionId,
    };
    
    if (sessionId === currentSessionId || !currentSessionId) {
      setMessages((prev) => [...prev, tempUserMessage]);
    }

    const originalSessionId = sessionId;
    try {
      const response = await sendMessage(content, sessionId);
      
      if (response.sessionId && response.sessionId !== sessionId) {
        const newSessionId = response.sessionId;
        setLoadingSessions((prev) => {
          const filtered = prev.filter(id => id !== originalSessionId);
          return filtered.includes(newSessionId) ? filtered : [...filtered, newSessionId];
        });
        setCurrentSessionId(newSessionId);
        sessionId = newSessionId;
      }
      
      const finalSessionId = response.sessionId || sessionId;
      if (finalSessionId === currentSessionId) {
        setMessages((prev) => {
          const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
          return [...withoutTemp, response.userMessage, response.aiMessage];
        });
      } else {
        await loadMessages(finalSessionId);
        if (currentSessionId && currentSessionId !== finalSessionId) {
          await loadMessages(currentSessionId);
        }
      }
      
      await loadSessions();
    } catch (err) {
      if (sessionId === currentSessionId || !currentSessionId) {
        setMessages((prev) => prev.filter(msg => msg.id !== tempUserMessage.id));
      }
      if (sessionId === currentSessionId || !currentSessionId) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      }
      if (isNewSession) {
        setSessions((prev) => prev.filter(s => s.id !== sessionId));
      }
    } finally {
      setLoadingSessions((prev) => prev.filter(id => id !== originalSessionId && id !== sessionId));
    }
  }, [currentSessionId, loadSessions, loadMessages]);

  const handleClearChat = useCallback(async () => {
    try {
      setIsLoading(false);
      
      const oldSessionId = currentSessionId;
      
      if (oldSessionId) {
        try {
          await clearMessages(oldSessionId);
        } catch (err) {
          console.error('Failed to clear messages:', err);
        }
        
        setLoadingSessions((prev) => prev.filter(id => id !== oldSessionId));
        setSessions((prev) => prev.filter(session => session.id !== oldSessionId));
      }
      
      setMessages([]);
      setError(null);
      const newSessionId = createSession();
      setCurrentSessionId(newSessionId);
      
      const newSession: Session = {
        id: newSessionId,
        title: 'New Chat',
        messageCount: 0,
        lastMessage: '',
        createdAt: new Date(),
      };
      setSessions((prev) => [newSession, ...prev]);
      
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new chat');
      setIsLoading(false);
    }
  }, [loadSessions, currentSessionId]);

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
      setMessages([]);
      setCurrentSessionId(null);
      setError(null);
    }
  }, [isLoading]);

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
    loadingSessions,
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
