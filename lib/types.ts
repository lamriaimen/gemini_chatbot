export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}

export interface StreamingStats {
  tokenCount: number;
  elapsedTime: number;
  tokensPerSecond: number;
}
