import React, { useState, useEffect } from 'react';
import { getStoredApiKey, setStoredApiKey, apiClient } from '../../api/client';

export default function ApiKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setStatus({
      type: 'success',
      message: apiKey.trim()
        ? 'Gemini API key stored successfully in local browser session!'
        : 'Key cleared. Running in intelligent deterministic fallback mode.'
    });
    if (onKeyUpdated) onKeyUpdated(apiKey.trim());
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setStatus({ type: 'warning', message: 'Enter a Gemini API key first to test connection.' });
      return;
    }
    setIsTesting(true);
    setStatus({ type: 'info', message: 'Connecting to Gemini 2.5 Flash API...' });
    try {
      const res = await apiClient.verifyApiKey(apiKey.trim());
      if (res.valid) {
        setStatus({ type: 'success', message: res.message });
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `Connection error: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        width: '90%',
        maxWidth: '520px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-high)' }}>
              Google Gemini 2.5 Flash Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-medium)',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-medium)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
          ByteQuest uses <b>Gemini 2.5 Flash</b> for structured lecture concept extraction and Socratic tutor reasoning.
          If no API key is provided, the platform operates in <b>Zero-Config Deterministic Fallback Mode</b> with built-in curriculum models.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-high)', fontWeight: 600, marginBottom: '6px' }}>
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-high)',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono',
              outline: 'none'
            }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
            Need a key? Get one free at{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--state-info)', textDecoration: 'underline' }}
            >
              Google AI Studio
            </a>
          </div>
        </div>

        {status.message && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            marginBottom: '16px',
            background: status.type === 'success' ? 'rgba(0, 229, 163, 0.1)' :
                        status.type === 'error' ? 'rgba(255, 51, 102, 0.1)' :
                        status.type === 'info' ? 'rgba(0, 180, 216, 0.1)' : 'rgba(255, 170, 0, 0.1)',
            border: `1px solid ${
              status.type === 'success' ? 'var(--accent-primary)' :
              status.type === 'error' ? 'var(--state-error)' :
              status.type === 'info' ? 'var(--state-info)' : 'var(--state-warning)'
            }`,
            color: 'var(--text-high)'
          }}>
            {status.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-high)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              cursor: isTesting ? 'not-allowed' : 'pointer'
            }}
          >
            {isTesting ? 'Testing...' : '🔌 Test Connection'}
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setApiKey('');
                setStoredApiKey('');
                setStatus({ type: 'info', message: 'Cleared. Using fallback curriculum.' });
                if (onKeyUpdated) onKeyUpdated('');
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-medium)',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button
              onClick={() => {
                handleSave();
                setTimeout(onClose, 800);
              }}
              style={{
                background: 'var(--accent-primary)',
                border: 'none',
                color: '#0b0d14',
                fontWeight: 700,
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
