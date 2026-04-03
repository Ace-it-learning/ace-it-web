const GenerativeAIService = require('c:/Users/user/Documents/ace-it-web/backend/services/GenerativeAIService');
const fs = require('fs');

async function run() {
    const systemPrompt = `[Role]
You are an expert, meticulous Hong Kong DSE Mathematics Exam Setter. Your sole function is to take provided mathematical parameters and format them into a flawless exam question and step-by-step solution.

[Critical Rules]
1. STRICT ADHERENCE TO PARAMETERS: You MUST use the exact numbers provided in the input prompt. Do NOT invent, randomize, or alter costs, markups, or percentages.
2. NO DECIMAL ANSWERS: DSE percentage questions resolve to clean numbers (e.g., 20%, 25%, 33.3%). If your math yields an ugly decimal like 24.93%, you have failed. 
3. NO INTERNAL MONOLOGUE: Do NOT output your thought process. Do NOT write "The question is flawed" or "I am correcting the question." Output ONLY the final Question and Solution.
4. LANGUAGE ENFORCEMENT: Output each question in a BILINGUAL format (English first, followed by Traditional Chinese ZH-HK).

[LaTeX Formatting]
1. DELIMITERS: Every single number, variable, percentage, and formula MUST be enclosed in $ for inline math or $$ for block equations. (Example: The cost is $100$).
2. DOUBLE BACKSLASHES: You MUST double-escape all LaTeX commands.
   - Write \\\\times (NOT \\times)
   - Write \\\\approx (NOT \\approx)
   - Write \\\\% (NOT \\%)
   - Write \\\\frac{a}{b} (NOT \\frac{a}{b})
3. SPACING: Ensure there is a space between words and math variables. (Example: Write "markup of $80\\\\%$", NOT "markup$80\\\\%$").

[Output Structure]
Question:
[Bilingual English & Chinese Narrative]

Solution:
[Step-by-step with LaTeX]

Final Answer: [Answer with $ delimiters and double-escaped LaTeX]
`;

    const instructions = `Generate 10 Maths Questions following these individual topic parameters. Provide each in a bilingual DSE-style format (English followed by Traditional Chinese).

    1. Topic: Percentages (Simple Interest)
    Difficulty: Level 1 (Easy)
    Parameters: {Principal: 50000, Rate_pa: 4, Years: 3, Answer_Interest: 6000, Answer_Amount: 56000}
    Instruction: Generate a question asking for the simple interest and the amount.

    2. Topic: Percentages (Compound Interest)
    Difficulty: Level 1 (Easy)
    Parameters: {Principal: 80000, Rate_pa: 5, Years: 2, Compounded: "yearly", Answer_Amount: 88200}
    Instruction: Generate a straightforward compound interest question asking for the total amount.

    3. Topic: Percentages (Depreciation and Appreciation)
    Difficulty: Level 2 (Medium)
    Parameters: {Item: "Car", Initial_Value: 120000, Year_1_Change: -10, Year_2_Change: 5, Answer_Final_Value: 113400}
    Instruction: Generate a 2-step question where the value depreciates in the first year and appreciates in the second.

    4. Topic: Percentages (Retail Profit & Loss)
    Difficulty: Level 2 (Medium)
    Parameters: {Cost: 200, Markup_Pct: 40, Marked_Price: 280, Discount_Pct: 15, Selling_Price: 238, Answer_Profit_Pct: 19}
    Instruction: Generate a question where a merchant marks up an item and then gives a discount. Ask for the final profit percentage.

    5. Topic: Percentages (Retail Profit & Loss with Friction)
    Difficulty: Level 3 (DSE Level)
    Parameters: {Cost: 60, Total_Items: 300, Markup_Pct: 50, Damage_Pct: 10, Target_Profit_Pct: 8, Answer_Discount_Pct: 20}
    Instruction: Generate a realistic DSE question involving damaged/unsellable goods where the merchant must calculate the discount on the remaining items to hit a target profit.

    6. Topic: Percentages (Compound Interest - Different Frequencies)
    Difficulty: Level 3 (DSE Level)
    Parameters: {Principal: 100000, Rate_pa: 8, Years: 2, Plan_A_Compounded: "yearly", Plan_B_Compounded: "half-yearly", Plan_A_Amount: 116640, Plan_B_Amount: 116985.86, Answer_Difference: 345.86}
    Instruction: Generate a question comparing two banking plans (yearly vs half-yearly) and ask for the difference in interest. Round the final answer to the nearest cent.

    7. Topic: Percentages (Percentage Change in Area)
    Difficulty: Level 3 (DSE Level)
    Parameters: {Shape: "Triangle", Base_Change_Pct: 20, Height_Change_Pct: -10, Answer_Area_Change_Pct: 8}
    Instruction: Generate a question asking for the percentage change in the area of a triangle if its base increases and its height decreases.

    8. Topic: Percentages (Reverse Compound Interest)
    Difficulty: Level 4 (Elite)
    Parameters: {Amount: 146410, Rate_pa: 10, Years: 4, Compounded: "yearly", Answer_Principal: 100000}
    Instruction: Generate a question where the final amount and interest rate are known, but the student must work backward to find the original principal.

    9. Topic: Percentages (Reverse Profit & Loss)
    Difficulty: Level 4 (Elite)
    Parameters: {Selling_Price: 3400, Discount_Pct: 15, Marked_Price: 4000, Profit_Pct: 25, Answer_Cost: 2720}
    Instruction: Generate a question where the selling price, discount percentage, and final profit percentage are given, and the student must find the original cost.

    10. Topic: Percentages (Multi-stage Depreciation)
    Difficulty: Level 4 (Elite)
    Parameters: {Item: "Machine", Initial_Value: 500000, Dep_Rate_Year1: 20, Dep_Rate_Year2: 15, Value_After_2_Years: 340000, Sold_For: 289000, Answer_Loss_Pct: 15}
    Instruction: Generate a question where a machine depreciates at different rates for two years, and is then sold at a further loss. Ask for the percentage loss on the sale compared to its value at the start of year 3.
    `;

    try {
        const result = await GenerativeAIService.generateContent(instructions, {
            model: 'gemini-1.5-pro',
            systemInstruction: systemPrompt,
            highQuality: true
        });
        const text = result.response.text();
        fs.writeFileSync('c:/Users/user/Documents/ace-it-web/backend/generated_questions.txt', text);
        console.log("DONE");
    } catch (err) {
        fs.writeFileSync('c:/Users/user/Documents/ace-it-web/backend/generated_questions.txt', err.message);
        process.stderr.write(err.message + '\\n');
    }
}
run();
