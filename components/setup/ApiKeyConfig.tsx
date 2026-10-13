'use client';

import { useEffect } from 'react';
import type { ProviderType } from '@/engine/types';
import { getModelsForProvider } from '@/lib/models';
import { getEffectiveGeminiKey } from '@/lib/keyManager';

interface Props {
  provider: ProviderType;
  apiKey: string;
  modelId: string;
  onProviderChange: (provider: ProviderType) => void;
  onApiKeyChange: (key: string) => void;
  onModelChange: (modelId: string) => void;
}

export default function ApiKeyConfig({ apiKey, modelId, onApiKeyChange, onModelChange }: Props) {
  useEffect(() => {
    const savedKey = localStorage.getItem('fishbowl-apikey-gemini');
    if (savedKey && !apiKey) {
      onApiKeyChange(savedKey);
    }
  }, [apiKey, onApiKeyChange]);

  const models = getModelsForProvider('gemini');
  const effectiveKey = getEffectiveGeminiKey(apiKey);
  const isPreconfigured = !apiKey.trim() && !!effectiveKey;

  return (
    <div>
      <div className="section-header">
        <div className="label-mono" style={{ flexShrink: 0 }}>AI Configuration</div>
        {effectiveKey && (
          <span
            className="text-[10px] font-500 px-2 py-0.5 rounded"
            style={{
              color: 'var(--accent-gold)',
              background: 'rgba(196, 154, 42, 0.1)',
              border: '1px solid rgba(196, 154, 42, 0.2)',
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {isPreconfigured ? 'Community Key Active' : 'Connected'}
          </span>
        )}
      </div>

      <div className="dossier-panel">
        <div className="dossier-label">Gemini API Key</div>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            onApiKeyChange(e.target.value);
            localStorage.setItem('fishbowl-apikey-gemini', e.target.value);
          }}
          placeholder={isPreconfigured ? 'Pre-configured (or enter your own key)' : 'AIzaSy...'}
          aria-label="API key"
          className="dossier-input"
        />
        <p className="text-[10px] mt-2" style={{ color: '#5a5248', opacity: 0.8 }}>
          {isPreconfigured
            ? 'Using the built-in community coach budget ($15 limit). You can paste your own Gemini key anytime.'
            : 'Key is stored only in this browser. Calls go directly to Google Generative Language API.'}
        </p>

        <div className="mt-4">
          <div className="dossier-label">Model</div>
          <select
            value={modelId}
            onChange={(e) => onModelChange(e.target.value)}
            aria-label="AI model"
            className="dossier-select"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — ${m.inputPer1M}/${m.outputPer1M} per 1M tokens
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
