import uuid
from backend.database import SessionLocal, engine, Base
from backend.models import Student, Activity, Submission, TelemetryRecord
from backend.services.ml_engine import ml_engine

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Seed Student Roster
    students_data = [
        {"id": "std_001_alex", "name": "Alex (You)", "level": 2, "total_xp": 140, "streak_days": 4, "badges": ["hello_world", "quiz_ace", "streak_vanguard"]},
        {"id": "std_002_ada", "name": "ada_lovelace", "level": 4, "total_xp": 480, "streak_days": 12, "badges": ["hello_world", "quiz_ace", "polyglot", "algorithmic_master"]},
        {"id": "std_003_jrizal", "name": "jrizal_dev", "level": 3, "total_xp": 390, "streak_days": 7, "badges": ["hello_world", "socratic_scholar", "bug_squasher"]},
        {"id": "std_004_kat", "name": "kernel_kat", "level": 2, "total_xp": 210, "streak_days": 3, "badges": ["hello_world", "streak_vanguard"]},
        {"id": "std_005_null", "name": "null_ptr", "level": 1, "total_xp": 90, "streak_days": 1, "badges": ["hello_world"]}
    ]

    for s in students_data:
        existing = db.query(Student).filter(Student.id == s["id"]).first()
        if not existing:
            db.add(Student(**s))

    # 2. Seed Activities for C++, Python, and Java (Published by default)
    activities_data = [
        # C++ Quiz 1
        {
            "id": "act_cpp_q1",
            "subject": "cpp",
            "activity_type": "quiz",
            "title": "C++ Pointers & Memory Safety",
            "concept": "Pointers & Memory",
            "difficulty": "medium",
            "content": {
                "id": "cpp_q1",
                "concept": "Pointers & Memory",
                "difficulty": "medium",
                "question": "What bug occurs when returning a pointer to a local stack variable in C++?",
                "options": [
                    "Dangling pointer: local stack frame is deallocated on return",
                    "Compile error: local pointers cannot be returned",
                    "Memory leak: stack allocations are never cleaned up",
                    "Segmentation fault only if variable is an array"
                ],
                "correct_index": 0,
                "explanation": "Stack memory is reclaimed when the function scope exits. Accessing that address later results in undefined behavior."
            },
            "test_cases": [],
            "is_published": True
        },
        # C++ Quiz 2
        {
            "id": "act_cpp_q2",
            "subject": "cpp",
            "activity_type": "quiz",
            "title": "C++ Smart Pointers",
            "concept": "RAII & Smart Pointers",
            "difficulty": "easy",
            "content": {
                "id": "cpp_q2",
                "concept": "RAII & Smart Pointers",
                "difficulty": "easy",
                "question": "Which modern C++ smart pointer enforces exclusive, non-copyable ownership of dynamic memory?",
                "options": ["std::unique_ptr", "std::shared_ptr", "std::weak_ptr", "std::auto_ptr"],
                "correct_index": 0,
                "explanation": "std::unique_ptr cannot be copied, only moved via std::move, ensuring single ownership."
            },
            "test_cases": [],
            "is_published": True
        },
        # C++ Challenge
        {
            "id": "act_cpp_ch1",
            "subject": "cpp",
            "activity_type": "challenge",
            "title": "Reverse a Singly Linked List",
            "concept": "Pointers & Nodes",
            "difficulty": "medium",
            "content": {
                "id": "cpp_ch1",
                "title": "Reverse a Singly Linked List",
                "concept": "Pointers & Nodes",
                "difficulty": "medium",
                "prompt": "Implement reverseList(Node* head) to reverse a singly linked list in-place in O(n) time and O(1) extra space.",
                "starter_code": "struct Node {\n    int val;\n    Node* next;\n};\n\nNode* reverseList(Node* head) {\n    Node* prev = nullptr;\n    Node* curr = head;\n    while (curr != nullptr) {\n        Node* nextTemp = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nextTemp;\n    }\n    return prev;\n}",
                "solution_code": "// Solution",
                "test_cases": [
                    {"input_data": "1->2->3", "expected_output": "3->2->1", "is_hidden": False},
                    {"input_data": "nullptr", "expected_output": "nullptr", "is_hidden": False}
                ]
            },
            "test_cases": [
                {"input_data": "1->2->3", "expected_output": "3->2->1", "is_hidden": False},
                {"input_data": "nullptr", "expected_output": "nullptr", "is_hidden": False}
            ],
            "is_published": True
        },
        # Python Quiz
        {
            "id": "act_py_q1",
            "subject": "python",
            "activity_type": "quiz",
            "title": "Python Mutable Defaults",
            "concept": "Function Arguments",
            "difficulty": "medium",
            "content": {
                "id": "py_q1",
                "concept": "Function Arguments",
                "difficulty": "medium",
                "question": "Why is `def append_item(val, target=[])` a critical anti-pattern in Python?",
                "options": [
                    "The default list is instantiated once at function definition and shared across calls",
                    "Python raises a SyntaxError because lists cannot be default parameters",
                    "The list is garbage-collected immediately after each return statement",
                    "It causes a thread lock in the Python Global Interpreter Lock (GIL)"
                ],
                "correct_index": 0,
                "explanation": "Default arguments in Python are evaluated once when the function is defined. A mutable default retains changes across all subsequent invocations."
            },
            "test_cases": [],
            "is_published": True
        },
        # Python Challenge
        {
            "id": "act_py_ch1",
            "subject": "python",
            "activity_type": "challenge",
            "title": "Safe Default Argument Fix",
            "concept": "Function Arguments",
            "difficulty": "easy",
            "content": {
                "id": "py_ch1",
                "title": "Safe Default Argument Fix",
                "concept": "Function Arguments",
                "difficulty": "easy",
                "prompt": "Fix the mutable default bug in collect_data(entry, accumulator=None) so each call gets an isolated list unless an existing list is passed.",
                "starter_code": "def collect_data(entry, accumulator=None):\n    if accumulator is None:\n        accumulator = []\n    accumulator.append(entry)\n    return accumulator",
                "solution_code": "// Solution",
                "test_cases": [
                    {"input_data": "'first'", "expected_output": "['first']", "is_hidden": False}
                ]
            },
            "test_cases": [
                {"input_data": "'first'", "expected_output": "['first']", "is_hidden": False}
            ],
            "is_published": True
        },
        # Java Quiz
        {
            "id": "act_java_q1",
            "subject": "java",
            "activity_type": "quiz",
            "title": "Java Object Reference Equality",
            "concept": "String Equality",
            "difficulty": "easy",
            "content": {
                "id": "java_q1",
                "concept": "String Equality",
                "difficulty": "easy",
                "question": "Why must String equality in Java be tested with .equals() rather than ==?",
                "options": [
                    "== checks memory address identity, whereas .equals() evaluates character contents",
                    "== triggers a compile error for any reference type",
                    ".equals() runs on a separate worker thread to prevent UI freezing",
                    "Strings in Java are primitive types and do not support comparison operators"
                ],
                "correct_index": 0,
                "explanation": "In Java, == verifies if two references point to the exact same object in heap memory. To test semantic value equality, .equals() must be invoked."
            },
            "test_cases": [],
            "is_published": True
        },
        # Java Challenge
        {
            "id": "act_java_ch1",
            "subject": "java",
            "activity_type": "challenge",
            "title": "Palindrome String Validator",
            "concept": "String Manipulation & Two Pointers",
            "difficulty": "easy",
            "content": {
                "id": "java_ch1",
                "title": "Palindrome String Validator",
                "concept": "String Manipulation & Two Pointers",
                "difficulty": "easy",
                "prompt": "Implement a public class Solution that reads a line of input and prints 'true' if alphanumeric characters form a palindrome, or 'false' otherwise.",
                "starter_code": "import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextLine()) {\n            String s = scanner.nextLine().replaceAll(\"[^a-zA-Z0-9]\", \"\").toLowerCase();\n            String rev = new StringBuilder(s).reverse().toString();\n            System.out.println(s.equals(rev));\n        }\n    }\n}",
                "solution_code": "// Solution",
                "test_cases": [
                    {"input_data": "racecar", "expected_output": "true", "is_hidden": False},
                    {"input_data": "hello", "expected_output": "false", "is_hidden": False}
                ]
            },
            "test_cases": [
                {"input_data": "racecar", "expected_output": "true", "is_hidden": False},
                {"input_data": "hello", "expected_output": "false", "is_hidden": False}
            ],
            "is_published": True
        }
    ]

    for act in activities_data:
        existing = db.query(Activity).filter(Activity.id == act["id"]).first()
        if not existing:
            db.add(Activity(**act))

    # 3. Seed Benchmark Telemetry Records for Machine Learning (120 records)
    if db.query(TelemetryRecord).count() < 50:
        telemetry_samples = ml_engine.generate_synthetic_telemetry(120)
        for t in telemetry_samples:
            rec = TelemetryRecord(
                id=f"tel_{uuid.uuid4().hex[:8]}",
                student_id=t.student_id,
                task_id=t.task_id,
                language=t.language,
                prior_quiz_accuracy=t.prior_quiz_accuracy,
                avg_solve_time_seconds=t.avg_solve_time_seconds,
                compilation_error_count=t.compilation_error_count,
                attempts_before_success=t.attempts_before_success,
                hints_requested_count=t.hints_requested_count,
                task_difficulty_level=t.task_difficulty_level,
                target_task_success=t.target_task_success
            )
            db.add(rec)

    db.commit()
    print("Database seeded with students, curriculum activities, and ML telemetry!")
    db.close()

if __name__ == "__main__":
    seed_database()
