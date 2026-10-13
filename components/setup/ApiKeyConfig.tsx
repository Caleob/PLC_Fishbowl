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

  // Migrate legacy saved modelId in localStorage to 3.8 Flash
  useEffect(() => {
    if (modelId !== 'gemini-3.8-flash' && modelId !== 'gemini-3.5-flash-lite') {
      onModelChange('gemini-3.8-flash');
    }
  }, [modelId, onModelChange]);

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
          <div className="dossier-label">Gemini Model</div>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => onModelChange('gemini-3.8-flash')}
              className={`provider-pill text-left p-3 rounded-lg flex flex-col justify-between transition-all ${
                modelId === 'gemini-3.8-flash' ? 'active' : ''
              }`}
            >
              <div className="font-600 text-[12px] flex items-center justify-between w-full">
                <span>3.8 Flash</span>
                {modelId === 'gemini-3.8-flash' && <span className="text-[11px] font-mono">ACTIVE</span>}
              </div>
              <div className="text-[10px] mt-1 opacity-80 normal-case leading-tight">
                Most intelligent • Deeper pedagogical feedback
              </div>
              <div className="text-[9px] mt-2 opacity-60 font-mono">
                $0.75 / $3.75 per 1M
              </div>
            </button>

            <button
              type="button"
              onClick={() => onModelChange('gemini-3.5-flash-lite')}
              className={`provider-pill text-left p-3 rounded-lg flex flex-col justify-between transition-all ${
                modelId === 'gemini-3.5-flash-lite' ? 'active' : ''
              }`}
            >
              <div className="font-600 text-[12px] flex items-center justify-between w-full">
                <span>3.5 Flash-Lite</span>
                {modelId === 'gemini-3.5-flash-lite' && <span className="text-[11px] font-mono">ACTIVE</span>}
              </div>
              <div className="text-[10px] mt-1 opacity-80 normal-case leading-tight">
                Ultra-fast • Lowest token cost
              </div>
              <div className="text-[9px] mt-2 opacity-60 font-mono">
                $0.30 / $2.50 per 1M
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
