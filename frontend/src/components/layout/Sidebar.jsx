import React from 'react';

export default function Sidebar({ subject, setSubject, activeTab, setActiveTab }) {
  const subjects = [
    { id: 'cpp', name: 'C++', desc: 'Memory, Pointers & RAII' },
    { id: 'python', name: 'Python', desc: 'Comprehensions & Yield' },
    { id: 'java', name: 'Java', desc: 'Classes, OOP & JVM' },
  ];

  const tabs = [
    { id: 'quiz', label: '🎯 Practice Quiz' },
    { id: 'study', label: '📖 Reviewer & ByteBot' },
    { id: 'challenge', label: '⚡ Code Sandbox' },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-default)',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Subject Selector */}
      <div>
        <div style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Language Track
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubject(s.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: subject === s.id ? 'rgba(0, 229, 163, 0.08)' : 'var(--bg-surface-raised)',
                border: `1px solid ${subject === s.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: subject === s.id ? 'var(--accent-primary)' : 'var(--text-high)' }}>
                {s.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Navigation */}
      <div>
        <div style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Study Tools
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                fontWeight: 600,
                color: activeTab === t.id ? '#0b0d14' : 'var(--text-medium)',
                background: activeTab === t.id ? 'var(--accent-primary)' : 'transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
