import React from 'react';

export default function Topbar({ role, setRole, studentProfile, onOpenSusSurvey, onOpenApiKeyModal, hasApiKey = false }) {
  const level = studentProfile?.level || 1;
  const xp = studentProfile?.total_xp || 0;
  const currentLevelXp = xp % 100;
  const streak = studentProfile?.streak_days || 1;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      borderBottom: '1px solid var(--border-default)',
      background: 'var(--bg-panel)',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontFamily: 'JetBrains Mono',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--accent-primary)',
          background: 'rgba(0, 229, 163, 0.1)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(0, 229, 163, 0.25)'
        }}>
          ❯_
        </span>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
            ByteQuest <span style={{ fontSize: '10px', color: 'var(--state-info)', border: '1px solid var(--border-default)', padding: '2px 6px', borderRadius: '999px', marginLeft: '6px' }}>v2.5 Full-Stack</span>
          </h1>
        </div>
      </div>

      {/* Role Switcher */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-canvas)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-full)',
        padding: '3px'
      }}>
        {['student', 'instructor', 'ml_dashboard'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 600,
              color: role === r ? '#0b0d14' : 'var(--text-medium)',
              background: role === r ? 'var(--accent-primary)' : 'transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {r === 'student' ? '🎓 Student Mode' : (r === 'instructor' ? '🔬 Instructor' : '📊 ML Thesis Lab')}
          </button>
        ))}
      </div>

      {/* Gamified HUD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gemini API Key Configuration */}
        <button
          onClick={onOpenApiKeyModal}
          title="Configure Google Gemini 2.5 Flash API Key"
          style={{
            padding: '6px 12px',
            fontSize: '11.5px',
            background: hasApiKey ? 'rgba(0, 229, 163, 0.12)' : 'var(--bg-surface-raised)',
            border: `1px solid ${hasApiKey ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            color: hasApiKey ? 'var(--accent-primary)' : 'var(--text-medium)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>⚡ API Key</span>
          <span style={{
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: '4px',
            background: hasApiKey ? 'var(--accent-primary)' : 'var(--bg-canvas)',
            color: hasApiKey ? '#0b0d14' : 'var(--text-faint)',
            fontWeight: 700
          }}>
            {hasApiKey ? 'ACTIVE' : 'FALLBACK'}
          </span>
        </button>

        {/* Usability Survey Trigger (Objective 9) */}
        <button
          onClick={onOpenSusSurvey}
          style={{
            padding: '6px 12px',
            fontSize: '11.5px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-default)',
            color: 'var(--state-info)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}
        >
          📋 Usability Survey (SUS)
        </button>

        {/* Level & Conic XP Ring */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-default)',
          padding: '4px 12px 4px 6px',
          borderRadius: 'var(--radius-full)'
        }}>
          <div style={{
            position: 'relative',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `conic-gradient(var(--accent-primary) ${currentLevelXp}%, var(--border-default) 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--accent-primary)'
            }}>
              {level}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-high)' }}>Alex (You)</span>
            <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)' }}>{currentLevelXp} / 100 XP</span>
          </div>
        </div>

        {/* Weekly Streak Flame */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-default)',
          padding: '5px 10px',
          borderRadius: 'var(--radius-full)',
          fontSize: '11.5px',
          fontFamily: 'JetBrains Mono',
          color: 'var(--state-crown)',
          fontWeight: 700
        }}>
          🔥 {streak}d
        </div>
      </div>
    </header>
  );
}
