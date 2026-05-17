#!/usr/bin/env python3
import json, os, sys, re
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCRIPT_DIR, '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(SCRIPT_DIR, '..', '..', '.env'))
import requests

DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
DEEPSEEK_BASE_URL = os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/chat/completions')
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_FILE = os.path.join(SCRIPT_DIR, 'hkbu_programmes.json')

with open(MASTER_FILE, 'r', encoding='utf-8') as f:
    master = json.load(f)
code_map = {p['code']: i for i, p in enumerate(master)}
prog = master[code_map['JS2410']]

code = prog['code']
name_en = prog['nameEn']
name_zh = prog.get('nameZh', '')
faculty = prog.get('faculty', '')
median = prog['median']
lq = prog['band_a']
formula = prog['formula']

subjects = prog.get('subjects', {})
subj_map = {
    'chin': 'Chinese Language', 'engl': 'English Language', 'math': 'Mathematics',
    'csd': 'Citizenship and Social Development', 'elec1': 'Elective 1', 'elec2': 'Elective 2',
    'elec3': 'Elective 3', 'elec4': 'Elective 4'
}
subj_lines = []
for key, label in subj_map.items():
    s = subjects.get(key, {})
    med = s.get('median', '')
    lq_val = s.get('lq', '')
    if med or lq_val:
        parts = []
        if med: parts.append('Median ' + med)
        if lq_val: parts.append('LQ ' + lq_val)
        subj_lines.append('- ' + label + ': ' + ', '.join(parts))
subjects_text = 'Subject Breakdown (2025 JUPAS):\n' + '\n'.join(subj_lines) if subj_lines else ''

j = prog.get('jupas', {})
stats_text = ''
if j:
    stats_text = '''JUPAS 2025 Statistics:
- Band A applicants: ''' + str(j.get('bandA', 'N/A')) + '''
- Band B applicants: ''' + str(j.get('bandB', 'N/A')) + '''
- Total applicants: ''' + str(j.get('allBands', 'N/A')) + '''
- First year intake: ''' + str(j.get('intake', 'N/A')) + ''' places
- Interview required: ''' + ('Yes' if j.get('interview') else 'No') + '''
'''

prompt = '''You are an expert education consultant writing detailed programme guides for Hong Kong university applicants. 

Generate the following 7 sections for Hong Kong Baptist University (HKBU) programme ''' + code + ': ' + name_en + ' / ' + name_zh + '''

PROGRAMME DATA:
- Faculty: ''' + faculty + '''
- Admission Score Formula: ''' + formula + '''
- Median Score (2025): ''' + median + '''
- Lower Quartile (2025): ''' + lq + '''
''' + subjects_text + '''
''' + stats_text + '''

HKBU CONTEXT:
- HKBU is a leading liberal arts university in Hong Kong, known for its whole-person education
- Located in Kowloon Tong with a scenic Shaw Campus
- Strong programmes in communication, arts, Chinese medicine, and business

OUTPUT FORMAT:
Return a JSON object with this exact structure (NOTE: lang first, then section):
{
  "en": {
    "curriculum": { "title": "...", "content": ["...", "..."] },
    "career": { "title": "...", "content": ["...", "..."] },
    "campus": { "title": "...", "content": ["...", "..."] },
    "competitiveness": { "title": "...", "content": ["...", "..."] },
    "alumni": { "title": "...", "content": ["...", "..."] },
    "scholarships": { "title": "...", "content": ["...", "..."] },
    "tips": { "title": "Ace Sir\'s ''' + code + ''' Strategy — 9 Actionable Tips", "content": ["**1. ...", "", "- ..."] }
  },
  "zh": {
    "curriculum": { "title": "...", "content": ["...", "..."] },
    "career": { "title": "...", "content": ["...", "..."] },
    "campus": { "title": "...", "content": ["...", "..."] },
    "competitiveness": { "title": "...", "content": ["...", "..."] },
    "alumni": { "title": "...", "content": ["...", "..."] },
    "scholarships": { "title": "...", "content": ["...", "..."] },
    "tips": { "title": "Ace Sir ''' + code + ''' 攻略 — 9 個實用貼士", "content": ["**1. ...", "", "- ..."] }
  }
}

RULES:
1. Each section must have at least 4-6 bullet points in the content array
2. EN and ZH versions must have matching structure and content
3. Use **bold** for key terms
4. Include specific numbers and data from the programme information
5. CRITICAL: Do NOT mention "DeepMind", "Google DeepMind", or any AI company names anywhere in the content

Return ONLY the JSON object.'''

print('Prompt length:', len(prompt))

payload = {
    'model': 'deepseek-chat',
    'messages': [{'role': 'user', 'content': prompt}],
    'temperature': 0.4,
    'max_tokens': 8192,
}

response = requests.post(
    DEEPSEEK_BASE_URL,
    headers={'Authorization': 'Bearer ' + DEEPSEEK_API_KEY, 'Content-Type': 'application/json'},
    json=payload,
    timeout=180
)
data = response.json()
text = data['choices'][0]['message']['content']
print('Response length:', len(text))
print('First 300 chars:', text[:300])
print('Last 300 chars:', text[-300:])

# Parse
json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', text)
if json_match:
    parsed = json.loads(json_match.group(1))
    print('Parsed via code block')
else:
    json_match = re.search(r'(\{[\s\S]*\})', text)
    if json_match:
        parsed = json.loads(json_match.group(1))
        print('Parsed via raw JSON')
    else:
        parsed = None
        print('NO JSON FOUND')

print('Parsed successfully:', parsed is not None)
if parsed:
    print('Top keys:', list(parsed.keys()))
    if 'en' in parsed:
        print('EN keys:', list(parsed['en'].keys()))
        print('Has curriculum:', 'curriculum' in parsed['en'])
