#!/usr/bin/env python3
"""
render_math_graph.py — Matplotlib-based math graph renderer for Ace-it.

Usage:
    python render_math_graph.py '<JSON graph_spec>' '<output_path>'

Example:
    python render_math_graph.py '{"type":"function","expressions":[{"expr":"x**2 - 4*x + 3","label":"f(x)","color":"blue"}],"x_range":[-2,6],"y_range":[-2,8]}' 'output/graphs/test.png'
"""

import sys
import json
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server-side rendering
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch
import matplotlib.ticker as ticker

# ─── Configuration ───────────────────────────────────────────────────────────

FIGURE_DPI = 150
FIGURE_WIDTH = 6   # inches
FIGURE_HEIGHT = 4.5
BG_COLOR = '#FFFFFF'
GRID_COLOR = '#E0E0E0'
AXIS_COLOR = '#333333'
FONT_SIZE = 11
LABEL_FONT_SIZE = 10
POINT_SIZE = 50
ANNOTATION_FONT_SIZE = 9

# ─── Safe Expression Evaluator ───────────────────────────────────────────────

SAFE_MATH_FUNCS = {
    'sin': np.sin, 'cos': np.cos, 'tan': np.tan,
    'asin': np.arcsin, 'acos': np.arccos, 'atan': np.arctan,
    'sqrt': np.sqrt, 'abs': np.abs, 'log': np.log, 'log10': np.log10,
    'log2': np.log2, 'exp': np.exp, 'pi': np.pi, 'e': np.e,
    'inf': np.inf, 'nan': np.nan,
    'floor': np.floor, 'ceil': np.ceil,
}

def safe_eval_expr(expr_str, x):
    """
    Safely evaluate a math expression string with numpy.
    Only allows known math functions — no builtins or imports.
    """
    # Normalize common LaTeX-style notations
    expr = expr_str.strip()
    expr = expr.replace('^', '**')           # caret to power
    expr = expr.replace('ln(', 'log(')       # ln → log (natural)
    
    namespace = {'x': x, 'np': np, **SAFE_MATH_FUNCS}
    
    try:
        result = eval(expr, {"__builtins__": {}}, namespace)
        return np.where(np.isfinite(result), result, np.nan)
    except Exception as e:
        print(f"[render_math_graph] Expression eval error for '{expr_str}': {e}", file=sys.stderr)
        return np.full_like(x, np.nan)


# ─── Graph Rendering ─────────────────────────────────────────────────────────

