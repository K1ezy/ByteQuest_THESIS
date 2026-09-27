import React from 'react';

export default function BadgeGrid({ unlockedBadgeIds = ['hello_world'] }) {
  const badges = [
    { id: 'hello_world', icon: '👋', name: 'Hello, World!', desc: 'First correct quiz question' },
    { id: 'quiz_ace', icon: '🎯', name: 'Quiz Ace', desc: '100% score on a practice quiz' },
    { id: 'streak_vanguard', icon: '🔥', name: 'Streak Vanguard', desc: '3-day consecutive study streak' },
    { id: 'polyglot', icon: '🌐', name: 'Polyglot', desc: 'Attempt tasks in C++, Python, and Java' },
    { id: 'socratic_scholar', icon: '💬', name: 'Socratic Scholar', desc: 'Ask ByteBot 5+ questions' },
    { id: 'bug_squasher', icon: '🐛', name: 'Bug Squasher', desc: 'Solve your first coding challenge' },
    { id: 'algorithmic_master', icon: '🏆', name: 'Algorithmic Master', desc: 'Complete 3 coding challenges' },
    { id: 'thesis_telemetry', icon: '🔬', name: 'Thesis Telemetry', desc: 'Contribute 5+ feature vectors to ML dataset' },
    { id: 'on_time', icon: '✅', name: 'On Time', desc: 'Complete an instructor published assignment' }
  ];

  const unlockedCount = badges.filter(b => unlockedBadgeIds.includes(b.id)).length;

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '18px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-high)' }}>Mastery Badges</h3>
        <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)' }}>{unlockedCount}/9</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      }}>
        {badges.map((b) => {
          const isUnlocked = unlockedBadgeIds.includes(b.id);
          return (
            <div
              key={b.id}
              title={b.desc}
              style={{
                background: 'var(--bg-surface-raised)',
                border: `1px solid ${isUnlocked ? 'rgba(0, 229, 163, 0.35)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 4px',
                textAlign: 'center',
                opacity: isUnlocked ? 1 : 0.35,
                filter: isUnlocked ? 'none' : 'grayscale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{b.icon}</div>
              <div style={{ fontSize: '9.5px', color: isUnlocked ? 'var(--text-high)' : 'var(--text-faint)', fontWeight: isUnlocked ? 600 : 400 }}>
                {b.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
