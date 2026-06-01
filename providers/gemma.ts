import type { LLMProvider, Message, StreamEvent, GenerateResult } from './types';

/**
 * Delay between simulated streaming chunks (ms).
 */
const SIMULATED_CHUNK_DELAY_MS = 25;

/** Number of words per simulated chunk */
const WORDS_PER_CHUNK = 3;

/** Maximum total time for simulated streaming reveal (ms) */
const MAX_REVEAL_TIME_MS = 4000;

/**
 * Threshold: text chunks larger than this many characters are considered
 * "bulk" deliveries and will be broken up for simulated streaming.
 */
const BULK_CHUNK_THRESHOLD = 40;

function splitIntoWordChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.match(/\S+\s*/g) || [text];
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(''));
  }

  return chunks;
}

function calculateChunkDelay(totalChunks: number): number {
  if (totalChunks <= 1) return 0;
  const idealTotal = totalChunks * SIMULATED_CHUNK_DELAY_MS;
  if (idealTotal <= MAX_REVEAL_TIME_MS) return SIMULATED_CHUNK_DELAY_MS;
  return Math.floor(MAX_REVEAL_TIME_MS / totalChunks);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { prefixPath } from '@/lib/basePath';

/**
 * Gemma Local provider — interacts with a locally running Gemma model.
 * Calls a local API route that shells out to the gemma model/CLI.
 */
export class GemmaProvider implements LLMProvider {
  constructor(private modelId?: string) {}

  async *stream(messages: Message[], options?: { signal?: AbortSignal }): AsyncIterable<StreamEvent> {
    const response = await fetch(prefixPath('/api/gemma'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        modelId: this.modelId,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gemma Local request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    const collectedEvents: StreamEvent[] = [];

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
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'text') {
              collectedEvents.push({ type: 'text', text: parsed.text });
            } else if (parsed.type === 'usage') {
              collectedEvents.push({ type: 'usage', inputTokens: parsed.inputTokens, outputTokens: parsed.outputTokens });
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

    const textEvents = collectedEvents.filter((e): e is StreamEvent & { type: 'text'; text: string } => e.type === 'text');
    const nonTextEvents = collectedEvents.filter((e) => e.type !== 'text');

    const totalTextLength = textEvents.reduce((sum, e) => sum + e.text.length, 0);
    const avgChunkSize = textEvents.length > 0 ? totalTextLength / textEvents.length : 0;
    const isBulkDelivery = textEvents.length <= 3 || avgChunkSize > BULK_CHUNK_THRESHOLD;

    if (isBulkDelivery && totalTextLength > 0) {
      const fullText = textEvents.map((e) => e.text).join('');
      const wordChunks = splitIntoWordChunks(fullText, WORDS_PER_CHUNK);
      const chunkDelay = calculateChunkDelay(wordChunks.length);

      for (let i = 0; i < wordChunks.length; i++) {
        if (i > 0 && chunkDelay > 0) {
          await delay(chunkDelay);
        }
        yield { type: 'text', text: wordChunks[i] };
      }
    } else {
      for (const event of textEvents) {
        yield event;
      }
    }

    for (const event of nonTextEvents) {
      yield event;
    }
  }

  async generate(messages: Message[]): Promise<GenerateResult> {
    const response = await fetch(prefixPath('/api/gemma'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        modelId: this.modelId,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gemma Local request failed');
    }

    const data = await response.json();
    return {
      text: data.text || '',
      usage: data.usage,
    };
  }
}
