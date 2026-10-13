import type { LLMProvider, Message, StreamEvent, GenerateResult } from './types';
import { getEffectiveGeminiKey } from '@/lib/keyManager';

export class GeminiProvider implements LLMProvider {
  private effectiveKey: string;

  constructor(
    apiKey?: string,
    private modelId: string = 'gemini-3.8-flash',
  ) {
    this.effectiveKey = getEffectiveGeminiKey(apiKey);
  }

  async *stream(messages: Message[], options?: { signal?: AbortSignal }): AsyncIterable<StreamEvent> {
    if (!this.effectiveKey) {
      throw new Error('No Gemini API key found. Please provide an API key in setup.');
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const contents = nonSystemMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const requestBody: Record<string, unknown> = {
      contents,
    };

    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    const endpoint = 'streamGenerateContent';
    const streamParams = '&alt=sse';
    const model = this.modelId || 'gemini-3.8-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${this.effectiveKey}${streamParams}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429 || errorText.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Gemini API quota or spending cap reached. Please check your project billing or enter your own key in settings.');
      }
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunkText) {
              yield { type: 'text', text: chunkText };
            }
            if (parsed.usageMetadata) {
              yield {
                type: 'usage',
                inputTokens: parsed.usageMetadata.promptTokenCount || 0,
                outputTokens: parsed.usageMetadata.candidatesTokenCount || 0,
              };
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } finally {
      reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }

  async generate(messages: Message[]): Promise<GenerateResult> {
    if (!this.effectiveKey) {
      throw new Error('No Gemini API key found. Please provide an API key in setup.');
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystemMessages = messages.filter((m) => m.role !== 'system');

    const contents = nonSystemMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const requestBody: Record<string, unknown> = {
      contents,
    };

    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      };
    }

    const endpoint = 'generateContent';
    const model = this.modelId || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${this.effectiveKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429 || errorText.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Gemini API quota or spending cap reached. Please check your project billing or enter your own key in settings.');
      }
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: data.usageMetadata ? {
        inputTokens: data.usageMetadata.promptTokenCount || 0,
        outputTokens: data.usageMetadata.candidatesTokenCount || 0,
      } : undefined,
    };
  }
}
