import matplotlib.pyplot as plt
import numpy as np
import json
import sys
import os
import random

class StatsGen:
    def __init__(self, figsize=(8, 4)):
        self.fig, self.ax = plt.subplots(figsize=figsize)
        
    def generate_boxplot_question(self, difficulty=2):
        """Generates a Box-and-Whisker plot and questions about range/median."""
        # 1. Randomize data
        base = random.randint(40, 60)
        data = np.random.normal(base, 10, 100).tolist()
        
        q1, median, q3 = np.percentile(data, [25, 50, 75])
        iqr = q3 - q1
        lower_whisker = max(min(data), q1 - 1.5 * iqr)
        upper_whisker = min(max(data), q3 + 1.5 * iqr)
        
        # 2. Draw
        self.ax.boxplot(data, vert=False, patch_artist=True, 
                        boxprops=dict(facecolor='lightgray', color='black'),
                        medianprops=dict(color='red', linewidth=2))
        
        self.ax.set_yticks([])
        self.ax.set_xlabel("Score / Marks")
        self.ax.grid(True, axis='x', linestyle='--', alpha=0.7)
        
        # 3. Formulate Question
        question_zh = f"圖中顯示了一組數據的盒形圖。根據該圖，求該組數據的四分位數間距 (IQR)。"
        question_en = f"The figure shows the box-and-whisker plot of a set of data. Based on the figure, find the inter-quartile range (IQR) of the data set."
        
        solution_steps = [
            f"Step 1: Identify the upper quartile (Q3) from the right edge of the box: {q3:.1f}.",
            f"Step 2: Identify the lower quartile (Q1) from the left edge of the box: {q1:.1f}.",
            f"Step 3: IQR = Q3 - Q1 = {q3:.1f} - {q1:.1f} = {iqr:.1f}."
        ]
        
        return {
            "topic": "Statistics",
            "sub_topic": "Box-and-Whisker Plot",
            "difficulty": difficulty,
            "question_text_en": question_en,
            "question_text_zh": question_zh,
            "answer": f"{iqr:.1f}",
            "solution_steps": solution_steps
        }

    def save(self, filename, output_dir='output'):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        path = os.path.join(output_dir, filename)
        plt.savefig(path, bbox_inches='tight', dpi=300)
        plt.close(self.fig)
        return path

def main():
    input_data = json.load(sys.stdin) if not sys.stdin.isatty() else {"difficulty": 2}
    
    gen = StatsGen()
    result = gen.generate_boxplot_question(difficulty=input_data.get("difficulty", 2))
    
    img_name = f"stats_boxplot_{random.getrandbits(32)}.png"
    img_path = gen.save(img_name)
    result["diagram_url"] = img_path
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
