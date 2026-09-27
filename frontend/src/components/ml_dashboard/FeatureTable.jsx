import React from 'react';
import { apiClient } from '../../api/client';

export default function FeatureTable({ features = [] }) {
  const exportUrl = apiClient.getExportCsvUrl();

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
            Student Telemetry Dataset (Feature Vectors)
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Empirical interactions logged for comparative machine learning evaluation
          </span>
        </div>
        <a
          href={exportUrl}
          download="bytequest_telemetry.csv"
          style={{
            background: 'var(--accent-primary)',
            color: '#0b0d14',
            fontWeight: 700,
            padding: '7px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11.5px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          📥 Export Dataset (.CSV)
        </a>
      </div>

      <div style={{ maxHeight: '260px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>student_id</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>task_id</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>lang</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>prior_quiz_acc</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>solve_time_s</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>compile_errs</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>attempts</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>hints</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-high)' }}>difficulty</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-high)' }}>target_success</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{f.student_id}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{f.task_id}</td>
                <td style={{ padding: '7px 10px', color: 'var(--state-info)' }}>{f.language}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{(f.prior_quiz_accuracy * 100).toFixed(0)}%</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{f.avg_solve_time_seconds}s</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{f.compilation_error_count}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{f.attempts_before_success}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>{f.hints_requested_count}</td>
                <td style={{ padding: '7px 10px', color: 'var(--text-medium)' }}>L{f.task_difficulty_level}</td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: f.target_task_success ? 'var(--accent-primary)' : 'var(--state-error)' }}>
                  {f.target_task_success ? '1 (Pass)' : '0 (Fail)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
