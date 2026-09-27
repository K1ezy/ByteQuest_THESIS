import React, { useState, useEffect } from 'react';

export default function ContentValidator({ stagedActivities = [], onPublishAll }) {
  const [activities, setActivities] = useState(stagedActivities);

  useEffect(() => {
    setActivities(stagedActivities);
  }, [stagedActivities]);

  const handleTitleChange = (id, newTitle) => {
    setActivities(activities.map(a => a.id === id ? { ...a, title: newTitle } : a));
  };

  const handleRemove = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

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
            Instructor Content Validation Queue
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Inspect, edit, test, and approve AI-generated activities before publishing to students
          </span>
        </div>
        <button
          onClick={() => onPublishAll && onPublishAll(activities.map(a => a.id))}
          disabled={activities.length === 0}
          style={{
            background: 'var(--accent-primary)',
            color: '#0b0d14',
            fontWeight: 700,
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 18px',
            cursor: activities.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Publish All to Class ({activities.length})
        </button>
      </div>

      {activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-faint)' }}>
          Queue is empty. Upload lecture notes to generate candidate curriculum.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map((act) => (
            <div
              key={act.id}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ fontSize: '10px', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', padding: '2px 7px', borderRadius: '4px', color: 'var(--state-info)', fontFamily: 'JetBrains Mono' }}>
                    {act.subject?.toUpperCase() || 'CS'}
                  </span>
                  <span style={{ fontSize: '10px', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', padding: '2px 7px', borderRadius: '4px', color: 'var(--text-medium)', fontFamily: 'JetBrains Mono' }}>
                    {act.activity_type?.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(act.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--state-error)', fontSize: '11px', cursor: 'pointer' }}
                >
                  Reject &amp; Remove
                </button>
              </div>

              <input
                type="text"
                value={act.title || ''}
                onChange={(e) => handleTitleChange(act.id, e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  color: 'var(--text-high)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}
              />

              <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono' }}>
                Concept: {act.concept} · Difficulty: {act.difficulty}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
