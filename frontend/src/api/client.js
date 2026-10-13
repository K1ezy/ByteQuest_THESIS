const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '8000' ? '/api' : 'http://localhost:8000/api');

export const getStoredApiKey = () => {
  return localStorage.getItem('bytequest_gemini_key') || '';
};

export const setStoredApiKey = (key) => {
  if (key) {
    localStorage.setItem('bytequest_gemini_key', key.trim());
  } else {
    localStorage.removeItem('bytequest_gemini_key');
  }
};

const getHeaders = (extraHeaders = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const key = getStoredApiKey();
  if (key) {
    headers['X-Gemini-Key'] = key;
  }
  return headers;
};

export const apiClient = {
  // Document Ingestion
  async uploadMaterial(file, subject = 'cpp') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    const headers = {};
    const key = getStoredApiKey();
    if (key) headers['X-Gemini-Key'] = key;

    const res = await fetch(`${API_BASE}/materials/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const errData = await res.json();
        if (errData.detail) detail = errData.detail;
      } catch {}
      throw new Error(`Upload failed: ${detail}`);
    }
    return await res.json();
  },

  async loadSampleLecture(subject = 'cpp') {
    const res = await fetch(`${API_BASE}/materials/sample/${subject}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const errData = await res.json();
        if (errData.detail) detail = errData.detail;
      } catch {}
      throw new Error(`Failed to load sample lecture: ${detail}`);
    }
    return await res.json();
  },

  async verifyApiKey(apiKey) {
    const res = await fetch(`${API_BASE}/materials/verify-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey }),
    });
    return await res.json();
  },

  // Student Profile & Activities
  async getStudentProfile(studentId = 'std_001_alex') {
    try {
      const res = await fetch(`${API_BASE}/student/profile/${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return await res.json();
    } catch {
      return { id: studentId, name: 'Alex (You)', total_xp: 140, level: 2, streak_days: 4, badges: ['hello_world'] };
    }
  },

  async submitQuizResult(payload) {
    const res = await fetch(`${API_BASE}/student/quiz-submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to record quiz results');
    return await res.json();
  },


  async getActivities(subject = 'cpp') {
    const res = await fetch(`${API_BASE}/student/activities/${subject}`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    const data = await res.json();
    if (Array.isArray(data)) {
      return {
        quizzes: data.filter(a => a.activity_type === 'quiz').map(a => a.content || a),
        reviewer: data.filter(a => a.activity_type === 'reviewer').map(a => a.content || a),
        challenges: data.filter(a => a.activity_type === 'challenge').map(a => a.content || a),
      };
    }
    return data;
  },

  async chatWithByteBot(message, subject = 'cpp', context = '', history = []) {
    const res = await fetch(`${API_BASE}/student/chat-tutor`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, subject, context, history }),
    });
    if (!res.ok) throw new Error('ByteBot inquiry failed');
    return await res.json();
  },

  // Code Execution Sandbox
  async submitCode(payload) {
    const res = await fetch(`${API_BASE}/code/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Code evaluation error');
    return await res.json();
  },

  // Machine Learning Pipeline
  async trainAndEvaluateModels() {
    const res = await fetch(`${API_BASE}/ml/train-evaluate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Model training failed');
    return await res.json();
  },

  async getTelemetryFeatures() {
    const res = await fetch(`${API_BASE}/ml/features`);
    if (!res.ok) throw new Error('Failed to fetch telemetry features');
    return await res.json();
  },

  async predictStudentSuccess(featureVector) {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(featureVector),
    });
    if (!res.ok) throw new Error('Prediction request failed');
    return await res.json();
  },

  getExportCsvUrl() {
    return `${API_BASE}/ml/export-csv`;
  },

  // Instructor
  async getStagedActivities() {
    const res = await fetch(`${API_BASE}/instructor/staged-activities`);
    return await res.json();
  },

  async publishActivities(activityIds = []) {
    const res = await fetch(`${API_BASE}/instructor/publish`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ activity_ids: activityIds }),
    });
    return await res.json();
  },

  async getRosterAnalytics() {
    const res = await fetch(`${API_BASE}/instructor/roster-analytics`);
    return await res.json();
  },

  // SUS Usability Survey
  async submitSusSurvey(survey) {
    const res = await fetch(`${API_BASE}/evaluation/sus-submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(survey),
    });
    return await res.json();
  }
};
