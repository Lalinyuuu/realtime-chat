export interface Message {
  id?: string;
  role: 'user' | 'ai';
  content: string;
  createdAt?: Date;
  sessionId?: string;
}

export interface Session {
  id: string;
  title: string;
  messageCount: number;
  lastMessage: string;
  createdAt: Date;
}

export interface SendMessageResponse {
  sessionId?: string;
  userMessage: Message;
  aiMessage: Message;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface SessionsResponse {
  sessions: Session[];
}

