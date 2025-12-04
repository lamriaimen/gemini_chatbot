import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface LLMClientConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LLMClient {
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMClientConfig = {}) {
    this.model = config.model || 'gemini-1.5-flash';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 2048;
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>
  ): AsyncGenerator<string, void, unknown> {
    try {
      const model = genAI.getGenerativeModel({ 
        model: this.model,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      // Convert messages to Gemini format
      const chat = model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessageStream(lastMessage.content);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error('LLM streaming error:', error);
      throw error;
    }
  }
}

export const llmClient = new LLMClient();
