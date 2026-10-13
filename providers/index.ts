import type { LLMProvider } from './types';
import type { ProviderType } from '@/engine/types';
import { GeminiProvider } from './gemini';

export function createProvider(
  type: ProviderType = 'gemini',
  apiKey?: string,
  modelId?: string,
): LLMProvider {
  void type;
  return new GeminiProvider(apiKey, modelId);
}

export type { LLMProvider, Message } from './types';
