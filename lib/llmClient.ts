import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

messages: Array<{ role: string; content: string }>
  ): AsyncGenerator < string, void, unknown > {
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
    if(chunkText) {
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
