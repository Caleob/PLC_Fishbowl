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
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite', provider: 'gemini', tier: 'balanced', inputPer1M: 0.25, outputPer1M: 1.50 },
  // Gemma Local — no API cost
  { id: 'gemma-4', label: 'Gemma 4 (Local)', provider: 'gemma-local', tier: 'balanced', inputPer1M: 0, outputPer1M: 0 },
];

export function getModelsForProvider(provider: ProviderType): ModelOption[] {
  return MODELS.filter((m) => m.provider === provider);
}

export function getDefaultModel(provider: ProviderType): ModelOption {
  return MODELS.find((m) => m.provider === provider && m.tier === 'balanced')
    || MODELS.find((m) => m.provider === provider)!;
}

export function getModelById(id: string): ModelOption | undefined {
  return MODELS.find((m) => m.id === id);
}

export function estimateSessionCost(
  modelId: string,
  panelistCount: number
): { low: number; high: number } {
  const model = getModelById(modelId);
  if (!model) return { low: 0, high: 0 };

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
