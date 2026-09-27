import React, { useState } from 'react';

export default function CodeEditor({ challenge, language = 'cpp', onRunTests, isEvaluating = false }) {
  const [code, setCode] = useState(challenge?.starter_code || '// Write solution here...');
  const lineCount = Math.max(12, code.split('\n').length);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden'
    }}>
      {/* Editor Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'var(--bg-surface-raised)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-primary)' }}>
            solution.{language === 'cpp' ? 'cpp' : (language === 'python' ? 'py' : 'java')}
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-faint)' }}>
            ({language.toUpperCase()})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCode(challenge?.starter_code || '')}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--text-medium)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            Reset Code
          </button>
          <button
            onClick={() => onRunTests && onRunTests(code)}
            disabled={isEvaluating}
            style={{
              padding: '6px 16px',
              fontSize: '11.5px',
              fontWeight: 700,
              background: 'var(--accent-primary)',
              color: '#0b0d14',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: isEvaluating ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 10px var(--accent-glow)'
            }}
          >
            {isEvaluating ? 'Running Sandbox...' : '▶ Run Test Cases'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div style={{ display: 'flex', minHeight: '260px', background: 'var(--bg-code)' }}>
        {/* Line Numbers */}
        <div style={{
          width: '42px',
          padding: '12px 6px',
          textAlign: 'right',
          fontFamily: 'JetBrains Mono',
          fontSize: '12px',
          color: 'var(--text-faint)',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRight: '1px solid var(--border-subtle)',
          userSelect: 'none',
          lineHeight: '1.6'
        }}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '12px 14px',
            fontFamily: 'JetBrains Mono',
            fontSize: '12.5px',
            color: 'var(--text-high)',
            lineHeight: '1.6',
            resize: 'vertical',
            minHeight: '260px',
            whiteSpace: 'pre',
            overflowX: 'auto'
          }}
        />
      </div>
    </div>
  );
}
