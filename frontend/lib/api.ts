import { Message, SendMessageResponse, MessagesResponse, Session, SessionsResponse } from '@/types/chat';
import { API_TIMEOUT, ERROR_MESSAGES } from './constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function handleApiError(error: unknown, defaultMessage: string): never {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT);
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(ERROR_MESSAGES.CONNECTION_ERROR);
    }
    throw error;
  }
  throw new Error(defaultMessage);
}

async function createApiRequest(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT.DEFAULT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || response.statusText);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchMessages(sessionId?: string): Promise<Message[]> {
  try {
    const url = sessionId 
      ? `${API_URL}/api/messages?sessionId=${encodeURIComponent(sessionId)}`
      : `${API_URL}/api/messages`;
    
    const response = await createApiRequest(url, {}, API_TIMEOUT.DEFAULT);
    const data: MessagesResponse = await response.json();
    return data.messages.map(msg => ({
      ...msg,
      createdAt: msg.createdAt ? new Date(msg.createdAt) : undefined,
    }));
  } catch (error) {
    handleApiError(error, 'Failed to fetch messages');
  }
}

export async function sendMessage(content: string, sessionId?: string): Promise<SendMessageResponse> {
  try {
    const response = await createApiRequest(
      `${API_URL}/api/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, sessionId }),
      },
      API_TIMEOUT.AI_RESPONSE
    );

    const data: SendMessageResponse = await response.json();
    return {
      ...data,
      userMessage: {
        ...data.userMessage,
        createdAt: data.userMessage.createdAt ? new Date(data.userMessage.createdAt) : undefined,
      },
      aiMessage: {
        ...data.aiMessage,
        createdAt: data.aiMessage.createdAt ? new Date(data.aiMessage.createdAt) : undefined,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.AI_TIMEOUT);
      }
      if (error.message.includes('404')) {
        throw new Error(ERROR_MESSAGES.MODEL_NOT_FOUND);
      }
      if (error.message.includes('503')) {
        throw new Error(ERROR_MESSAGES.OLLAMA_UNAVAILABLE);
      }
      if (error.message.includes('504')) {
        throw new Error(ERROR_MESSAGES.OLLAMA_TIMEOUT);
      }
    }
    handleApiError(error, 'Failed to send message');
  }
}

export async function clearMessages(sessionId?: string): Promise<void> {
  try {
    const url = sessionId 
      ? `${API_URL}/api/messages?sessionId=${encodeURIComponent(sessionId)}`
      : `${API_URL}/api/messages`;
    
    await createApiRequest(url, { method: 'DELETE' }, API_TIMEOUT.DEFAULT);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(ERROR_MESSAGES.TIMEOUT_RETRY);
    }
    handleApiError(error, 'Failed to clear messages');
  }
}

export async function fetchSessions(): Promise<Session[]> {
  try {
    const response = await createApiRequest(`${API_URL}/api/sessions`, {}, API_TIMEOUT.DEFAULT);
    const data: SessionsResponse = await response.json();
    return data.sessions.map(session => ({
      ...session,
      createdAt: new Date(session.createdAt),
    }));
  } catch (error) {
    handleApiError(error, 'Failed to fetch sessions');
  }
}

export function createSession(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

