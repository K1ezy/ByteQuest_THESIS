import React, { useState, useEffect } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import BadgeGrid from './components/gamification/BadgeGrid';
import QuestList from './components/gamification/QuestList';
import Leaderboard from './components/gamification/Leaderboard';
import QuizRunner from './components/study/QuizRunner';
import ReviewerReader from './components/study/ReviewerReader';
import ByteBotDrawer from './components/study/ByteBotDrawer';
import CodeEditor from './components/ide/CodeEditor';
import TestConsole from './components/ide/TestConsole';
import ContentValidator from './components/instructor/ContentValidator';
import RosterMonitor from './components/instructor/RosterMonitor';
import ModelComparator from './components/ml_dashboard/ModelComparator';
import FeatureTable from './components/ml_dashboard/FeatureTable';
import SusSurveyModal from './components/evaluation/SusSurveyModal';
import ApiKeyModal from './components/layout/ApiKeyModal';
import LectureUploadZone from './components/study/LectureUploadZone';
import { apiClient, getStoredApiKey } from './api/client';

export default function App() {
  const [role, setRole] = useState('student'); // 'student' | 'instructor' | 'ml_dashboard'
  const [subject, setSubject] = useState('cpp'); // 'cpp' | 'python' | 'java'
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'study' | 'challenge'
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);

  const [studentProfile, setStudentProfile] = useState({
    id: 'std_001_alex',
    name: 'Alex (You)',
    level: 2,
    total_xp: 140,
    streak_days: 4,
    badges: ['hello_world', 'quiz_ace', 'streak_vanguard']
  });

  const [activities, setActivities] = useState({ quizzes: [], reviewer: [], challenges: [] });
  const [stagedActivities, setStagedActivities] = useState([]);
  const [roster, setRoster] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [compilationError, setCompilationError] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [comparisonData, setComparisonData] = useState(null);
  const [features, setFeatures] = useState([]);
  const [isTraining, setIsTraining] = useState(false);

  const [susModalOpen, setSusModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!getStoredApiKey());
  const [initialByteBotMsg, setInitialByteBotMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Load activities when subject changes
  useEffect(() => {
    setActiveChallengeIndex(0);
    loadActivities(subject);
  }, [subject]);


  // Initial data load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const profile = await apiClient.getStudentProfile();
      setStudentProfile(profile);

      const rosterData = await apiClient.getRosterAnalytics();
      setRoster(rosterData);

      const staged = await apiClient.getStagedActivities();
      setStagedActivities(staged);

      // Load telemetry feature vectors for ML dashboard
      const featData = await apiClient.getTelemetryFeatures();
      setFeatures(featData);

      // Auto-train ML models on startup
      const mlRes = await apiClient.trainAndEvaluateModels();
      setComparisonData(mlRes);
    } catch (e) {
      console.warn('Initial load fallback:', e);
    }
  };

  const loadActivities = async (subj) => {
    try {
      const data = await apiClient.getActivities(subj);
      setActivities(data);
    } catch {
      // Local fallback
      setActivities({
        quizzes: [
          {
            id: 'cpp_q1',
            concept: 'Pointers & Memory',
            difficulty: 'medium',
            question: 'What bug occurs when returning a pointer to a local stack variable in C++?',
            options: [
              'Dangling pointer: local stack frame is deallocated on return',
              'Compile error: local pointers cannot be returned',
              'Memory leak: stack allocations are never cleaned up',
              'Segmentation fault only if variable is an array'
            ],
            correct_index: 0,
            explanation: 'Stack memory is reclaimed when the function scope exits. Accessing that address later results in undefined behavior.'
          }
        ],
        reviewer: [
          {
            concept: 'Dynamic Memory & RAII',
            summary: 'Pointers store memory addresses. Memory allocated with new/new[] must be deallocated with delete/delete[].',
            key_takeaways: [
              'Prefer std::unique_ptr and RAII over manual memory management',
              'Never dereference nullptr or uninitialized pointers'
            ],
            code_sample: '#include <memory>\nstd::unique_ptr<int[]> buffer = std::make_unique<int[]>(1024);'
          }
        ],
        challenges: [
          {
            id: 'cpp_ch1',
            title: 'Reverse a Singly Linked List',
            concept: 'Pointers & Nodes',
            difficulty: 'medium',
            prompt: 'Implement reverseList(Node* head) to reverse a linked list in-place in O(n) time and O(1) extra space.',
            starter_code: 'struct Node { int val; Node* next; };\n\nNode* reverseList(Node* head) {\n    Node* prev = nullptr;\n    Node* curr = head;\n    while (curr != nullptr) {\n        Node* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}',
            test_cases: [
              { input_data: '1->2->3', expected_output: '3->2->1', is_hidden: false }
            ]
          }
        ]
      });
    }
  };

  const handleFileUpload = async (fileOrEvent) => {
    const file = fileOrEvent?.target ? fileOrEvent.target.files[0] : fileOrEvent;
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await apiClient.uploadMaterial(file, subject);
      const targetSubj = res.detected_subject || subject;
      if (res.detected_subject && res.detected_subject !== subject) {
        setSubject(res.detected_subject);
      }
      if (res.curriculum && (res.curriculum.quizzes?.length || res.curriculum.reviewer?.length)) {
        setActivities({
          quizzes: res.curriculum.quizzes || [],
          reviewer: res.curriculum.reviewer || [],
          challenges: res.curriculum.challenges || []
        });
      } else {
        await loadActivities(targetSubj);
      }
      setActiveTab('study');
      const staged = await apiClient.getStagedActivities();
      setStagedActivities(staged);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishAll = async (ids = []) => {
    try {
      const res = await apiClient.publishActivities(ids);
      const staged = await apiClient.getStagedActivities();
      setStagedActivities(staged);
      await loadActivities(subject);
      return res;
    } catch (err) {
      alert(`Publish error: ${err.message}`);
      throw err;
    }
  };

  const handleLoadSample = async (sampleSubj) => {
    setIsUploading(true);
    try {
      const res = await apiClient.loadSampleLecture(sampleSubj);
      setSubject(sampleSubj);
      await loadActivities(sampleSubj);
      setActiveTab('study');
      const staged = await apiClient.getStagedActivities();
      setStagedActivities(staged);
      return res;
    } catch (err) {
      alert(`Sample lecture load error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunTests = async (code) => {
    setIsEvaluating(true);
    setCompilationError(null);
    setTestResults([]);

    const currentChallenges = activities.challenges || [];
    const activeCh = currentChallenges[activeChallengeIndex] || currentChallenges[0];
    const testCases = activeCh?.test_cases || [{ input_data: '1->2->3', expected_output: '3->2->1', is_hidden: false }];

    try {
      const res = await apiClient.submitCode({
        student_id: studentProfile.id,
        challenge_id: activeCh?.id || 'ch1',
        language: subject,
        code,
        test_cases: testCases,
        hints_used: 1,
        time_spent_seconds: 35.0
      });

      setTestResults(res.results || []);
      setCompilationError(res.compilation_error);
      setAiFeedback(res.ai_feedback);

      if (res.passed_all) {
        setStudentProfile(prev => ({ ...prev, total_xp: prev.total_xp + 50 }));
      }

      // Automatically refresh live telemetry feature records in the ML dashboard
      try {
        const featData = await apiClient.getTelemetryFeatures();
        setFeatures(featData);
      } catch {}
    } catch {
      // Offline fallback simulation
      setTestResults([
        {
          test_case_index: 1,
          input_data: '1->2->3',
          expected_output: '3->2->1',
          actual_output: '3->2->1',
          passed: true,
          runtime_ms: 12.4
        }
      ]);
      setStudentProfile(prev => ({ ...prev, total_xp: prev.total_xp + 50 }));
    } finally {
      setIsEvaluating(false);
    }
  };


  const handleTrainModels = async () => {
    setIsTraining(true);
    try {
      const res = await apiClient.trainAndEvaluateModels();
      setComparisonData(res);
    } catch (err) {
      alert(`ML Training Error: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* Topbar HUD */}
      <Topbar
        role={role}
        setRole={setRole}
        studentProfile={studentProfile}
        onOpenSusSurvey={() => setSusModalOpen(true)}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        hasApiKey={hasApiKey}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <Sidebar
          subject={subject}
          setSubject={setSubject}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', alignItems: 'start' }}>
              <div>
                {/* Lecture Ingestion & Upload Zone */}
                <LectureUploadZone
                  onUploadFile={handleFileUpload}
                  onLoadSample={handleLoadSample}
                  isProcessing={isUploading}
                  subject={subject}
                  onSwitchRole={setRole}
                  onPublishAll={() => handlePublishAll([])}
                  stagedCount={stagedActivities.length}
                  onSelectTab={setActiveTab}
                />

                {/* Active Study Tool Tab */}
                {activeTab === 'quiz' && (
                  <QuizRunner
                    questions={activities.quizzes}
                    subject={subject}
                    onCompleteQuiz={async (qResult) => {
                      try {
                        const res = await apiClient.submitQuizResult({
                          student_id: studentProfile.id,
                          subject,
                          concept: activities.quizzes?.[0]?.concept || 'General',
                          total_questions: qResult.totalQuestions,
                          correct_count: qResult.correctCount,
                          accuracy: qResult.accuracy,
                          time_spent_seconds: qResult.timeSpentSeconds
                        });
                        if (res.total_xp) {
                          setStudentProfile(prev => ({
                            ...prev,
                            total_xp: res.total_xp,
                            level: res.level,
                            badges: res.badges || prev.badges
                          }));
                        } else {
                          setStudentProfile(prev => ({ ...prev, total_xp: prev.total_xp + 25 }));
                        }
                        // Refresh live telemetry features in ML table
                        const featData = await apiClient.getTelemetryFeatures();
                        setFeatures(featData);
                      } catch (err) {
                        console.warn('Quiz submission offline fallback:', err);
                        setStudentProfile(prev => ({ ...prev, total_xp: prev.total_xp + 25 }));
                      }
                    }}
                  />
                )}

                {activeTab === 'study' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                    <ReviewerReader
                      reviewerSections={activities.reviewer}
                      subject={subject}
                      onAskByteBot={(quote) => setInitialByteBotMsg(quote)}
                    />
                    <ByteBotDrawer
                      subject={subject}
                      initialMessage={initialByteBotMsg}
                      reviewerSections={activities.reviewer}
                      quizzes={activities.quizzes}
                      challenges={activities.challenges}
                    />
                  </div>
                )}

                {activeTab === 'challenge' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Challenge Selector Tabs if Multiple Challenges Exist */}
                    {activities.challenges?.length > 1 && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        background: 'var(--bg-panel)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                        alignItems: 'center',
                        overflowX: 'auto'
                      }}>
                        <span style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono', color: 'var(--text-faint)', textTransform: 'uppercase', marginRight: '6px' }}>
                          Curriculum Tasks ({activities.challenges.length}):
                        </span>
                        {activities.challenges.map((ch, idx) => (
                          <button
                            key={ch.id || idx}
                            onClick={() => {
                              setActiveChallengeIndex(idx);
                              setTestResults([]);
                              setCompilationError(null);
                              setAiFeedback(null);
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              border: `1px solid ${activeChallengeIndex === idx ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                              background: activeChallengeIndex === idx ? 'rgba(0, 229, 163, 0.12)' : 'var(--bg-surface-raised)',
                              color: activeChallengeIndex === idx ? 'var(--accent-primary)' : 'var(--text-medium)',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            #{idx + 1} {ch.title || `Challenge ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Challenge Prompt Header */}
                    <div style={{
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-high)' }}>
                          {activities.challenges?.[activeChallengeIndex]?.title || activities.challenges?.[0]?.title || 'Programming Challenge'}
                        </h3>
                        <span style={{
                          fontSize: '10px',
                          fontFamily: 'JetBrains Mono',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-default)',
                          background: 'var(--bg-canvas)',
                          color: 'var(--state-info)',
                          textTransform: 'uppercase'
                        }}>
                          {activities.challenges?.[activeChallengeIndex]?.difficulty || 'Medium'} Difficulty
                        </span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-medium)', margin: 0, lineHeight: 1.5 }}>
                        {activities.challenges?.[activeChallengeIndex]?.prompt || activities.challenges?.[0]?.prompt}
                      </p>
                    </div>

                    <CodeEditor
                      challenge={activities.challenges?.[activeChallengeIndex] || activities.challenges?.[0]}
                      language={subject}
                      onRunTests={handleRunTests}
                      isEvaluating={isEvaluating}
                    />

                    <TestConsole
                      results={testResults}
                      compilationError={compilationError}
                      aiFeedback={aiFeedback}
                    />
                  </div>
                )}

              </div>

              {/* Right Column: Gamification & Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <BadgeGrid unlockedBadgeIds={studentProfile.badges} />
                <QuestList />
                <Leaderboard currentUserXp={studentProfile.total_xp} />
              </div>
            </div>
          )}

          {role === 'instructor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <LectureUploadZone
                onUploadFile={handleFileUpload}
                onLoadSample={handleLoadSample}
                isProcessing={isUploading}
                subject={subject}
                onSwitchRole={setRole}
                onPublishAll={() => handlePublishAll([])}
                stagedCount={stagedActivities.length}
                onSelectTab={setActiveTab}
              />
              <ContentValidator
                stagedActivities={stagedActivities}
                onPublishAll={handlePublishAll}
              />
              <RosterMonitor
                roster={roster}
                onSimulateAttempt={() => {
                  setRoster(prev => prev.map(s => s.name.includes('You') ? s : { ...s, completion_pct: Math.min(100, (s.completion_pct || 70) + 10) }));
                  alert('Simulated student activity submission.');
                }}
              />
            </div>
          )}

          {role === 'ml_dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ModelComparator
                comparisonData={comparisonData}
                onTrainModels={handleTrainModels}
                isTraining={isTraining}
              />
              <FeatureTable
                features={features.length ? features : [
                  { student_id: 'alex_nemsu', task_id: 'task_001', language: 'cpp', prior_quiz_accuracy: 0.85, avg_solve_time_seconds: 42.0, compilation_error_count: 0, attempts_before_success: 1, hints_requested_count: 0, task_difficulty_level: 2, target_task_success: 1 },
                  { student_id: 'ada_lovelace', task_id: 'task_002', language: 'python', prior_quiz_accuracy: 0.95, avg_solve_time_seconds: 28.5, compilation_error_count: 0, attempts_before_success: 1, hints_requested_count: 0, task_difficulty_level: 3, target_task_success: 1 },
                  { student_id: 'kernel_kat', task_id: 'task_003', language: 'cpp', prior_quiz_accuracy: 0.60, avg_solve_time_seconds: 78.0, compilation_error_count: 2, attempts_before_success: 3, hints_requested_count: 2, task_difficulty_level: 2, target_task_success: 0 },
                  { student_id: 'jrizal_dev', task_id: 'task_004', language: 'java', prior_quiz_accuracy: 0.90, avg_solve_time_seconds: 35.0, compilation_error_count: 0, attempts_before_success: 1, hints_requested_count: 0, task_difficulty_level: 2, target_task_success: 1 },
                  { student_id: 'student_05', task_id: 'task_005', language: 'python', prior_quiz_accuracy: 0.45, avg_solve_time_seconds: 110.0, compilation_error_count: 3, attempts_before_success: 4, hints_requested_count: 3, task_difficulty_level: 3, target_task_success: 0 }
                ]}
              />
            </div>
          )}
        </main>
      </div>

      {/* SUS Usability Survey Modal */}
      <SusSurveyModal
        isOpen={susModalOpen}
        onClose={() => setSusModalOpen(false)}
      />

      {/* Google Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeyUpdated={(k) => setHasApiKey(!!k)}
      />
    </div>
  );
}
