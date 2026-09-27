# ByteQuest — AI-Assisted Educational Platform & Empirical ML Pipeline

ByteQuest is a decoupled, modular full-stack application built for the College of Information Technology Education at North Eastern Mindanao State University (NEMSU). It integrates Google Gemini 2.5 Flash for lecture document extraction and Socratic tutoring with a comparative Scikit-learn machine learning engine (Logistic Regression vs. Random Forest) to predict student task success.

---

## 📁 Repository Structure

```
ByteQuest/
├── docker-compose.yml                   # Multi-container orchestration
├── backend/                             # Python FastAPI Backend Service
│   ├── Dockerfile                       # Python 3.11 with GCC & OpenJDK compilers
│   ├── requirements.txt                 # Dependencies (FastAPI, Scikit-learn, google-genai, etc.)
│   ├── config.py                        # Environment settings & CORS configuration
│   ├── database.py                      # SQLAlchemy ORM engine & SQLite persistence
│   ├── main.py                          # Application gateway & router assembly
│   ├── models/                          # Database ORM entities
│   │   ├── student.py                   # XP, Level, Badges, Roster
│   │   ├── activity.py                  # Quizzes, Challenges, Test Cases
│   │   ├── submission.py                # Student code submissions & scores
│   │   └── telemetry.py                 # Tabular ML feature log
│   ├── schemas/                         # Pydantic Schemas & Gemini JSON contracts
│   │   ├── content_schema.py            # Gemini 2.5 Flash structured output
│   │   ├── execution_schema.py          # Code run requests & test results
│   │   └── ml_schema.py                 # Feature vectors & model metrics
│   ├── services/                        # Business logic micro-services
│   │   ├── gemini_service.py            # Gemini 2.5 Flash SDK & Socratic ByteBot tutor
│   │   ├── document_parser.py           # Ingestion for PDF (pypdf), DOCX, and PPTX
│   │   ├── code_executor.py             # Sandboxed Python, GCC (C++), and JDK (Java) runner
│   │   ├── ml_engine.py                 # Scikit-learn: Logistic Regression vs. Random Forest
│   │   └── adaptive_engine.py           # Adaptive sequencing algorithm (P < 0.5)
│   └── routers/                         # API endpoints
│       ├── materials.py                 # File upload & Gemini activity staging
│       ├── student.py                   # Quizzes, reviews, ByteBot tutor chat
│       ├── instructor.py                # Content validation, publishing, and roster analytics
│       ├── code.py                      # Automated test case submission
│       ├── ml.py                        # Model training, comparison metrics, CSV export
│       └── evaluation.py                # ISO 9126 / SUS survey instrument (Objective 9)
├── sandbox/                             # Sandboxed Execution Environment
│   ├── Dockerfile.runner                # Hardened container for running student code safely
│   └── run_test.sh                      # Execution wrapper with 5s timeout & 256MB memory cap
└── frontend/                            # React 18 + Vite Component-Driven Client
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── Dockerfile                       # Multi-stage production Nginx container
    └── src/
        ├── styles/
        │   ├── tokens.css               # 60-30-10 palette, spacing, radii, state colors
        │   └── typography.css           # Space Grotesk & JetBrains Mono typography
        ├── api/
        │   └── client.js                # REST API client connecting to FastAPI backend
        └── components/
            ├── layout/                  # Topbar (HUD, Level, Streak) & Sidebar
            ├── gamification/            # BadgeGrid, QuestList, Leaderboard
            ├── study/                   # QuizRunner, ReviewerReader, ByteBotDrawer
            ├── ide/                     # CodeEditor, TestConsole
            ├── instructor/              # ContentValidator, RosterMonitor
            ├── ml_dashboard/            # ModelComparator, FeatureTable
            └── evaluation/              # SusSurveyModal (ISO 9126 / SUS Survey)
```

---

## 🚀 Getting Started

### Option 1: 1-Click Master Launcher (Fastest)

Double-click `start.bat` or run:
```bash
python start_app.py
```
This automatically verifies the database, seeds curriculum & telemetry, builds the frontend if needed, launches the server on `http://localhost:8000`, and opens your web browser immediately!

### Option 2: Running with Docker Compose

```bash
docker-compose up --build
```
* **Frontend Client**: `http://localhost:5173`
* **FastAPI Backend & Interactive Swagger Docs**: `http://localhost:8000/docs`

### Option 3: Running Separately for Development

#### 1. Backend Service
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```

---

## 🔬 All 9 Specific Objectives Realized

1. **Multi-Language Support**: Complete curriculum tracks and execution sandboxes for Python, C++, and Java.
2. **AI Document Processing**: Ingestion of PDF, DOCX, and PPTX with Google Gemini 2.5 Flash strict JSON schema extraction into practice quizzes, reviewer notes, and sandbox challenges.
3. **Instructor Validation & Content Governance**: Draft staging queue with review, editing, approval, and live roster analytics before publishing to students.
4. **Automated Programming Assessment**: Code evaluation sandbox with 5-second execution timeout, error capture, and input/output test case diffs.
5. **Telemetry & Feature Logging**: Tabular logging of student performance features (`prior_quiz_accuracy`, `avg_solve_time_seconds`, `compilation_error_count`, `attempts_before_success`, `hints_requested_count`, `task_difficulty_level`).
6. **Comparative Machine Learning**: Scikit-Learn empirical evaluation comparing Logistic Regression (L2) vs. Random Forest (Ensemble) across Accuracy, Precision, Recall, F1-Score, Training Latency, and Confusion Matrices.
7. **Adaptive Sequencing & Real-Time Prediction**: Interactive Live Student Success Inference Simulator with pedagogical intervention recommendations when $P(\text{Success}) < 0.50$.
8. **Gamified Student Engagement & Performance Tracking**: Dual persona HUD, XP progression, level progression with conic ring meter, daily streak counter, badge unlocking system, quests, and cohort leaderboard.
9. **ISO 9126 / SUS Usability Instrument**: Built-in 10-item Likert scale survey calculating the standardized System Usability Scale (SUS) score and qualitative grade.
