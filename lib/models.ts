import type { ProviderType } from '@/engine/types';

export interface ModelOption {
  id: string;
  label: string;
  provider: ProviderType;
  tier: 'fast' | 'balanced' | 'smartest';
  inputPer1M: number;
  outputPer1M: number;
}

const MODELS: ModelOption[] = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Most Intelligent)', provider: 'gemini', tier: 'balanced', inputPer1M: 0.75, outputPer1M: 3.75 },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (High Speed)', provider: 'gemini', tier: 'fast', inputPer1M: 0.30, outputPer1M: 2.50 },
];

export function getModelsForProvider(provider: ProviderType): ModelOption[] {
  return MODELS.filter((m) => m.provider === provider);
}

export function getDefaultModel(provider: ProviderType): ModelOption {
  return MODELS.find((m) => m.provider === provider && m.tier === 'balanced')
    || MODELS[0];
}

export function getModelById(id: string): ModelOption | undefined {
  const found = MODELS.find((m) => m.id === id);
  if (found) return found;
  if (id === 'gemini-2.5-flash') {
    return { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'gemini', tier: 'fast', inputPer1M: 0.15, outputPer1M: 0.60 };
  }
  return undefined;
}

export function estimateSessionCost(
  modelId: string,
  panelistCount: number
): { low: number; high: number } {
  const model = getModelById(modelId) || MODELS[0];

  const avgInputTokens = 500;
  const avgOutputTokens = 267;

  const lowResponses = panelistCount * 4 + panelistCount;
  const highResponses = panelistCount * 4 + panelistCount * 3;

  const costPerResponse =
    (avgInputTokens / 1_000_000) * model.inputPer1M +
    (avgOutputTokens / 1_000_000) * model.outputPer1M;

  return {
    low: Math.round(lowResponses * costPerResponse * 100) / 100,
    high: Math.round(highResponses * costPerResponse * 100) / 100,
  };
}

export function formatCost(dollars: number): string {
  if (dollars < 0.01) return '$0.00';
  return `$${dollars.toFixed(2)}`;
}

export function formatTokens(count: number): string {
  if (count < 1000) return `${count}`;
  return `${(count / 1000).toFixed(1)}K`;
}
