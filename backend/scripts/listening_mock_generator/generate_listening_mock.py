#!/usr/bin/env python3
"""
HKDSE English Paper 3 (Listening & Integrated Skills) Mock Generator
====================================================================
A standardised Python script to generate Listening Mock exam JSON files
that strictly follow the 'Smart City 2026 FullMock' golden-standard schema.

Key design rules extracted from the golden standard:
1.  **meta** block with title, topic, difficulty, total_marks_part_a/b.
2.  **Part_A**:
    - Exactly 4 Tasks (Task_1 … Task_4).
    - Task 1 = Form-filling (dialogue, ~12-14 Fill_in_Blanks).
    - Task 2 = Presentation / Notes (monologue, ~12-16 mixed Fill_in_Blanks + Multiple_Choice).
    - Task 3 = Panel discussion / Tick boxes (3 speakers, ~10-12 mixed).
    - Task 4 = Stakeholder matrix (3 speakers, ~10-13 Fill_in_Blanks).
    - script[] array with Announcer, speakers, pauses.
    - Announcer lines MUST contain exact pause seconds:
        "(120-second pause)"  -> study time
        "(60-second pause to tidy up answers)"
        "(300-second pause)"  -> end of Part A
        "(4200-second pause)" -> end of exam writing time
3.  **Part_B**:
    - data_file[] with 8-11 documents (minutes, brochure, email, newspaper,
      handwritten_note, table, social_media_post, memo, news_clip,
      policy_draft, archive/red-herring).
    - Part_B1 (Tasks 5-7): shorter writing tasks (email, notice, summary).
    - Part_B2 (Tasks 8-10): longer writing tasks (letter, memo, social post).
    - Each task has: id, type, instructions, wordCount, grading_rubric
      with content_points, tone, optional deductions / oral_info_weight.
4.  **Voice gender rules**: Male voice for male characters, Female voice for
    female characters. Announcer is usually male.
5.  **Script story**: Natural, HK-contextual dialogue with distractors and
    self-corrections so answers are not too obvious.

Usage
-----
    python generate_listening_mock.py --topic "The Future of Food" \
        --output backend/generated_mocks/listening/Listening_The_Future_of_Food_2026.json

The script can also be imported as a module:
    from generate_listening_mock import build_mock_exam, save_mock

Author: Ace It! AI Team
Date:   2026-05-17
"""

import json
import argparse
from pathlib import Path
from typing import Any


# ---------------------------------------------------------------------------
# Constants & helpers
# ---------------------------------------------------------------------------

def announcer(text: str) -> dict:
    return {"speaker": "Announcer", "text": text}


def speaker(name: str, text: str) -> dict:
    return {"speaker": name, "text": text}


def fill_blank(qid: str, label: str, answer: str) -> dict:
    return {"id": qid, "type": "Fill_in_Blanks", "label": label, "answer": answer}


def multi_choice(qid: str, question: str, options: list[str], answer: str) -> dict:
    return {
        "id": qid,
        "type": "Multiple_Choice",
        "question": question,
        "options": options,
        "answer": answer,
    }


def doc(doc_id: str, doc_type: str, title: str, content: str, **extra) -> dict:
    d = {"id": doc_id, "type": doc_type, "title": title, "content": content}
    d.update(extra)
    return d


def task_b(
    task_id: str,
    task_type: str,
    instructions: str,
    word_count: int,
    content_points: list[str],
    tone: str,
    deductions: list[dict] | None = None,
    oral_info_weight: float | None = None,
) -> dict:
    rubric = {"content_points": content_points, "tone": tone}
    if deductions:
        rubric["deductions"] = deductions
    if oral_info_weight is not None:
        rubric["oral_info_weight"] = oral_info_weight
    return {
        "id": task_id,
        "type": task_type,
        "instructions": instructions,
        "wordCount": word_count,
        "grading_rubric": rubric,
    }


