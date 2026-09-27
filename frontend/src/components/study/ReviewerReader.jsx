import React, { useState, useEffect } from 'react';

export default function ReviewerReader({ reviewerSections = [], subject = 'cpp', onAskByteBot }) {
  const [highlightedText, setHighlightedText] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, visible: false });

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length < 5) {
        setTooltipPos((prev) => ({ ...prev, visible: false }));
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setHighlightedText(text);
      setTooltipPos({
        top: rect.top - 36,
        left: rect.left + rect.width / 2 - 60,
        visible: true,
      });
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleAskTrigger = () => {
    if (onAskByteBot && highlightedText) {
      onAskByteBot(`Explain this concept from the lecture: "${highlightedText.slice(0, 140)}"`);
      setTooltipPos((prev) => ({ ...prev, visible: false }));
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
            Grounded Lecture Reviewer
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Highlight any text snippet to ask ByteBot Socratic tutor
          </span>
        </div>
        <span style={{ fontSize: '10.5px', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', padding: '2px 8px', borderRadius: '999px', color: 'var(--state-info)', fontFamily: 'JetBrains Mono' }}>
          {subject.toUpperCase()} NOTES
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '480px', overflowY: 'auto', paddingRight: '6px' }}>
        {reviewerSections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-faint)' }}>
            No reviewer notes generated yet. Upload course materials to extract.
          </div>
        ) : (
          reviewerSections.map((sec, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px'
            }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--state-info)', margin: '0 0 6px 0' }}>
                {sec.concept}
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-medium)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
                {sec.summary}
              </p>
              {sec.key_takeaways && (
                <ul style={{ margin: '0 0 10px 18px', fontSize: '12px', color: 'var(--text-high)' }}>
                  {sec.key_takeaways.map((t, i) => (
                    <li key={i} style={{ marginBottom: '3px' }}>{t}</li>
                  ))}
                </ul>
              )}
              {sec.code_sample && (
                <pre style={{
                  background: 'var(--bg-code)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: '11.5px',
                  color: 'var(--accent-primary)',
                  overflowX: 'auto',
                  margin: 0
                }}>
                  <code>{sec.code_sample}</code>
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Highlight-to-Ask Tooltip */}
      {tooltipPos.visible && (
        <button
          onClick={handleAskTrigger}
          style={{
            position: 'fixed',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            zIndex: 3000,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5), 0 0 12px var(--accent-glow)'
          }}
        >
          ✦ Ask ByteBot
        </button>
      )}
    </div>
  );
}
