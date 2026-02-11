# Listening Mock Exam Batch Generator

## Overview

This script generates multiple diverse HKDSE English Listening Mock Exams with the **enhanced multi-document Data File structure**.

## Location

```
backend/generate_listening_mocks.js
```

## Features

### Multi-Document Data Files
Each generated mock exam includes:
- **3-5 interconnected documents** in Part B (emails, meeting minutes, posters, webpages, memos)
- **Realistic HTML content** (150-300 words per document)
- **Cross-referencing** between documents (e.g., email mentions meeting, poster shows event details)

### Diverse Topics
The script generates mocks for 6 different topics:
1. School Open Day
2. Environmental Conservation Campaign
3. Student Council Election
4. Sports Day Planning
5. Cultural Festival Organization
6. Career Fair Preparation

### Complete HKDSE Format
Each mock includes:
- **Part A**: 3-4 tasks with fill-in-blank, multiple choice, and table completion questions
- **Part B**: 3 writing tasks (email, article, proposal) requiring multi-document synthesis
- **Full audio scripts** with realistic dialogue and pauses
- **Hong Kong context** with local names and scenarios

## How to Run

### Prerequisites
- Valid `GEMINI_API_KEY` in `backend/.env`
- Node.js installed
- All dependencies installed (`npm install` in backend directory)

### Command
```bash
cd backend
node generate_listening_mocks.js
```

### Expected Output
```
🚀 Starting batch generation of Listening Mock Exams...

📋 Topics to generate: 6
⏱️  Estimated time: ~2-3 minutes

[1/6] Processing: School Open Day
🎧 Generating Listening Mock for topic: School Open Day...
✅ Successfully generated: Listening_School_Open_Day_1768743274669.json
   - Part A Tasks: 4
   - Part B Documents: 4
   - Part B Tasks: 3
   ⏳ Waiting 5 seconds before next generation...

[2/6] Processing: Environmental Conservation Campaign
...

📊 GENERATION SUMMARY
==================================================
✅ Successful: 6/6
❌ Failed: 0/6

📁 Generated files saved to:
   backend/generated_mocks/listening/

✨ Batch generation complete!
```

## Output Files

Generated mocks are saved to:
```
backend/generated_mocks/listening/Listening_{Topic}_{Timestamp}.json
```

### Example File Structure
```json
{
  "metadata": {
    "title": "Mock Exam: School Open Day",
    "generated_at": "2026-02-08T11:45:47.000Z",
    "difficulty": "Level 4"
  },
  "Part_A": {
    "tasks": [...],
    "script": [...]
  },
  "Part_B": {
    "data_file": [
      {
        "id": "doc1",
        "title": "Email from Chris Wong",
        "type": "email",
        "content": "<div class='email'>...</div>"
      },
      {
        "id": "doc2",
        "title": "Meeting Minutes",
        "type": "minutes",
        "content": "<div class='minutes'>...</div>"
      },
      {
        "id": "doc3",
        "title": "Event Poster",
        "type": "poster",
        "content": "<div class='poster'>...</div>"
      }
    ],
    "tasks": [...],
    "script": [...]
  }
}
```

## Rate Limiting

The script includes a 5-second delay between generations to respect API rate limits (15 requests per minute for Gemini 2.0 Flash).

## Troubleshooting

### API Key Error
```
❌ Failed to generate: API key not valid
```
**Solution**: Ensure `GEMINI_API_KEY` is set in `backend/.env`

### File Path Error
```
❌ Failed to generate: ENOENT: no such file or directory
```
**Solution**: Run the script from the `backend` directory

### JSON Parse Error
```
❌ Failed to generate: Unexpected token
```
**Solution**: The AI occasionally returns malformed JSON. Re-run the script for failed topics.

## Frontend Integration

The generated mocks are automatically compatible with:
- `IntegratedListeningBoard.jsx` (tabbed document interface)
- `ListeningExamPage.jsx` (split-screen exam view)
- Legacy single-string data files (backward compatible)

## Next Steps

After generation:
1. Review generated mocks for quality
2. Test in the frontend (navigate to Listening Mock Exams)
3. Verify document tabs display correctly
4. Check audio script completeness