def render_function_graph(spec, output_path):
    """Render a function plot: y = f(x) curves on Cartesian axes."""
    
    fig, ax = plt.subplots(1, 1, figsize=(FIGURE_WIDTH, FIGURE_HEIGHT), dpi=FIGURE_DPI)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    
    # --- Domain setup ---
    x_range = spec.get('x_range', [-10, 10])
    y_range = spec.get('y_range', None)  # None = auto
    
    x = np.linspace(x_range[0], x_range[1], 1000)
    
    # --- Plot each expression ---
    expressions = spec.get('expressions', [])
    for expr_info in expressions:
        expr_str = expr_info.get('expr', '0')
        label = expr_info.get('label', '')
        color = expr_info.get('color', 'blue')
        style = expr_info.get('style', 'solid')
        line_width = expr_info.get('linewidth', 2.5)
        
        linestyle_map = {
            'solid': '-', 'dashed': '--', 'dotted': ':', 'dashdot': '-.'
        }
        ls = linestyle_map.get(style, '-')
        
        y_vals = safe_eval_expr(expr_str, x)
        
        # Clip extreme values for better visualization
        if y_range:
            margin = (y_range[1] - y_range[0]) * 0.5
            y_vals = np.where(np.abs(y_vals) < (y_range[1] - y_range[0]) * 5, y_vals, np.nan)
        
        ax.plot(x, y_vals, color=color, linewidth=line_width, linestyle=ls,
                label=label if label else None, zorder=3)
    
    # --- Asymptotes ---
    asymptotes = spec.get('asymptotes', [])
    for asym in asymptotes:
        direction = asym.get('direction', 'vertical')
        value = asym.get('value', 0)
        asym_label = asym.get('label', '')
        if direction == 'vertical':
            ax.axvline(x=value, color='red', linestyle='--', linewidth=1, alpha=0.7, label=asym_label, zorder=2)
        else:
            ax.axhline(y=value, color='red', linestyle='--', linewidth=1, alpha=0.7, label=asym_label, zorder=2)
    
    # --- Special points ---
    points = spec.get('points', [])
    for pt in points:
        px, py = pt.get('x', 0), pt.get('y', 0)
        pt_color = pt.get('color', '#E53935')
        pt_label = pt.get('label', '')
        
        ax.scatter([px], [py], color=pt_color, s=POINT_SIZE, zorder=5,
                   edgecolors='white', linewidths=1.5)
        
        if pt_label:
            offset_x = pt.get('label_dx', 8)
            offset_y = pt.get('label_dy', 8)
            ax.annotate(pt_label, (px, py),
                        textcoords="offset points", xytext=(offset_x, offset_y),
                        fontsize=ANNOTATION_FONT_SIZE, fontweight='bold',
                        color=pt_color,
                        bbox=dict(boxstyle='round,pad=0.3', facecolor='white', 
                                  edgecolor=pt_color, alpha=0.85))
    
    # --- Shaded regions (inequalities) ---
    regions = spec.get('shaded_regions', [])
    for region in regions:
        r_expr = region.get('expr', '0')
        r_bound = region.get('bound', 'below')  # 'below' or 'above'
        r_color = region.get('color', 'blue')
        r_alpha = region.get('alpha', 0.15)
        
        y_region = safe_eval_expr(r_expr, x)
        if r_bound == 'below':
            ax.fill_between(x, y_region, y_range[0] if y_range else -10,
                            color=r_color, alpha=r_alpha, zorder=1)
        else:
            ax.fill_between(x, y_region, y_range[1] if y_range else 10,
                            color=r_color, alpha=r_alpha, zorder=1)
    
    # --- Axis styling ---
    _style_axes(ax, x_range, y_range, spec)
    
    # --- Legend ---
    if any(e.get('label') for e in expressions):
        ax.legend(fontsize=LABEL_FONT_SIZE, loc='best', framealpha=0.9,
                  edgecolor='#CCCCCC', fancybox=True)
    
    # --- Title ---
    title = spec.get('title', '')
    if title:
        ax.set_title(title, fontsize=FONT_SIZE + 2, fontweight='bold', pad=12)
    
    # --- Save ---
    plt.tight_layout(pad=1.0)
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    fig.savefig(output_path, dpi=FIGURE_DPI, bbox_inches='tight',
                facecolor=BG_COLOR, edgecolor='none')
    plt.close(fig)
    print(f"[render_math_graph] Saved: {output_path}")


def render_scatter_graph(spec, output_path):
    """Render a scatter/data plot for statistics topics."""
    
    fig, ax = plt.subplots(1, 1, figsize=(FIGURE_WIDTH, FIGURE_HEIGHT), dpi=FIGURE_DPI)
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    
    datasets = spec.get('datasets', [])
    for ds in datasets:
        x_data = ds.get('x', [])
        y_data = ds.get('y', [])
        label = ds.get('label', '')
        color = ds.get('color', 'blue')
        marker = ds.get('marker', 'o')
        
        ax.scatter(x_data, y_data, color=color, marker=marker, s=POINT_SIZE,
                   label=label if label else None, zorder=3,
                   edgecolors='white', linewidths=1)
    
    # Optional trend line
    trendline = spec.get('trendline', None)
    if trendline and datasets:
        x_data = np.array(datasets[0].get('x', []))
        y_data = np.array(datasets[0].get('y', []))
        if len(x_data) > 1:
            degree = trendline.get('degree', 1)
            coeffs = np.polyfit(x_data, y_data, degree)
            poly = np.poly1d(coeffs)
            x_line = np.linspace(x_data.min(), x_data.max(), 200)
            ax.plot(x_line, poly(x_line), color=trendline.get('color', 'red'),
                    linestyle='--', linewidth=2, label=trendline.get('label', 'Trend'))
    
    x_range = spec.get('x_range', None)
    y_range = spec.get('y_range', None)
    _style_axes(ax, x_range, y_range, spec)
    
    if any(ds.get('label') for ds in datasets):
        ax.legend(fontsize=LABEL_FONT_SIZE, loc='best', framealpha=0.9)
    
    title = spec.get('title', '')
    if title:
        ax.set_title(title, fontsize=FONT_SIZE + 2, fontweight='bold', pad=12)
    
    plt.tight_layout(pad=1.0)
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    fig.savefig(output_path, dpi=FIGURE_DPI, bbox_inches='tight',
                facecolor=BG_COLOR, edgecolor='none')
    plt.close(fig)
    print(f"[render_math_graph] Saved scatter: {output_path}")


