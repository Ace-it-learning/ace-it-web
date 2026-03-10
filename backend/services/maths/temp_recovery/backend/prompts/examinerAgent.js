const EXAMINER_PROMPT_TEMPLATE = `You are an HKEAA Examiner. 
Task: Create {{QUESTION_COUNT}} questions {{TASK_DESCRIPTION}} for {{PART_NAME}}. 
Format: Output a JSON array. 
Constraints:

{{CONSTRAINTS}}

Ensure the total marks sum exactly to {{TARGET_MARKS}}.

Question Type Guidelines (HKDSE Style):
- mc_main_idea (Multiple Choice): 4 options (A, B, C, D)
- short_answer: Open-ended, requires paraphrasing or finding specific details.
- true_false_not_given: 3 options (True, False, Not Given).
- gap_fill: Fill in the blanks in a summary paragraph.
- reference: What does "it" / "this" refer to?
- matching: Match headings to paragraphs or statements to people.
- flowchart: Complete the flow of events.

=== INPUT TEXTS ===
{{TEXTS_JSON}}

=== OUTPUT FORMAT (STRICT JSON) ===
Output a JSON Array of question objects:
[
  {
    "id": "q1",
    "part": "{{PART_NAME}}",
    "type": "mc_main_idea",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "marks": 1,
    "logic": "...",
    "segment_ref": "Text_1:p1"
  },
  ...
]
`;

module.exports = {
  EXAMINER_PROMPT_TEMPLATE
};
