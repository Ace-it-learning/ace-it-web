import json
import os

def rename_topic_id():
    old_id = "math_geo_trig"
    new_id = "math_trig_ratios"
    
    # 1. Update Briefing
    briefing_old_path = os.path.join('backend', 'data', 'math_content', 'math_geo_trig_briefing.json')
    briefing_new_path = os.path.join('backend', 'data', 'math_content', 'math_trig_ratios_briefing.json')
    
    if os.path.exists(briefing_old_path):
        with open(briefing_old_path, 'r', encoding='utf-8') as f:
            briefing = json.load(f)
        
        # Rename the top level key if it exists
        if old_id in briefing:
            briefing[new_id] = briefing.pop(old_id)
        
        with open(briefing_new_path, 'w', encoding='utf-8') as f:
            json.dump(briefing, f, ensure_ascii=False, indent=2)
        os.remove(briefing_old_path)
        print(f"✅ Renamed briefing file and ID to {new_id}")

    # 2. Update Questions
    questions_old_path = os.path.join('backend', 'data', 'math_content', 'math_geo_trig_questions.json')
    questions_new_path = os.path.join('backend', 'data', 'math_content', 'math_trig_ratios_questions.json')
    
    if os.path.exists(questions_old_path):
        with open(questions_old_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
        
        for q in questions:
            if q.get('topic_id') == old_id:
                q['topic_id'] = new_id
        
        with open(questions_new_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
        os.remove(questions_old_path)
        print(f"✅ Renamed questions file and all topic_ids to {new_id}")

    # 3. Update Scripts (Seed, Wipe, Verify)
    scripts = ['seed_trig.js', 'wipe_trig.js', 'verify_trig.js']
    for script_name in scripts:
        script_path = os.path.join('backend', 'scripts', script_name)
        if os.path.exists(script_path):
            with open(script_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace(old_id, new_id)
            # Also update file paths in the scripts
            new_content = new_content.replace('math_geo_trig_briefing.json', 'math_trig_ratios_briefing.json')
            new_content = new_content.replace('math_geo_trig_questions.json', 'math_trig_ratios_questions.json')
            
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Updated {script_name} with {new_id}")

    # 4. Update Generator Script
    gen_script = os.path.join('backend', 'scripts', 'generate_trig_questions_v3.py')
    if os.path.exists(gen_script):
        with open(gen_script, 'r', encoding='utf-8') as f:
            content = f.read()
        new_content = content.replace(old_id, new_id)
        # Also update the filename it writes to
        new_content = new_content.replace('math_geo_trig_questions.json', 'math_trig_ratios_questions.json')
        with open(gen_script, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Updated generator script with {new_id}")

if __name__ == "__main__":
    rename_topic_id()
