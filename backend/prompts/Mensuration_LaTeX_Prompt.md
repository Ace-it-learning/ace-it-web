# Mensuration LaTeX Instruction Prompt

When generating Mensuration questions and solution steps, follow these strict LaTeX and formatting rules to ensure the Ace-it frontend renders everything correctly:

## 1. Units & Dimensions
- **Length**: Use `$10 \text{ cm}$` or just `10 cm`. NEVER put units inside math mode unless they are the result of a conversion. (e.g., $10 \text{ cm} \times 5 \text{ cm} = 50 \text{ cm}^2$ is good).
- **Area**: Use `\text{ cm}^2`. (e.g., `$50 \text{ cm}^2$`).
- **Volume**: Use `\text{ cm}^3`. (e.g., `$500 \text{ cm}^3$`).
- **Money**: Use `HKD 500`. NEVER use `$ 500`.
- **Spacing**: ALWAYS place a space between the value and the unit (e.g., `10 cm`, NOT `10cm`).

## 2. Geometry Symbols
- **Degrees**: ALWAYS use `^\circ`. (e.g., `45^\circ`). DO NOT use the raw `°` symbol.
- **Angle**: Use `\angle ABC`.
- **Arc**: Use `\overset{\frown}{AB}` (if supported) or just `\text{arc } AB`. For now, use `\text{arc } AB` to be safe.
- **PI**: Use `\pi`. ALWAYS use `\pi` where appropriate (e.g., $2 \pi r$).

## 3. Mathematical Notation
- **Fractional Volume**: Use `\frac{1}{3} \pi r^2 h`. 
- **Square Root**: Use `\sqrt{a^2 + b^2}`.
- **Powers**: Use `r^2`, `r^3`. MANDATORY curly braces if exponent > 1 char (e.g., `10^{15}`).
- **Multiplication**: Use `\times`. (e.g., `$10 \times 20$`).
- **Approx**: Use `\approx`. (e.g., `\approx 31.4 \text{ cm}`).

## 4. Prohibited Formatting
- **No spaces inside delimiters**: `$ x=10 $` is BAD. `$x=10$` is GOOD.
- **No inline LaTeX for simple prose**: NEVER wrap "Given" or "Answer" in math delimiters.
- **No \implies**: Use `\Rightarrow` for logical steps.

## 5. Metadata Structure
The output should fit into the following JSON structure:
```json
{
  "id": "mensuration_v1_{index}",
  "topic": "Mensuration",
  "difficulty": "Easy | Medium | DSE Standard | Elite",
  "question": "Question text with $LaTeX$",
  "diagram_svg": "<svg>...</svg>",
  "solution_steps": [
    "Step 1: Formula used $Area = \\pi r^2$",
    "Step 2: Substitution $Area = \\pi (10)^2$",
    "Step 3: Result $Area \\approx 314 \\text{ cm}^2$"
  ],
  "final_answer": "314 \\text{ cm}^2"
}
```
