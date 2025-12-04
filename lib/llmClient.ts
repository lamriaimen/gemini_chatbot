import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(apiKey);

export class LLMClient {
  private model: GenerativeModel;
  private temperature: number;
  private maxTokens: number;

  constructor(
    modelName: string = 'gemini-2.5-flash',
    temperature: number = 0.7,
    maxTokens: number = 2048
  ) {
    this.model = genAI.getGenerativeModel({ model: modelName });
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  async *streamChat(
    messages: Array<{ role: string; content: string }>
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Convert messages to Gemini format
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
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
