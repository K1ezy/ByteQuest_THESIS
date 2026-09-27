import React from 'react';

export default function Leaderboard({ currentUserXp = 140 }) {
  const peers = [
    { rank: 1, name: 'ada_lovelace', xp: 480 },
    { rank: 2, name: 'jrizal_dev', xp: 390 },
    { rank: 3, name: 'Alex (You)', xp: currentUserXp, isUser: true },
    { rank: 4, name: 'kernel_kat', xp: 210 },
    { rank: 5, name: 'null_ptr', xp: 130 },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '18px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-high)' }}>Course Leaderboard</h3>
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono' }}>CS-301 · Week 4</span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: '6px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)', width: '28px' }}>#</th>
            <th style={{ textAlign: 'left', paddingBottom: '6px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>student</th>
            <th style={{ textAlign: 'right', paddingBottom: '6px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border-default)' }}>xp</th>
          </tr>
        </thead>
        <tbody>
          {peers.map((p, idx) => (
            <tr key={p.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '8px 0', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)' }}>{idx + 1}</td>
              <td style={{ padding: '8px 0', color: p.isUser ? 'var(--accent-primary)' : 'var(--text-high)', fontWeight: p.isUser ? 700 : 400 }}>
                {p.name}
              </td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'JetBrains Mono', color: p.isUser ? 'var(--accent-primary)' : 'var(--text-medium)' }}>
                {p.xp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
