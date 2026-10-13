import React from 'react';

export default function RosterMonitor({ roster = [], onSimulateAttempt }) {
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
            Student Roster Progress &amp; Assignment Tracking
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Monitor assignment completion rates and individual student learning curves
          </span>
        </div>
        <button
          onClick={onSimulateAttempt}
          style={{
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-high)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            cursor: 'pointer'
          }}
        >
          🎲 Simulate Student Attempt
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>Student</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>Level</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>Total XP</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>Completion</th>
            <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {roster.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px', fontWeight: 600, color: 'var(--text-high)' }}>{s.name}</td>
              <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: 'var(--state-info)' }}>Lv.{s.level || 1}</td>
              <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)' }}>{s.total_xp ?? s.xp ?? 140} XP</td>
              <td style={{ padding: '10px', width: '180px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg-canvas)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.completion_pct ?? 75}%`, height: '100%', background: 'var(--accent-primary)' }} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)' }}>{s.completion_pct ?? 75}%</span>
                </div>
              </td>
              <td style={{ padding: '10px', textAlign: 'right' }}>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(0, 229, 163, 0.1)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)'
                }}>
                  ACTIVE
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
