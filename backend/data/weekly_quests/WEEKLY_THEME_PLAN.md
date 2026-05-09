# Weekly English Quests — Theme Calendar & Generation Notes

Use this file **before** authoring `week_<N>_reading.json`, `week_<N>_writing.json`, `week_<N>_listening.json`, and `week_<N>_speaking.json`. Copy the **weekly theme** and **long topic** into `weekly_meta.json` under the key **`YEAR_WEEK`** (same week logic as `LabService`: ISO-style week number for the calendar year).

Themes lean toward **Hong Kong–relevant contexts** (policy, civic life, schools, cross-boundary life, climate, demographics) so passages and tasks feel like **authentic, timely situations**. Rotate or replace rows as real-world news shifts—this calendar is a **rolling plan**, not permanent canon.

---

## How to use this doc when generating JSON

1. Run `node backend/scripts/generate_weekly_quests.js info` and note **`year`**, **`week number`**, and meta key **`YEAR_WEEK`**.
2. Find that week’s row in the table below.
3. Ensure `weekly_meta.json` has matching `"theme"` and `"topic"` (short label + one-sentence **long topic** for steering prompts).
4. Generate four files:
   - **Reading:** Level 5 general reading (long passage + rich `interactive_tasks`; mixed item types).
   - **Writing:** General writing / opinion or magazine-style task aligned to the long topic; include `marking_logic` and band models where your pipeline expects them.
   - **Listening:** Follow **`backend/data/question_bank/listening_missions.json`** structure (see next section)—**not** the slimmer legacy weekly listening layout.
   - **Speaking:** Group discussion only—JSON **array** with one object (`topic_description`, `discussion_points`, `individual_response_questions`, etc.), aligned to the same theme.

---

## Listening weekly JSON — canonical shape (`listening_missions.json`)

Weekly listening content should mirror the **mission objects** in `listening_missions.json`:

| Area | Purpose |
|------|--------|
| **Root** | `id`, `title`, `description`, `topic`, `type` (`listening_mission`), `paper`, `subject`, `level` (e.g. `"5"` for DSE standard), optional `prediction_metadata` with `sub_topics` (names, categories, `is_distractor`, hints). |
| **`sprint_data`** | Part A–style focus: `audio_transcript` (script with `[SCENE START]` / `[SCENE END]` style cues if helpful), `tasks` array with typed tasks: **`TABLE`**, **`FORM_FILLING`**, **`MCQ_BATCH`** (see existing missions for field shapes). |
| **`integrated_data`** | Part B–style integration: separate `audio_transcript` (e.g. `[INTEGRATED BRIEFING START]` … `END`), `notetaking_fields`, `data_file` (e.g. `email`, `minutes`, `poster`), `writing_task` (instruction, format, word count), `marking_key` as string bullets. |

Reuse **task type conventions** and richness from entries such as `listening_mission_1` / `listening_mission_2` in `listening_missions.json` so the simulator UI and marking paths stay consistent.

`LabService` may still normalize listening payloads when loading weekly files; keeping this shape avoids surprises.

---

## Ten-week theme calendar (2026 — Weeks 19–28)

Anchor: **`2026_19` … `2026_28`** in `weekly_meta.json`. Adjust week numbers if your deployment calendar shifts—keep **one row per deployment week**.

| Meta key | Week (approx.) | Weekly theme (short) | Long topic (steering sentence for all four papers) | HK / real-life rationale |
|----------|----------------|----------------------|-----------------------------------------------------|---------------------------|
| `2026_19` | W19 | Sustainable Schools | Implementing low-carbon operations, waste separation, and student-led green audits in Hong Kong secondary schools. | Aligns with municipal waste policy, school ESG-style initiatives, and visible campus sustainability drives. |
| `2026_20` | W20 | Waste Charging & Daily Habits | How households and school communities adapt behaviour after waste-disposal charging and stronger recycling expectations. | Grounded in ongoing civic adjustment to charging schemes and “pay-as-you-throw” conversation in HK media. |
| `2026_21` | W21 | Northern Metropolis & Young Careers | Balancing NT development opportunities with housing pressure and career pathways for diploma graduates. | Connects infrastructure/Northern Metropolis narrative to students’ study and migration choices. |
| `2026_22` | W22 | Youth Mental Health at School | Scaling peer support, counselling access, and stigma-reduction campaigns in local secondary schools. | Matches sustained policy and school focus on mental health post–social stressors and exam pressure. |
| `2026_23` | W23 | Greater Bay Study & Mobility | Hong Kong students navigating cross-boundary internships, exchange, and identity when studying or working in the GBA. | Reflects frequent HK discourse on Bay Area integration and youth mobility. |
| `2026_24` | W24 | Ageing City, Active Aging | Volunteer schemes, intergenerational learning, and pressure on community care as Hong Kong’s dependency ratio rises. | Demographics-driven; realistic charity/education crossover contexts. |
| `2026_25` | W25 | Extreme Weather Readiness | Schools and districts tightening heatwave, flooding, and typhoon contingency plans under a warmer climate. | Timely after recurring extreme rain and heat headlines; practical institutional English (briefings, notices). |
| `2026_26` | W26 | Hospitality & “Brand HK” English | Training young people in service English, inclusivity, and cultural etiquette as tourism and mega-events return. | Ties English competence to HK’s events/economy narrative without being exam-generic. |
| `2026_27` | W27 | Sports, Inclusion & District Facilities | Expanding grassroots sports access, school leagues, and inclusive PE as district facilities upgrade. | Fits Healthy HK, district sports centre expansion, and school athletic culture. |
| `2026_28` | W28 | Digital Citizenship & Scams 2.0 | Teaching critical verification, privacy habits, and peer alerts as phishing and AI-assisted fraud evolve. | Continuation of HK’s anti-scam public messaging in a student-relevant frame. |

---

## Maintenance

- **Quarterly:** Review themes against current headlines; swap rows or edit long topics while keeping keys stable if possible.
- **When replacing a week:** Update both this file and `weekly_meta.json`, then regenerate or edit the four JSON files for that `week_<N>_*.json`.
