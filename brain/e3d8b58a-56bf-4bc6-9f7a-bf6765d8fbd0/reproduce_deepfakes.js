const WritingQuestService = require('../../backend/services/writing/WritingQuestService');

async function reproduce() {
    const topic = "The Rise of Deepfakes";
    const textType = "Essay";
    const content = `In the silicon-scented corridors of the 21st century, the debate surrounding Artificial Intelligence (AI) has transitioned from science fiction to pedagogical reality. The advent of AI personal tutors has sparked a polarizing discourse: can an algorithm truly replicate the nuanced mentorship of a human educator? While technological purists advocate for a total digital shift, a more balanced perspective suggests that AI, though revolutionary, serves best as a sophisticated supplement rather than a wholesale replacement.

Firstly, AI tutors offer an unprecedented level of personalized learning. In a typical Hong Kong classroom of thirty-five students, a single teacher struggles to cater to the divergent learning paces of every individual. AI algorithms, conversely, can analyze a student's weaknesses in real-time, providing bespoke exercises that target specific linguistic gaps. For instance, if a student consistently falters with inversion or participle phrases, the AI can immediately generate targeted remedial drills. This level of granular customization is simply unattainable for a human teacher burdened by administrative duties and syllabus constraints. Moreover, the adaptive nature of these platforms ensures that high-fliers are never bored by repetition, while struggling learners are never overwhelmed by excessive complexity—a true democratization of elite-level instruction.

However, the 'soul' of education resides in emotional intelligence and moral guidance—areas where AI remains fundamentally deficient. A 5** student is not merely a generator of complex syntax; they are a critical thinker with empathy and social awareness. A human teacher provides the pastoral care necessary to navigate the stresses of the DSE, offering encouragement that transcends binary code. Mentorship involves reading the 'unspoken'—the frustration in a student's eyes or the hesitation in their voice—nuances that even the most advanced Large Language Models fail to parse. Education is a human transaction of values and character-building, something an algorithm can simulate but never truly possess.`;
    
    console.log("--- Reproducing Deepfakes Grading ---");
    try {
        const result = await WritingQuestService.gradeFinalPiece(topic, textType, content);
        console.log("--- REPRODUCTION SUCCESS ---");
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("REPRODUCTION CAUGHT ERROR:", err);
    }
}

reproduce().catch(console.error);
