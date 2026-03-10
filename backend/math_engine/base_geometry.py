import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Arc, RegularPolygon, Circle, PathPatch
from matplotlib.path import Path
import os

class BaseGeometry:
    def __init__(self, figsize=(6, 6), theme='dse'):
        self.fig, self.ax = plt.subplots(figsize=figsize)
        self.theme = theme
        self._setup_theme()
        
    def _setup_theme(self):
        self.ax.set_aspect('equal')
        if self.theme == 'dse':
            # DSE Style: Clean, high contrast, no axis lines usually unless requested
            self.ax.axis('off')
            plt.rcParams['font.family'] = 'sans-serif'
            plt.rcParams['font.sans-serif'] = ['Arial']
            
    def add_axes(self, x_range=(-10, 10), y_range=(-10, 10), grid=True):
        """Adds standard Cartesian axes for Coordinate Geometry and Functions."""
        self.ax.axis('on')
        self.ax.spines['left'].set_position('zero')
        self.ax.spines['bottom'].set_position('zero')
        self.ax.spines['right'].set_color('none')
        self.ax.spines['top'].set_color('none')
        
        self.ax.set_xlim(x_range)
        self.ax.set_ylim(y_range)
        
        if grid:
            self.ax.grid(True, linestyle='--', alpha=0.6)
            
        # Add arrowheads
        self.ax.plot(1, 0, ">k", transform=self.ax.get_yaxis_transform(), clip_on=False)
        self.ax.plot(0, 1, "^k", transform=self.ax.get_xaxis_transform(), clip_on=False)
        
        self.ax.set_xlabel('x', loc='right')
        self.ax.set_ylabel('y', loc='top', rotation=0)

    def draw_line(self, p1, p2, label=None, style='k-', lw=1.5):
        """p1, p2 are (x, y) tuples"""
        line, = self.ax.plot([p1[0], p2[0]], [p1[1], p2[1]], style, linewidth=lw)
        if label:
            mid = ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2)
            self.ax.text(mid[0], mid[1], label, fontsize=10)
        return line

    def draw_circle(self, center, radius, style='k-', lw=1.5, fill=False):
        c = Circle(center, radius, edgecolor='k', facecolor='none' if not fill else 'gray', linewidth=lw)
        self.ax.add_patch(c)
        return c

    def add_label(self, pos, text, offset=(0, 0), fontsize=12):
        """Adds a vertex or point label like 'A' or '30°'"""
        self.ax.text(pos[0] + offset[0], pos[1] + offset[1], text, 
                     fontsize=fontsize, fontweight='bold', ha='center', va='center')

    def save(self, filename, output_dir='output'):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        path = os.path.join(output_dir, filename)
        plt.savefig(path, bbox_inches='tight', dpi=300)
        plt.close(self.fig)
        return path

if __name__ == "__main__":
    # Test generation
    geo = BaseGeometry()
    geo.add_axes()
    geo.draw_line((0,0), (5,5), label="L1")
    geo.draw_circle((0,0), 3)
    geo.add_label((5,5), "A", offset=(0.5, 0.5))
    print(f"Saved test diagram to: {geo.save('test_base.png')}")
