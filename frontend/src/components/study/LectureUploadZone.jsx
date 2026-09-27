import React, { useState, useRef } from 'react';

export default function LectureUploadZone({
  onUploadFile,
  onLoadSample,
  isProcessing = false,
  subject = 'cpp',
  onSwitchRole,
  onPublishAll,
  stagedCount = 0,
  onSelectTab
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatusMessage(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (['pdf', 'docx', 'pptx', 'txt'].includes(ext)) {
        setSelectedFile(file);
        setStatusMessage(null);
      } else {
        alert('Supported file formats: .pdf, .docx, .pptx, .txt');
      }
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    try {
      const res = await onUploadFile(selectedFile);
      const subjName = (res?.detected_subject || subject).toUpperCase();
      setStatusMessage({
        type: 'success',
        text: `✓ Successfully reviewed & extracted "${selectedFile.name}" (${subjName}) with Gemini 2.5 Flash!`
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Upload failed: ${err.message}`
      });
    }
  };

  return (
    <div style={{
      background: 'var(--bg-panel)',
      border: `2px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-md)',
      padding: '22px',
      marginBottom: '20px',
      transition: 'all 0.2s ease',
      boxShadow: isDragOver ? '0 0 16px var(--accent-glow)' : 'none'
    }}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.pptx,.txt"
        style={{ display: 'none' }}
        id="lectureUploadFileInput"
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📄</span>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
              Course Lecture Material Ingestion
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-medium)' }}>
              Upload slides or syllabus files (.pdf, .docx, .pptx). Gemini 2.5 Flash extracts concepts into practice quizzes & challenges.
            </span>
          </div>
        </div>
        <span style={{
          fontSize: '11px',
          fontFamily: 'JetBrains Mono',
          color: 'var(--state-info)',
          background: 'var(--bg-canvas)',
          border: '1px solid var(--border-default)',
          padding: '3px 8px',
          borderRadius: '999px'
        }}>
          ACTIVE TRACK: {subject.toUpperCase()}
        </span>
      </div>

      {/* Selected File Display OR Upload Button Bar */}
      {selectedFile ? (
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>📑</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-high)' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB · Ready to ingest
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-medium)',
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartUpload}
              disabled={isProcessing}
              style={{
                background: 'var(--accent-primary)',
                color: '#0b0d14',
                fontWeight: 700,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 20px',
                fontSize: '12.5px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px var(--accent-glow)'
              }}
            >
              {isProcessing ? '⚡ Processing with Gemini...' : '🚀 Ingest & Extract Curriculum'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          padding: '16px',
          background: 'var(--bg-canvas)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '14px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--accent-primary)',
              color: '#0b0d14',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 22px',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 12px var(--accent-glow)'
            }}
          >
            <span>📁</span> Choose Lecture File (.pdf, .docx, .pptx)
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
            or drag & drop your slides directly here
          </span>
        </div>
      )}

      {/* Success / Error / Staged Review Notification Banner */}
      {statusMessage ? (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12.5px',
          marginBottom: '14px',
          background: statusMessage.type === 'success' ? 'rgba(0, 229, 163, 0.08)' : 'rgba(255, 51, 102, 0.1)',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--accent-primary)' : 'var(--state-error)'}`,
          color: 'var(--text-high)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>{statusMessage.text}</div>
            {statusMessage.type === 'success' && (
              <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '4px' }}>
                Your study guide, practice quizzes, and sandbox challenge are ready. Choose where you want to start:
              </div>
            )}
          </div>
          {statusMessage.type === 'success' && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onSelectTab && (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectTab('study')}
                    style={{
                      background: 'var(--accent-primary)',
                      color: '#0b0d14',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    📖 Read Reviewer Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('quiz')}
                    style={{
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--state-info)',
                      color: 'var(--state-info)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Practice Quizzes
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('challenge')}
                    style={{
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--state-warning)',
                      color: 'var(--state-warning)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    💻 Coding Challenge
                  </button>
                </>
              )}
              {onSwitchRole && (
                <button
                  type="button"
                  onClick={() => onSwitchRole('instructor')}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-medium)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  🔬 Instructor Queue
                </button>
              )}
            </div>
          )}
        </div>
      ) : (stagedCount > 0 && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          marginBottom: '14px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: 'var(--text-high)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <span style={{ fontWeight: 600 }}>📋 {stagedCount} AI activities staged and ready for review.</span>
            <div style={{ fontSize: '11px', color: 'var(--text-medium)', marginTop: '2px' }}>
              Inspect them in the Instructor Queue or publish them directly to student study tabs.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onSwitchRole && (
              <button
                type="button"
                onClick={() => onSwitchRole('instructor')}
                style={{
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--state-info)',
                  color: 'var(--state-info)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                🔬 Inspect in Instructor Mode
              </button>
            )}
            {onPublishAll && (
              <button
                type="button"
                disabled={isPublishing}
                onClick={async () => {
                  setIsPublishing(true);
                  try {
                    await onPublishAll();
                  } finally {
                    setIsPublishing(false);
                  }
                }}
                style={{
                  background: 'var(--state-info)',
                  color: '#0b0d14',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: isPublishing ? 'not-allowed' : 'pointer'
                }}
              >
                {isPublishing ? 'Publishing...' : '🚀 Publish All to Class'}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* 1-Click Instant Demo Benchmarks */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: 600 }}>
          ⚡ 1-Click Sample Lectures (Instant Test):
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onLoadSample('cpp')}
            disabled={isProcessing}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-primary)',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            ⚡ C++ Pointers & RAII
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('python')}
            disabled={isProcessing}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--state-info)',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            ⚡ Python Mutable Trap
          </button>
          <button
            type="button"
            onClick={() => onLoadSample('java')}
            disabled={isProcessing}
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--state-warning)',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            ⚡ Java Reference Equality
          </button>
        </div>
      </div>
    </div>
  );
}
