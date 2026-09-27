import React from 'react';

export default function TestConsole({ results = [], compilationError = null, aiFeedback = null }) {
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: 'var(--text-high)', fontFamily: 'JetBrains Mono' }}>
          TEST CONSOLE &amp; DIFF OUTPUT
        </h4>
        {totalCount > 0 && (
          <span style={{
            fontSize: '11px',
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            color: passedCount === totalCount ? 'var(--accent-primary)' : 'var(--state-error)'
          }}>
            {passedCount}/{totalCount} Passed
          </span>
        )}
      </div>

      {compilationError && (
        <div style={{
          background: 'rgba(255, 51, 102, 0.08)',
          border: '1px solid var(--state-error)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          color: '#fecdd3',
          fontFamily: 'JetBrains Mono',
          fontSize: '11.5px',
          marginBottom: '12px',
          whiteSpace: 'pre-wrap'
        }}>
          <b>Compilation / Execution Error:</b><br />
          {compilationError}
        </div>
      )}

      {results.length === 0 && !compilationError ? (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-faint)', fontSize: '12px' }}>
          Run your solution to see test case input/output verification.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {results.map((r, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-surface-raised)',
                border: `1px solid ${r.passed ? 'rgba(0, 229, 163, 0.25)' : 'rgba(255, 51, 102, 0.25)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: '11.5px',
                fontFamily: 'JetBrains Mono'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-high)' }}>Test Case #{r.test_case_index || i + 1}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: r.passed ? 'rgba(0, 229, 163, 0.12)' : 'rgba(255, 51, 102, 0.12)',
                  color: r.passed ? 'var(--accent-primary)' : 'var(--state-error)'
                }}>
                  {r.passed ? '✓ PASSED' : '✗ FAILED'} ({r.runtime_ms}ms)
                </span>
              </div>

              <div style={{ color: 'var(--text-medium)', marginBottom: '3px' }}>
                Input: <code style={{ color: 'var(--state-info)' }}>{r.input_data}</code>
              </div>
              <div style={{ color: 'var(--text-medium)', marginBottom: '3px' }}>
                Expected: <code style={{ color: 'var(--accent-primary)' }}>{r.expected_output}</code>
              </div>
              <div style={{ color: 'var(--text-medium)' }}>
                Actual: <code style={{ color: r.passed ? 'var(--accent-primary)' : 'var(--state-error)' }}>{r.actual_output || '<none>'}</code>
              </div>
            </div>
          ))}
        </div>
      )}

      {aiFeedback && (
        <div style={{
          marginTop: '14px',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          fontSize: '12px',
          color: 'var(--text-high)',
          lineHeight: 1.5
        }}>
          <b style={{ color: 'var(--accent-primary)' }}>ByteBot Assessor Feedback:</b> {aiFeedback}
        </div>
      )}
    </div>
  );
}
