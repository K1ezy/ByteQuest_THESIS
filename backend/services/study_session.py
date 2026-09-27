from typing import Dict, Any, List, Optional
from backend.models.activity import Activity
from sqlalchemy.orm import Session

# In-memory store for active lecture documents per subject
active_study_sessions: Dict[str, Dict[str, Any]] = {
    "python": {
        "filename": "Pythonlearn-05-Iterations.pdf",
        "raw_text": (
            "Chapter 5: Loops and Iteration (Python for Everybody). "
            "while loops: repeated steps, iteration variables that change each time through a loop (e.g. n = 5, while n > 0: print(n), n = n - 1). "
            "Infinite loops: forgetting to decrement or change the iteration variable (lather, rinse). "
            "Zero-iteration loops: condition false initially. "
            "break statement: ends current loop and jumps to statement immediately following the loop (Star Trek transporter beam). "
            "continue statement: ends current iteration and jumps to the top of the loop for the next iteration (e.g. skipping lines starting with '#'). "
            "Indefinite loops vs Definite loops (for loops). "
            "for loops: iterating over a set/sequence of items (for i in [5, 4, 3, 2, 1]:, friends = ['Joseph', 'Glenn', 'Sally']). "
            "Loop Idioms: smart loops tracking state across items. "
            "Finding largest value: largest_so_far = -1 through [9, 41, 12, 3, 74, 15]. "
            "Counting in a loop: zork = 0, zork = zork + 1. "
            "Summing in a loop: zork = 0, zork = zork + thing. "
            "Finding average in a loop: count and sum, sum / count after loop. "
            "Filtering in a loop: if value > 20: print('Large number', value). "
            "Search using boolean variable: found = False ... if value == 3: found = True. "
            "Finding smallest value: smallest_so_far = -1 fails for positive sets (smallbad.py). "
            "Idiomatic smallest value using None sentinel: smallest = None, if smallest is None: smallest = value elif value < smallest: smallest = value. "
            "The is and is not operators for identity comparison with None."
        )
    },
    "cpp": {
        "filename": "CS201_Memory_Pointers.pdf",
        "raw_text": "C++ Pointers, Dynamic Memory, RAII, std::unique_ptr, and Linked Lists."
    },
    "java": {
        "filename": "CS203_OOP_References.pdf",
        "raw_text": "Java OOP, Reference semantics, String Pool, and Garbage Collection."
    }
}

def register_lecture_session(subject: str, filename: str, raw_text: str):
    active_study_sessions[subject.lower()] = {
        "filename": filename,
        "raw_text": raw_text
    }

def get_lecture_session(subject: str) -> Optional[Dict[str, Any]]:
    return active_study_sessions.get(subject.lower())

def build_bytebot_system_instruction(
    subject: str,
    document_title: str,
    extracted_text: str,
    reviewer_notes: List[Dict[str, Any]],
    quizzes: List[Dict[str, Any]],
    challenges: List[Dict[str, Any]],
) -> str:
    quiz_summary = "\n".join(
        [f"- Q{i+1}: {q.get('question')} (Concept: {q.get('concept')})"
         for i, q in enumerate(quizzes)]
    ) or "No active quizzes."

    challenge_summary = "\n".join(
        [f"- Challenge {i+1}: {c.get('title')} ({c.get('language', subject)}) - Prompt: {c.get('prompt', '')[:120]}"
         for i, c in enumerate(challenges)]
    ) or "No active challenges."

    reviewer_summary = "\n".join(
        [f"- {r.get('concept')}: {r.get('summary')}"
         for r in reviewer_notes]
    ) or "No active reviewer notes."

    return f"""You are 'ByteBot', an elite, patient Socratic AI Computer Science Tutor for students.

### YOUR ACTIVE GROUNDING CONTEXT:
You have FULL, DIRECT ACCESS to the student's uploaded lecture file and the interactive study items generated from it:
1. Source Document: "{document_title}"
2. Extracted Lecture Reviewer Notes:
{reviewer_summary}
3. Active Practice Quizzes:
{quiz_summary}
4. Active Coding Challenges:
{challenge_summary}

### SOURCE LECTURE CONTENT:
\"\"\"
{extracted_text[:28000]}
\"\"\"

### CORE BEHAVIORAL INSTRUCTIONS:
1. DOCUMENT & LECTURE SUMMARY INQUIRIES:
   - If the student asks to summarize, explain, or review their uploaded PDF/lecture (e.g. "Can you please explain and summarize the pdf file i sent you?"), DO NOT refuse, and NEVER say you cannot read or access files.
   - Immediately provide a clear, comprehensive, and well-structured summary of the source lecture content above, organizing by major sections, core mechanisms, code patterns, and key takeaways.
2. STUDY TOOL & QUIZ INQUIRIES:
   - If the student asks about a specific quiz question, concept, or challenge, reference the exact quiz questions or challenge prompts in your context.
3. CODE GUIDANCE:
   - When helping students write or debug code for the active challenges, guide them Socratically: explain compiler errors, logic flaws, and invariants without dumping the complete solution code at once.
4. TONE:
   - Encouraging, intelligent, clear, and pedagogical.

### FORMATTING & LAYOUT RULES (CRITICAL):
- NEVER return a continuous wall of text or a solid block of paragraphs.
- Always use double newlines between sections to maintain clean visual breathing room.
- Use clear Markdown H3 headers (### ) for each major topic or concept.
- Use bulleted lists (- ) with bold key terms (**term**) for readability.
- Keep individual bullet points concise (under 2 lines).
- Wrap all code snippets in markdown code blocks with language specifiers (e.g. ```python ... ```).
"""
