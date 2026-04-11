import json

def recalibrate():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    for q in questions:
        if q['id'] == 'trig_app_10':
            # Relative coordinates are centered on translate(100,250)
            # Content X: (0 for N line, 128 for plane, 135 for text) -> 100 to 235
            # Content Y: (-200 for N, 20 for line, 0 for start) -> 50 to 270
            q['visual'] = q['visual'].replace('viewBox="-70.0 -245.0 245.0 325.0"', 'viewBox="70 40 180 250"')
            
        elif q['id'] == 'trig_app_16':
            # Relative coordinates are centered on translate(200,100)
            # Content X: (-15 for Q, 125 for P) -> 185 to 325
            # Content Y: (-55 for N, 200 for R) -> 45 to 300
            q['visual'] = q['visual'].replace('viewBox="-55.0 -95.0 220.0 335.0"', 'viewBox="175 35 170 280"')
            
        elif q['id'] == 'trig_app_20':
            # No translate. Polyline points: 100,250 300,150 450,220
            # Content X: 100 to 450
            # Content Y: 150 to 250
            q['visual'] = q['visual'].replace('viewBox="-45.0 -95.0 535.0 385.0"', 'viewBox="70 120 410 180"')

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: Recalibrated Q10, Q16, and Q20 bounding boxes.")

if __name__ == "__main__":
    recalibrate()
