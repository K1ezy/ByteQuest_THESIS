import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function ByteBotDrawer({
  subject = 'cpp',
  initialMessage = '',
  reviewerSections = [],
  quizzes = [],
  challenges = []
}) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi Alex! I'm ByteBot. I have full access to your uploaded lecture notes, quizzes, and coding challenges. Ask me to summarize your lecture or guide you through any problem!"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (initialMessage) {
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;
    if (!textToSend) setInputVal('');

    const newMsgs = [...messages, { role: 'user', text }];
    setMessages(newMsgs);
    setLoading(true);

    const context = reviewerSections.length > 0
      ? reviewerSections.map(r => `${r.concept}: ${r.summary}`).join('\n\n')
      : '';

    try {
      const res = await apiClient.chatWithByteBot(text, subject, context, newMsgs);
      setMessages([...newMsgs, { role: 'bot', text: res.reply || res.text }]);
    } catch (err) {
      setMessages([...newMsgs, {
        role: 'bot',
        text: `I'm analyzing your ${subject.toUpperCase()} lecture. What specific section or loop concept would you like to review?`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    'Summarize my lecture PDF',
    'Explain while vs for loops',
    'Why is smallest = None used?',
    'Give me an intuitive analogy'
  ];

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      height: '520px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div>
          <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
            ByteBot Socratic Tutor
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--state-info)' }}>AI Socrates Engine · {subject.toUpperCase()}</span>
        </div>
        <span style={{ fontSize: '10px', background: 'rgba(0, 229, 163, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '2px 7px', borderRadius: '999px', fontWeight: 700 }}>
          ONLINE
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              maxWidth: '85%',
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-canvas)',
              color: m.role === 'user' ? '#0b0d14' : 'var(--text-high)',
              fontWeight: m.role === 'user' ? 600 : 400,
              border: `1px solid ${m.role === 'user' ? 'transparent' : 'var(--border-default)'}`,
              borderRadius: '12px',
              borderBottomRightRadius: m.role === 'user' ? '2px' : '12px',
              borderBottomLeftRadius: m.role === 'bot' ? '2px' : '12px',
              padding: '10px 14px',
              fontSize: '12.5px',
              lineHeight: 1.55
            }}
          >
            {m.role === 'bot' ? (
              <div
                className="bytebot-markdown"
                dangerouslySetInnerHTML={{ __html: marked.parse(m.text || '') }}
              />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {m.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '11.5px',
            color: 'var(--text-faint)',
            fontStyle: 'italic'
          }}>
            ByteBot is contemplating Socratic guidance...
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0 6px 0' }}>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(chip)}
            style={{
              fontSize: '10.5px',
              fontFamily: 'JetBrains Mono',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-medium)',
              padding: '3px 8px',
              borderRadius: '999px',
              cursor: 'pointer'
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Ask about ${subject.toUpperCase()} concepts...`}
          style={{
            flex: 1,
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 12px',
            fontSize: '12.5px',
            color: 'var(--text-high)',
            outline: 'none'
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading}
          style={{
            background: 'var(--accent-primary)',
            color: '#0b0d14',
            fontWeight: 700,
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
