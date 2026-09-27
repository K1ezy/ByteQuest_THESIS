import React, { useState } from 'react';

export default function QuizRunner({ questions = [], subject = 'cpp', onCompleteQuiz }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime] = useState(Date.now());

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-faint)' }}>
        No questions loaded for this subject. Upload a lecture or click Generate.
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelect = (idx) => {
    if (selectedOption !== null) return; // Prevent multiple clicks
    setSelectedOption(idx);
    const isCorrect = idx === currentQ.correct_index;
    const newResults = [...results, isCorrect];
    setResults(newResults);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setShowSummary(true);
      const totalTimeSec = Math.round((Date.now() - startTime) / 1000);
      const correctCount = results.filter(Boolean).length;
      if (onCompleteQuiz) {
        onCompleteQuiz({
          subject,
          totalQuestions: questions.length,
          correctCount,
          timeSpentSeconds: totalTimeSec,
          accuracy: correctCount / questions.length
        });
      }
    }
  };

  if (showSummary) {
    const correctCount = results.filter(Boolean).length;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    return (
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '28px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
          Assessment Complete
        </span>
        <h2 style={{ fontSize: '24px', margin: '8px 0', color: 'var(--text-high)' }}>Session Results</h2>
        <div style={{ fontSize: '42px', fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-primary)', margin: '14px 0' }}>
          {accuracy}%
        </div>
        <p style={{ color: 'var(--text-medium)', fontSize: '13px', marginBottom: '20px' }}>
          Answered {correctCount} of {questions.length} questions correctly.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setSelectedOption(null);
            setResults([]);
            setShowSummary(false);
          }}
          style={{
            background: 'var(--accent-primary)',
            color: '#0b0d14',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Practice Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '24px'
    }}>
      {/* Meta tags & Dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ fontSize: '10px', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', padding: '2px 8px', borderRadius: '999px', color: 'var(--state-info)', fontFamily: 'JetBrains Mono' }}>
            {subject.toUpperCase()}
          </span>
          <span style={{ fontSize: '10px', background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', padding: '2px 8px', borderRadius: '999px', color: 'var(--text-medium)', fontFamily: 'JetBrains Mono' }}>
            {currentQ.concept}
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)' }}>
          {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
        {questions.map((_, i) => (
          <div
            key={i}
            style={{
              height: '4px',
              flex: 1,
              borderRadius: '999px',
              background: i === currentIndex
                ? 'var(--state-info)'
                : (results[i] === true ? 'var(--accent-primary)' : (results[i] === false ? 'var(--state-error)' : 'var(--border-default)'))
            }}
          />
        ))}
      </div>

      {/* Question Text */}
      <div style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--text-high)', marginBottom: '14px', lineHeight: 1.5 }}>
        {currentQ.question}
      </div>

      {/* Code Snippet if present */}
      {currentQ.code_snippet && (
        <pre style={{
          background: 'var(--bg-code)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          fontSize: '12px',
          color: 'var(--state-info)',
          overflowX: 'auto',
          marginBottom: '16px'
        }}>
          <code>{currentQ.code_snippet}</code>
        </pre>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {currentQ.options.map((opt, idx) => {
          let btnBg = 'var(--bg-surface-raised)';
          let btnBorder = 'var(--border-default)';

          if (selectedOption !== null) {
            if (idx === currentQ.correct_index) {
              btnBg = 'rgba(0, 229, 163, 0.12)';
              btnBorder = 'var(--accent-primary)';
            } else if (idx === selectedOption && idx !== currentQ.correct_index) {
              btnBg = 'rgba(255, 51, 102, 0.12)';
              btnBorder = 'var(--state-error)';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: btnBg,
                border: `1px solid ${btnBorder}`,
                color: 'var(--text-high)',
                fontSize: '13px',
                textAlign: 'left',
                cursor: selectedOption === null ? 'pointer' : 'default',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                fontWeight: 700,
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'var(--text-faint)'
              }}>
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Box */}
      {selectedOption !== null && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12.5px',
          marginBottom: '16px',
          background: selectedOption === currentQ.correct_index ? 'rgba(0, 229, 163, 0.08)' : 'rgba(255, 51, 102, 0.08)',
          border: `1px solid ${selectedOption === currentQ.correct_index ? 'var(--accent-primary)' : 'var(--state-error)'}`,
          color: selectedOption === currentQ.correct_index ? '#bbf7d0' : '#fecdd3'
        }}>
          <b>{selectedOption === currentQ.correct_index ? '✓ Correct!' : '✗ Not quite.'}</b> {currentQ.explanation}
        </div>
      )}

      {/* Action Footer */}
      {selectedOption !== null && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleNext}
            style={{
              background: 'var(--accent-primary)',
              color: '#0b0d14',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {currentIndex + 1 < questions.length ? 'Next Question ❯' : 'View Results'}
          </button>
        </div>
      )}
    </div>
  );
}
