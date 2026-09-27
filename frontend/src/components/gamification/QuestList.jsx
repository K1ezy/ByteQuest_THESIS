import React from 'react';

export default function QuestList({ quests = [
  { id: 'q1', name: 'Complete 1 practice quiz', current: 1, target: 1 },
  { id: 'q2', name: 'Solve 1 hands-on coding challenge', current: 0, target: 1 },
  { id: 'q3', name: 'Consult ByteBot Socratic tutor', current: 1, target: 1 },
  { id: 'q4', name: 'Answer 10 practice questions', current: 6, target: 10 },
] }) {
  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '18px'
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 14px 0', color: 'var(--text-high)' }}>
        Active Learning Quests
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {quests.map((q) => {
          const isDone = q.current >= q.target;
          const pct = Math.min(100, Math.round((q.current / q.target) * 100));
          return (
            <div key={q.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                <span style={{ color: isDone ? 'var(--state-crown)' : 'var(--text-high)', fontWeight: isDone ? 700 : 500 }}>
                  {isDone ? '✓ ' : ''}{q.name}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-faint)' }}>{q.current}/{q.target}</span>
              </div>
              <div style={{ height: '5px', background: 'var(--border-default)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: isDone ? 'var(--state-crown)' : 'var(--accent-primary)',
                  width: `${pct}%`,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
