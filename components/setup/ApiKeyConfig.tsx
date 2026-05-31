'use client';

import { useEffect } from 'react';
import type { ProviderType } from '@/engine/types';
import { getModelsForProvider } from '@/lib/models';

interface Props {
  provider: ProviderType;
  apiKey: string;
  modelId: string;
  onProviderChange: (provider: ProviderType) => void;
  onApiKeyChange: (key: string) => void;
  onModelChange: (modelId: string) => void;
}

const PROVIDERS: { id: ProviderType; label: string }[] = [
  { id: 'gemini', label: 'Gemini' },
  { id: 'gemma-local', label: 'Gemma local' },
];

export default function ApiKeyConfig({ provider, apiKey, modelId, onProviderChange, onApiKeyChange, onModelChange }: Props) {
  useEffect(() => {
    const legacyStorageKey = `fishbowl-apikey-${provider}`;
    const savedKey = localStorage.getItem(legacyStorageKey);
    if (savedKey && !apiKey) {
      onApiKeyChange(savedKey);
    }
    if (savedKey) {
      localStorage.removeItem(legacyStorageKey);
    }
  }, [apiKey, onApiKeyChange, provider]);

  const models = getModelsForProvider(provider);
  const hasKey = provider === 'gemma-local' || !!apiKey.trim();

  return (
    <div>
      <div className="section-header">
        <div className="label-mono" style={{ flexShrink: 0 }}>AI Provider</div>
        {hasKey && (
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
            Connected
          </span>
        )}
      </div>

      {/* Provider pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onProviderChange(p.id)}
            className={`provider-pill ${provider === p.id ? 'active' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Provider-specific config */}
      <div className="dossier-panel">
        {provider === 'gemini' ? (
          <>
            <div className="dossier-label">Gemini API Key</div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="AIzaSy..."
              aria-label="API key"
              className="dossier-input"
            />
            <p className="text-[10px] mt-2" style={{ color: '#5a5248', opacity: 0.8 }}>
              Kept only in this tab&apos;s session. Sent only to Google.
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
                    {m.label} — ${m.inputPer1M}/{m.outputPer1M} per 1M tokens
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Gemma Local info box */}
            <div
              style={{
                background: 'rgba(196, 154, 42, 0.06)',
                border: '1px solid rgba(196, 154, 42, 0.2)',
                borderRadius: '6px',
                padding: '12px 14px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                How Gemma Local Works
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: '0 0 0 16px',
                  listStyle: 'disc',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  lineHeight: '1.7',
                  color: '#8a8078',
                }}
              >
                <li>Uses Gemma model running locally on your computer</li>
                <li>Connects directly to your local runner CLI/API — no API key needed</li>
                <li>Requires <code style={{ background: 'var(--dark-surface)', padding: '1px 5px', borderRadius: '3px', color: 'var(--accent-gold-dim)', fontFamily: "'DM Mono', monospace", fontSize: '10px' }}>gemma</code> command-line tool to be available</li>
                <li>Responses depend on your local hardware performance</li>
              </ul>
            </div>
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
                    {m.label} — $0 — uses local hardware
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
