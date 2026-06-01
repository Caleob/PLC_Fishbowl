import type { LLMProvider, Message, StreamEvent, GenerateResult } from './types';
import { prefixPath } from '@/lib/basePath';

export class GeminiProvider implements LLMProvider {
  constructor(
    private apiKey: string,
    private modelId?: string,
    private sessionId?: string,
    private hostedSessionToken?: string,
  ) {}

  private async *streamDirect(messages: Message[], options?: { signal?: AbortSignal }): AsyncIterable<StreamEvent> {
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
    const model = this.modelId || 'gemini-3.1-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${this.apiKey}${streamParams}`;

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

  private async *streamProxy(messages: Message[], options?: { signal?: AbortSignal }): AsyncIterable<StreamEvent> {
    const response = await fetch(prefixPath('/api/llm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        provider: 'gemini',
        apiKey: this.apiKey,
        modelId: this.modelId,
        stream: true,
        sessionId: this.sessionId,
        hostedSessionToken: this.hostedSessionToken,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'LLM request failed');
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
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield { type: 'text', text: parsed.delta.text };
            } else if (parsed.type === 'usage') {
              yield { type: 'usage', inputTokens: parsed.inputTokens, outputTokens: parsed.outputTokens };
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

  async *stream(messages: Message[], options?: { signal?: AbortSignal }): AsyncIterable<StreamEvent> {
    // If an API key is provided directly by the client, bypass the proxy and call Google API directly.
    // This is required for static hosts like GitHub Pages where /api/... routes are dropped.
    if (this.apiKey && this.apiKey.trim().length > 0) {
      yield* this.streamDirect(messages, options);
    } else {
      yield* this.streamProxy(messages, options);
    }
  }

  private async generateDirect(messages: Message[]): Promise<GenerateResult> {
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
    const model = this.modelId || 'gemini-3.1-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
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

  private async generateProxy(messages: Message[]): Promise<GenerateResult> {
    const response = await fetch(prefixPath('/api/llm'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        provider: 'gemini',
        apiKey: this.apiKey,
        modelId: this.modelId,
        stream: false,
        sessionId: this.sessionId,
        hostedSessionToken: this.hostedSessionToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'LLM request failed');
    }

    const data = await response.json();
    return {
      text: data.content?.[0]?.text || '',
      usage: data.usage ? {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      } : undefined,
    };
  }

  async generate(messages: Message[]): Promise<GenerateResult> {
    if (this.apiKey && this.apiKey.trim().length > 0) {
      return this.generateDirect(messages);
    } else {
      return this.generateProxy(messages);
    }
  }
}
