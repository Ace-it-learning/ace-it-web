class TutorResponseService {
    normalizeResponse(replyText = "", options = {}) {
        const rawText = String(replyText || "");
        const context = this.buildContext(options);
        const suggestions = this.extractSuggestions(rawText, context);
        const actions = this.extractActions(rawText, context);
        let text = rawText
            .replace(/\[SUGGESTIONS:\s*([^\]]+)\]/gi, "")
            .replace(/\[CTA:\s*([^\]]+)\]/gi, "")
            .trim();
        text = this.cleanDisplayText(text);

        if (!text) {
            text = this.buildFallbackReply(context);
        } else {
            text = this.applyProfessionalCoachStyle(text, context);
        }

        const finalSuggestions = suggestions.length > 0
            ? suggestions
            : this.getDefaultSuggestions(context);
        const finalActions = actions.length > 0
            ? actions
            : (context.isPendingSummaryMode ? this.getDefaultActions(context) : []);

        return {
            text,
            suggested_chips: finalSuggestions,
            actions: finalActions
        };
    }

    buildContext(options = {}) {
        return {
            agentId: options.agentId || "english",
            isNewStudent: Boolean(options.isNewStudent),
            hasDiagnostic: Boolean(options.hasDiagnostic),
            isPendingSummaryMode: Boolean(options.isPendingSummaryMode),
            hasRecentActivity: Boolean(options.hasRecentActivity),
            leanContext: options.leanContext || null
        };
    }

    extractSuggestions(text = "", context = {}) {
        const match = String(text).match(/\[SUGGESTIONS:\s*([^\]]+)\]/i);
        if (!match) return [];
        const normalized = this.splitSuggestionText(match[1])
            .map((item) => this.normalizeSuggestionLabel(item))
            .filter(Boolean)
            .slice(0, 4);
        return normalized.length > 0 ? normalized : this.getDefaultSuggestions(context);
    }

    splitSuggestionText(value = "") {
        return String(value)
            .split(/\s*(?:,|，|;|；|\||\n)\s*/g)
            .map((item) => item.replace(/^\s*(?:[-*]|\d+[.)、])\s*/, "").trim())
            .filter(Boolean)
            .filter((item, index, arr) => arr.indexOf(item) === index);
    }

    extractActions(text = "", context = {}) {
        const matches = [...String(text).matchAll(/\[CTA:\s*([^\]]+)\]/gi)];
        const actions = matches.map((match) => {
            const [labelPart, valuePart] = match[1].split("|");
            const label = (labelPart || "Start Practice").trim();
            const value = (valuePart || label).trim();
            const lower = `${label} ${value}`.toLowerCase();

            if (lower.includes("mock") || lower.includes("exam")) {
                return {
                    type: "open_mock",
                    label,
                    payload: { value }
                };
            }

            // Direct lab navigation: open_lab:topic=reading_inference&level=3
            if (value.toLowerCase().startsWith("open_lab:")) {
                const paramsStr = value.slice("open_lab:".length);
                const params = new URLSearchParams(paramsStr);
                let level = params.get("level") || "3";
                // Clamp invalid levels to the valid set: 3, 4, 5, 7
                const validLevels = ["3", "4", "5", "7"];
                if (!validLevels.includes(level)) {
                    const num = parseInt(level, 10);
                    if (num <= 3) level = "3";
                    else if (num === 4) level = "4";
                    else if (num >= 5 && num < 7) level = "5";
                    else if (num >= 7) level = "7";
                    else level = "3";
                }
                return {
                    type: "open_lab",
                    label,
                    payload: {
                        topic: params.get("topic") || "",
                        level: level
                    }
                };
            }

            if (
                lower.includes("start practice") ||
                lower.includes("quest") ||
                lower.includes("practice")
            ) {
                return {
                    type: "open_quest",
                    label,
                    payload: {
                        agentId: context.agentId || "english",
                        value
                    }
                };
            }

            return {
                type: "send_text",
                label,
                payload: { value }
            };
        });

        return actions.slice(0, 3);
    }

    cleanDisplayText(text = "") {
        return String(text)
            .replace(/\[SYSTEM:[^\]]+\]/gi, "")
            .replace(/\[RECENT_ACTIVITY[^\]]*\]/gi, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    applyProfessionalCoachStyle(text = "", context = {}) {
        const trimmed = String(text).trim();
        const hasActionSection = /(today|next step|to-do|todo|focus)/i.test(trimmed);
        const hasBullet = /(^|\n)\s*(?:[-*]|\d+\.)\s+/.test(trimmed);
        const hasCelebration = /(great|nice|well done|good job|excellent|progress)/i.test(trimmed);
        const deterministicPlan = this.getDeterministicTaskPlan(context);

        if (context.isPendingSummaryMode && !hasActionSection) {
            return `${trimmed}\n\n### Today Plan\n${deterministicPlan}`;
        }

        if (!hasBullet) {
            return `${trimmed}\n\n### Next Step\n${deterministicPlan}`;
        }

        if (!hasCelebration && context.hasRecentActivity) {
            return `Great progress so far.\n\n${trimmed}`;
        }

        return trimmed;
    }

    normalizeSuggestionLabel(label = "") {
        const clean = String(label || "").replace(/^["'`]+|["'`]+$/g, "").trim();
        if (!clean) return null;
        return clean.length > 48 ? `${clean.slice(0, 45)}...` : clean;
    }

    buildFallbackReply(context = {}) {
        if (context.isPendingSummaryMode) {
            return "Great work completing your recent tasks. Your momentum is strong. Let us convert that into smart improvement with a focused plan for today.";
        }
        if (context.isNewStudent || !context.hasDiagnostic) {
            return "Welcome. I will coach you step-by-step with a clear study path. We will start from baseline practice, then build your micro-skills week by week.";
        }
        return "I am here as your proactive tutor. Let us focus on your highest-impact micro-skill next and move you forward with a clear practice plan.";
    }

    getDefaultSuggestions(context = {}) {
        if (context.isPendingSummaryMode) {
            return ["Start Practice", "Show Today Plan", "Review Mistakes"];
        }
        if (context.isNewStudent || !context.hasDiagnostic) {
            return ["Start Baseline Quest", "Build Weekly Plan", "Show Focus Area"];
        }
        return ["Start Practice", "Improve Weak Micro-skill", "What To Do Next"];
    }

    getDefaultActions(context = {}) {
        if (!context.isPendingSummaryMode) {
            return [];
        }
        return [{
            type: "open_quest",
            label: "Start Practice",
            payload: {
                agentId: context.agentId || "english",
                value: `open_quest:${context.agentId || "english"}`
            }
        }];
    }

    getDeterministicTaskPlan(context = {}) {
        const tasks = context?.leanContext?.plan?.dailyTasks;
        if (Array.isArray(tasks) && tasks.length > 0) {
            return tasks.slice(0, 3).map((task) => `- ${task}`).join("\n");
        }
        return "- Start one focused practice now.\n- Keep your session short and high quality (20-30 minutes).\n- Review one mistake pattern before ending.";
    }

    buildTutorContractInstruction(agentId = "english") {
        return `
### TUTOR OUTPUT CONTRACT
- Be a proactive HKDSE tutor: always end with one clear next step.
- If suggesting practice, suggest only existing app practice/Quest paths, never invent a named Quest.
- Prefer focus areas and micro-skills when unsure of exact Quest IDs.
- Use [TUTOR_LEAN_CONTEXT] as the primary evidence for diagnosis and recommendations.
- Ground every suggestion in observed weak micro-skills and recent Quest/Mock outcomes.
- PRIORITY RULE for micro-skill recommendations:
  1. FIRST, check TUTOR_LEAN_CONTEXT.microSkills.unassessed. If there are unassessed (never-practiced) skills, recommend one of those for baseline practice.
  2. ONLY if there are no unassessed skills OR the student explicitly asks to improve a specific practiced skill, then recommend from the weakest practiced skills.
  3. Do not tell a student to "improve" a skill they have already scored well on (e.g., 80%+) when untouched skills still exist on their map.
- If you include quick reply chips, output exactly one tag in this format:
  [SUGGESTIONS: chip one | chip two | chip three]
- Keep chips short and independent; never put multiple choices inside one chip.
- Only include a practice CTA when you are genuinely recommending practice right now. Do NOT add a CTA when:
  - Asking the student for information (e.g., grades, preferences, goals).
  - Giving general advice, explanations, or motivational messages without a specific practice task.
  - Continuing a normal conversation.
- If you include a practice button, the label must be specific and descriptive:
  - For a general Quest roadmap: [CTA: Continue Quest Roadmap | open_quest:${agentId}]
  - For a specific lab / micro-skill: [CTA: Practice <skill-name> | open_lab:topic=\${topicId}&level=3]
    Example: [CTA: Practice Reading Inference | open_lab:topic=reading_inference&level=3]
  - VALID LEVELS ONLY: Use ONLY these exact level values in open_lab URLs: 3 (Easy), 4 (Medium), 5 (DSE Standard), 7 (Elite). NEVER use 1, 2, or 6.
  - Never use a generic "Start Practice" label; name the actual activity.
  - Only use open_lab when you are certain of the exact micro-skill ID from TUTOR_LEAN_CONTEXT.
- For post-completion summaries, group all supplied events into one concise coaching message: celebrate, diagnose weak micro-skills, and give today's 2-3 item to-do list.
- Tone requirements: professional, encouraging, concise, and specific. Avoid generic motivation without concrete study actions.
- New student mode: provide a starter roadmap direction (baseline -> weak skill -> checkpoint) with clear first action.
- Existing student mode: cite progress trend briefly and give a next-step micro-skill action plan.
`;
    }
}

module.exports = new TutorResponseService();