# ─── Shared Axis Styling ─────────────────────────────────────────────────────

def _style_axes(ax, x_range, y_range, spec):
    """Apply clean DSE-exam-style axis formatting."""
    
    # Grid
    if spec.get('show_grid', True):
        ax.grid(True, which='major', color=GRID_COLOR, linewidth=0.6, zorder=0)
        ax.grid(True, which='minor', color='#F0F0F0', linewidth=0.3, zorder=0)
        ax.minorticks_on()
    
    # Axes through origin
    ax.axhline(y=0, color=AXIS_COLOR, linewidth=0.8, zorder=2)
    ax.axvline(x=0, color=AXIS_COLOR, linewidth=0.8, zorder=2)
    
    # Spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#999999')
    ax.spines['bottom'].set_color('#999999')
    ax.spines['left'].set_linewidth(0.5)
    ax.spines['bottom'].set_linewidth(0.5)
    
    # Tick params
    ax.tick_params(axis='both', which='major', labelsize=LABEL_FONT_SIZE - 1,
                   colors='#555555', direction='in', length=4)
    ax.tick_params(axis='both', which='minor', length=2, direction='in')
    
    # Ranges
    if x_range:
        ax.set_xlim(x_range)
    if y_range:
        ax.set_ylim(y_range)
    
    # Axis labels
    x_label = spec.get('x_label', 'x')
    y_label = spec.get('y_label', 'y')
    ax.set_xlabel(x_label, fontsize=FONT_SIZE, fontweight='bold', color='#444444', labelpad=6)
    ax.set_ylabel(y_label, fontsize=FONT_SIZE, fontweight='bold', color='#444444', 
                  labelpad=6, rotation=0, ha='right')
    
    # Integer ticks if range is small
    if x_range and (x_range[1] - x_range[0]) <= 30:
        ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True, nbins=12))
    if y_range and (y_range[1] - y_range[0]) <= 30:
        ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True, nbins=10))


# ─── Entry Point ──────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 3:
        print("Usage: python render_math_graph.py '<json_spec>' '<output_path>'", file=sys.stderr)
        sys.exit(1)
    
    spec_input = sys.argv[1]
    
    # Support reading spec from file (avoids shell escaping issues on Windows)
    try:
        if os.path.isfile(spec_input):
            with open(spec_input, 'r', encoding='utf-8') as f:
                spec = json.load(f)
        else:
            # Strip @ if present for compatibility with old call style
            if spec_input.startswith('@'):
                spec_input = spec_input[1:]
                with open(spec_input, 'r', encoding='utf-8') as f:
                    spec = json.load(f)
            else:
                spec = json.loads(spec_input)
    except (json.JSONDecodeError, FileNotFoundError, Exception) as e:
        print(f"[render_math_graph] Failed to load spec from {spec_input}: {e}", file=sys.stderr)
        sys.exit(1)
    
    output_path = sys.argv[2]
    graph_type = spec.get('type', 'function')
    
    try:
        if graph_type in ('function', 'parametric', 'piecewise', 'inequality'):
            render_function_graph(spec, output_path)
        elif graph_type == 'scatter':
            render_scatter_graph(spec, output_path)
        else:
            # Default to function
            render_function_graph(spec, output_path)
        
        print(json.dumps({"success": True, "path": output_path}))
    except Exception as e:
        print(f"[render_math_graph] Rendering failed: {e}", file=sys.stderr)
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)


if __name__ == '__main__':
    main()
