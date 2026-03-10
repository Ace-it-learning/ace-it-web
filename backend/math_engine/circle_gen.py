import random
import numpy as np
import json
import sys
import os
from base_geometry import BaseGeometry

class CircleGen(BaseGeometry):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.center = (0, 0)
        self.radius = 5

    def generate_chord_question(self, difficulty=3):
        """Generates a question about chord length or distance from center."""
        # 1. Randomize parameters
        r = random.randint(5, 12)
        dist_from_center = random.uniform(1.5, r - 1.5)
        half_chord = np.sqrt(r**2 - dist_from_center**2)
        chord_len = 2 * half_chord
        
        # 2. Draw
        self.draw_circle(self.center, r)
        
        # Points: O(0,0), M(0, dist), A(-half, dist), B(half, dist)
        M = (0, dist_from_center)
        A = (-half_chord, dist_from_center)
        B = (half_chord, dist_from_center)
        
        self.draw_line(self.center, M, style='k--') # OM
        self.draw_line(A, B, label="AB")
        self.draw_line(self.center, A, style='k--') # OA
        
        self.add_label(self.center, "O", offset=(-0.3, -0.3))
        self.add_label(M, "M", offset=(0, 0.3))
        self.add_label(A, "A", offset=(-0.3, 0.3))
        self.add_label(B, "B", offset=(0.3, 0.3))
        
        # 3. Formulate Question
        question_zh = f"在圖中，O 是圓心。弦 AB 的長度為 {chord_len:.1f} cm，且 OM 垂直於 AB。 若 OM = {dist_from_center:.1f} cm，求圓的半徑。"
        question_en = f"In the figure, O is the center of the circle. The length of chord AB is {chord_len:.1f} cm, and OM is perpendicular to AB. If OM = {dist_from_center:.1f} cm, find the radius of the circle."
        
        solution_steps = [
            f"Step 1: In triangle OMA, angle OMA = 90° (given).",
            f"Step 2: AM = AB / 2 = {chord_len:.1f} / 2 = {half_chord:.1f} cm (perpendicular from center bisects chord).",
            f"Step 3: By Pythagoras' Theorem, OA² = OM² + AM²",
            f"Step 4: r² = {dist_from_center:.1f}² + {half_chord:.1f}² = {r**2:.1f}",
            f"Step 5: r = {r:.1f} cm."
        ]
        
        return {
            "topic": "Geometry",
            "sub_topic": "Circle Properties",
            "difficulty": difficulty,
            "question_text_en": question_en,
            "question_text_zh": question_zh,
            "answer": f"{r:.1f}",
            "solution_steps": solution_steps
        }

def main():
    # Bridge logic to be called from Node.js
    input_data = json.load(sys.stdin) if not sys.stdin.isatty() else {"difficulty": 3}
    
    gen = CircleGen()
    result = gen.generate_chord_question(difficulty=input_data.get("difficulty", 3))
    
    # Save diagram
    img_name = f"circle_chord_{random.getrandbits(32)}.png"
    img_path = gen.save(img_name)
    result["diagram_url"] = img_path
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