# ---------------------------------------------------------------------------
# Exam builder class
# ---------------------------------------------------------------------------

class ListeningMockBuilder:
    """
    Builder that constructs a full Listening Mock JSON object.
    Override the topic-specific methods in a subclass, or pass data dicts.
    """

    def __init__(self, title: str, topic: str, difficulty: str = "Level 5** Authentic (High Stamina)"):
        self.title = title
        self.topic = topic
        self.difficulty = difficulty
        self.data: dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Part A helpers
    # ------------------------------------------------------------------
    def build_part_a(self, tasks: list[dict], script: list[dict]) -> dict:
        return {"tasks": tasks, "script": script}

    # ------------------------------------------------------------------
    # Part B helpers
    # ------------------------------------------------------------------
    def build_part_b(
        self,
        data_file: list[dict],
        part_b1_tasks: list[dict],
        part_b2_tasks: list[dict],
    ) -> dict:
        return {
            "data_file": data_file,
            "Part_B1": {"tasks": part_b1_tasks},
            "Part_B2": {"tasks": part_b2_tasks},
        }

    # ------------------------------------------------------------------
    # Assembly
    # ------------------------------------------------------------------
    def assemble(
        self,
        part_a_tasks: list[dict],
        part_a_script: list[dict],
        data_file: list[dict],
        part_b1_tasks: list[dict],
        part_b2_tasks: list[dict],
        total_marks_a: int = 50,
        total_marks_b: int = 50,
    ) -> dict:
        return {
            "meta": {
                "title": self.title,
                "topic": self.topic,
                "difficulty": self.difficulty,
                "total_marks_part_a": total_marks_a,
                "total_marks_part_b": total_marks_b,
            },
            "Part_A": self.build_part_a(part_a_tasks, part_a_script),
            "Part_B": self.build_part_b(data_file, part_b1_tasks, part_b2_tasks),
        }


# ---------------------------------------------------------------------------
# Generic script generators (follow golden-standard pause contract)
# ---------------------------------------------------------------------------

def make_opening_announcements() -> list[dict]:
    """Standard HKDSE Paper 3 opening lines."""
    return [
        announcer(
            "Hong Kong Diploma of Secondary Education Examination 2026. "
            "English Language Paper 3. Listening and Integrated Skills."
        ),
        announcer(
            "The entire broadcast will last approximately one hour. "
            "During the examination, you will hear several recordings. "
            "You will have time to read the instructions and the questions. "
            "You will also have time to check your work."
        ),
    ]


def make_task_intro(task_num: int, instructions: str) -> list[dict]:
    return [
        announcer(
            f"Part A. Task {task_num}. {instructions} "
            "You now have two minutes to study the task. (120-second pause)"
        ),
    ]


def make_tidy_up_pause() -> list[dict]:
    return [announcer("(60-second pause to tidy up answers)")]


def make_end_of_part_a() -> list[dict]:
    return [
        announcer(
            "That is the end of Part A. You now have five minutes to study the "
            "Part B Question-Answer Book and the Data File. (300-second pause)"
        ),
    ]


def make_integrated_skills_intro(briefing_speaker_role: str) -> list[dict]:
    return [
        announcer(
            "Integrated Skills Recording. You will now hear a briefing from the "
            f"{briefing_speaker_role} regarding the upcoming tasks. Listen carefully and take notes "
            "as you will need this information to complete the tasks in Part B."
        ),
    ]


def make_end_of_exam() -> list[dict]:
    return [
        announcer(
            "That is the end of the Integrated Skills recording. "
            "You now have 1 hour and 10 minutes to complete your tasks. "
            "Stop writing when you hear the signal at the end of the examination."
        ),
        announcer("(4200-second pause)"),
        announcer(
            "Stop writing now. The examination is over. "
            "Please stay in your seats until your scripts have been collected."
        ),
    ]


