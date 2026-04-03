const GenerativeAIService = require('c:/Users/user/Documents/ace-it-web/backend/services/GenerativeAIService');
const fs = require('fs');

async function run() {
    const systemPrompt = `[Role]
You are an expert, meticulous Hong Kong DSE Mathematics Exam Setter. Your sole function is to take provided mathematical parameters and format them into a flawless exam question and step-by-step solution.

[Critical Rules]
1. STRICT ADHERENCE TO PARAMETERS: You MUST use the exact numbers provided in the input prompt. Do NOT invent, randomize, or alter costs, markups, or percentages.
2. NO DECIMAL ANSWERS: DSE percentage questions resolve to clean numbers (e.g., 20%, 25%, 33.3%). If your math yields an ugly decimal like 24.93%, you have failed. 
3. NO INTERNAL MONOLOGUE: Do NOT output your thought process. 
4. LANGUAGE ENFORCEMENT: Output each question in a BILINGUAL format (English first, followed by Traditional Chinese ZH-HK).

[LaTeX Formatting]
1. DELIMITERS: Every single number, variable, percentage, and formula MUST be enclosed in $ for inline math or $$ for block equations. (Example: The cost is $100$).
2. DOUBLE BACKSLASHES: You MUST double-escape all LaTeX commands.
   - Write \\\\times (NOT \\times)
   - Write \\\\approx (NOT \\approx)
   - Write \\\\% (NOT \\%)
   - Write \\\\frac{a}{b} (NOT \\frac{a}{b})
3. SPACING: Ensure there is a space between words and math variables.

[Output Structure]
Question:
[Bilingual narrative]

Solution:
[Step-by-step with LaTeX]

Final Answer: [Answer with $ delimiters and double-escaped LaTeX]
`;

    const instructions = `Generate 5 Maths Questions following these individual topic parameters. Provide each in a bilingual DSE-style format (English followed by Traditional Chinese).

    1. Topic: Percentages (Simple Interest)
    Parameters: {Principal: 50000, Rate_pa: 4, Years: 3, Answer_Interest: 6000, Answer_Amount: 56000}

    2. Topic: Percentages (Compound Interest)
    Parameters: {Principal: 80000, Rate_pa: 5, Years: 2, Compounded: "yearly", Answer_Amount: 88200}

    3. Topic: Percentages (Depreciation and Appreciation)
    Parameters: {Item: "Car", Initial_Value: 120000, Year_1_Change: -10, Year_2_Change: 5, Answer_Final_Value: 113400}

    4. Topic: Percentages (Retail Profit & Loss)
    Parameters: {Cost: 200, Markup_Pct: 40, Marked_Price: 280, Discount_Pct: 15, Selling_Price: 238, Answer_Profit_Pct: 19}

    5. Topic: Percentages (Retail Profit & Loss with Friction)
    Parameters: {Cost: 60, Total_Items: 300, Markup_Pct: 50, Damage_Pct: 10, Target_Profit_Pct: 8, Answer_Discount_Pct: 20}
    `;

    try {
        const result = await GenerativeAIService.generateContent(instructions, {
            model: 'gemini-1.5-pro'
        });
        const text = result.response.text();
        fs.appendFileSync('c:/Users/user/Documents/ace-it-web/backend/generated_questions.txt', text + "\n\n");
        console.log("DONE_PART_1");
    } catch (err) {
        process.stderr.write(err.message + '\n');
    }
}
run();
