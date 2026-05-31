import type { LLMProvider } from './types';
import type { ProviderType } from '@/engine/types';
import { GemmaProvider } from './gemma';
import { GeminiProvider } from './gemini';

export function createProvider(
  type: ProviderType,
  apiKey: string,
  modelId?: string,
  sessionId?: string | null,
  hostedSessionToken?: string | null,
): LLMProvider {
  switch (type) {
    case 'gemini':
      return new GeminiProvider(apiKey, modelId, sessionId || undefined, hostedSessionToken || undefined);
    case 'gemma-local':
      return new GemmaProvider(modelId);
    default:
      throw new Error(`Unknown provider: ${type}`);
  }
}

export type { LLMProvider, Message } from './types';