# ---------------------------------------------------------------------------
# Convenience: full script assembler for Part A + Integrated Skills
# ---------------------------------------------------------------------------

def assemble_part_a_script(
    task_intros: list[list[dict]],
    task_dialogues: list[list[dict]],
    tidy_after_each: bool = True,
    end_of_part_a: bool = True,
) -> list[dict]:
    """
    task_intros[i]  -> list of Announcer dicts for Task i+1
    task_dialogues[i] -> list of speaker dicts for Task i+1
    """
    script: list[dict] = []
    for intro, dialogue in zip(task_intros, task_dialogues):
        script.extend(intro)
        script.extend(dialogue)
        if tidy_after_each:
            script.extend(make_tidy_up_pause())
    if end_of_part_a:
        script.extend(make_end_of_part_a())
    return script


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------

def save_mock(data: dict, path: str | Path) -> Path:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved mock exam to: {p}")
    return p


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate HKDSE Listening Mock JSON")
    parser.add_argument("--topic", required=True, help="Exam topic, e.g. 'The Future of Food'")
    parser.add_argument("--output", required=True, help="Output JSON file path")
    parser.add_argument("--marks-a", type=int, default=50, help="Part A total marks")
    parser.add_argument("--marks-b", type=int, default=50, help="Part B total marks")
    args = parser.parse_args()

    builder = ListeningMockBuilder(
        title=f"{args.topic} 2026",
        topic=args.topic,
    )

    # ------------------------------------------------------------------
    # This is a TEMPLATE — users should replace the placeholder data below
    # with real topic-specific content, or subclass ListeningMockBuilder.
    # ------------------------------------------------------------------

    # ---- Part A Tasks (placeholder) ----
    part_a_tasks = [
        {
            "id": "Task_1",
            "instructions": f"You are at the registration desk for the {args.topic} Expo. Complete the registration form below.",
            "questions": [
                fill_blank("t1_q1", "Full Name of Organization:", "PLACEHOLDER"),
                fill_blank("t1_q2", "Primary Contact Person:", "PLACEHOLDER"),
                fill_blank("t1_q3", "Contact Number:", "PLACEHOLDER"),
                fill_blank("t1_q4", "Membership Type:", "PLACEHOLDER"),
                fill_blank("t1_q5", "Number of Staff Badges:", "PLACEHOLDER"),
                fill_blank("t1_q6", "Special Access Area:", "PLACEHOLDER"),
                fill_blank("t1_q7", "Parking Permit Needed:", "PLACEHOLDER"),
                fill_blank("t1_q8", "Lunch Requirements (Allergies):", "PLACEHOLDER"),
                fill_blank("t1_q9", "Keynote Attendance:", "PLACEHOLDER"),
                fill_blank("t1_q10", "Estimated Arrival Time:", "PLACEHOLDER"),
                fill_blank("t1_q11", "Workshop Selection:", "PLACEHOLDER"),
                fill_blank("t1_q12", "Payment Method:", "PLACEHOLDER"),
            ],
        },
        {
            "id": "Task_2",
            "instructions": f"Listen to a presentation about the '{args.topic}' initiative. Complete the notes and answer the questions.",
            "questions": [
                fill_blank("t2_q1", "Project Launch Year:", "PLACEHOLDER"),
                fill_blank("t2_q2", "Main Tech Used:", "PLACEHOLDER"),
                fill_blank("t2_q3", "Test Location (District):", "PLACEHOLDER"),
                fill_blank("t2_q4", "Reduction in Congestion (%):", "PLACEHOLDER"),
                multi_choice("t2_q5", "What is the primary concern for residents?", ["Data privacy", "Initial cost", "System reliability"], "Data privacy"),
                multi_choice("t2_q6", "How many smart lampposts were installed?", ["400", "500", "600"], "500"),
                fill_blank("t2_q7", "Feedback Deadline:", "PLACEHOLDER"),
                fill_blank("t2_q8", "Government Budget Alloc:", "PLACEHOLDER"),
                fill_blank("t2_q9", "Consulting Firm:", "PLACEHOLDER"),
                fill_blank("t2_q10", "Future Plan Expansion:", "PLACEHOLDER"),
                fill_blank("t2_q11", "Website for Updates:", "PLACEHOLDER"),
                fill_blank("t2_q12", "Next Meeting Venue:", "PLACEHOLDER"),
            ],
        },
        {
            "id": "Task_3",
            "instructions": f"A panel of three experts are discussing the '{args.topic}'. Tick the correct boxes.",
            "questions": [
                multi_choice("t3_q1", "Dr. Wong believes the main issue is:", ["Education", "Hardware cost", "Internet speed"], "Hardware cost"),
                multi_choice("t3_q2", "Ms. Lee emphasizes the role of:", ["Local NGOs", "International banks", "Tech giants"], "Local NGOs"),
                multi_choice("t3_q3", "Mr. Chan suggests a tax on:", ["Data usage", "Smartphones", "E-commerce"], "E-commerce"),
                fill_blank("t3_q4", "Target Completion Year:", "PLACEHOLDER"),
                fill_blank("t3_q5", "Subsidy Amount per Household:", "PLACEHOLDER"),
                fill_blank("t3_q6", "Number of Training Centers:", "PLACEHOLDER"),
                fill_blank("t3_q7", "Free Wi-Fi Name:", "PLACEHOLDER"),
                fill_blank("t3_q8", "Device Rental Fee:", "PLACEHOLDER"),
                fill_blank("t3_q9", "Age Group Focus:", "PLACEHOLDER"),
                fill_blank("t3_q10", "Language of Tutorials:", "PLACEHOLDER"),
                fill_blank("t3_q11", "Security Software Provider:", "PLACEHOLDER"),
                fill_blank("t3_q12", "Contact Email for NGOs:", "PLACEHOLDER"),
            ],
        },
        {
            "id": "Task_4",
            "instructions": f"Three stakeholders are discussing future {args.topic} policy. Complete the matrix with their specific views.",
            "questions": [
                fill_blank("t4_q1", "Stakeholder A (Business Owner) - View on Jobs:", "PLACEHOLDER"),
                fill_blank("t4_q2", "Stakeholder A - View on Regulation:", "PLACEHOLDER"),
                fill_blank("t4_q3", "Stakeholder A - Recommendation:", "PLACEHOLDER"),
                fill_blank("t4_q4", "Stakeholder B (Union Leader) - View on Jobs:", "PLACEHOLDER"),
                fill_blank("t4_q5", "Stakeholder B - View on Regulation:", "PLACEHOLDER"),
                fill_blank("t4_q6", "Stakeholder B - Recommendation:", "PLACEHOLDER"),
                fill_blank("t4_q7", "Stakeholder C (Gov Official) - View on Jobs:", "PLACEHOLDER"),
                fill_blank("t4_q8", "Stakeholder C - View on Regulation:", "PLACEHOLDER"),
                fill_blank("t4_q9", "Stakeholder C - Recommendation:", "PLACEHOLDER"),
                fill_blank("t4_q10", "Consensus on Timeline:", "PLACEHOLDER"),
                fill_blank("t4_q11", "Key Priority:", "PLACEHOLDER"),
                fill_blank("t4_q12", "Next Step:", "PLACEHOLDER"),
            ],
        },
    ]

    # ---- Part A Script (placeholder) ----
    task_intros = [make_task_intro(i + 1, part_a_tasks[i]["instructions"]) for i in range(4)]
    task_dialogues = [
        [
            speaker("Staff", "Good morning! Welcome to the expo. How can I help you?"),
            speaker("Visitor", "Hello! I'm here to pick up the badges for my team."),
        ],
        [
            speaker("Presenter", "Good morning. Let me tell you about our project."),
        ],
        [
            speaker("Host", "Welcome to our panel discussion."),
            speaker("Dr Wong", "Thank you for having me."),
        ],
        [
            speaker("Host", "Let's discuss the policy."),
            speaker("Business Owner", "I believe this will help."),
        ],
    ]
    part_a_script = make_opening_announcements()
    part_a_script.extend(assemble_part_a_script(task_intros, task_dialogues))

    # ---- Integrated Skills briefing (placeholder) ----
    part_a_script.extend(make_integrated_skills_intro("Project Manager"))
    part_a_script.extend([
        speaker("Manager", "Good morning. Please note these updates for the tasks."),
    ])
    part_a_script.extend(make_end_of_exam())

    # ---- Data File (placeholder set) ----
    data_file = [
        doc("doc1", "minutes", "Minutes of Meeting", "PLACEHOLDER minutes content."),
        doc("doc2", "brochure", "Official Program", "PLACEHOLDER brochure content."),
        doc("doc3", "email", "Email from Citizen", "PLACEHOLDER email content."),
        doc("doc4", "newspaper", "Editorial", "PLACEHOLDER editorial content."),
        doc("doc5", "handwritten_note", "Urgent Note", "PLACEHOLDER note.", visual_style="scrawled_handwriting"),
        doc("doc6", "table", "Budget Table", "Category | A | B\n-----------"),
        doc("doc7", "social_media_post", "Viral Post", "PLACEHOLDER post."),
        doc("doc8", "memo", "Internal Memo", "PLACEHOLDER memo."),
        doc("doc9", "news_clip", "News Clip", "PLACEHOLDER news."),
        doc("doc10", "policy_draft", "Policy Draft", "PLACEHOLDER policy."),
    ]

    # ---- Part B1 Tasks (placeholder) ----
    part_b1_tasks = [
        task_b(
            "Task_5",
            "Formal Email",
            "Write a formal email. Use information from the Data File.",
            150,
            ["Point 1 (Doc 1)", "Point 2 (Doc 2)"],
            "Polite and Helpful",
        ),
        task_b(
            "Task_6",
            "Short Notice",
            "Write a short notice. Refer to Doc 3 and Doc 4.",
            100,
            ["Point 1 (Doc 3)", "Point 2 (Doc 4)"],
            "Clear and Informative",
        ),
        task_b(
            "Task_7",
            "Feedback Form Summary",
            "Summarize the main points. Refer to Doc 1 and Doc 5.",
            120,
            ["Point 1 (Doc 1)", "Point 2 (Doc 5)"],
            "Simple and Direct",
        ),
    ]

    # ---- Part B2 Tasks (placeholder) ----
    part_b2_tasks = [
        task_b(
            "Task_8",
            "Formal Letter",
            "Write a formal letter. Use docs and Audio.",
            250,
            ["Point 1 (Doc 1)", "Point 2 (Audio)"],
            "Persuasive and Reassuring",
            oral_info_weight=0.25,
        ),
        task_b(
            "Task_9",
            "Internal Memo",
            "Write an internal memo. Refer to Doc 6 and Audio.",
            150,
            ["Point 1 (Doc 6)", "Point 2 (Audio)"],
            "Professional and Urgent",
        ),
        task_b(
            "Task_10",
            "Public Social Media Post",
            "Draft a social media post. Use emojis where appropriate.",
            100,
            ["Point 1 (Doc 2)", "Point 2 (Audio)"],
            "Friendly and Non-corporate",
        ),
    ]

    exam = builder.assemble(
        part_a_tasks=part_a_tasks,
        part_a_script=part_a_script,
        data_file=data_file,
        part_b1_tasks=part_b1_tasks,
        part_b2_tasks=part_b2_tasks,
        total_marks_a=args.marks_a,
        total_marks_b=args.marks_b,
    )

    save_mock(exam, args.output)


if __name__ == "__main__":
    main()
