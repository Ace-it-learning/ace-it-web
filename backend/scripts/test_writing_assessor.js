const MicroSkillAssessor = require('../services/MicroSkillAssessor');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const writingData = {
    "text": "To: Principal, Ms. Wong\nFrom: Fung Tam\nDate: 4 Feb 2026\nSubject: Proposal for a new school garden\n\nDear Ms. Wong,\n\nI am writing to propose the creation of a new school garden on the rooftop of our campus. This initiative will not only beautify our environment but also provide a hands-on learning opportunity for students interested in biology and environmental science.\n\nFirst, a garden can serve as a 'living laboratory'. Students can observe plant growth, study ecosystems, and understand the importance of biodiversity firsthand. This practical experience is far more engaging than simply reading from textbooks.\n\nSecond, the garden will promote mental well-being. Modern city life is stressful, and spend time in nature is known to reduce anxiety. Our students can use the garden as a quiet space for reflection and relaxation during breaks.\n\nIn terms of maintenance, we can form a 'Green Club' consisting of student volunteers. They will be responsible for watering the plants and ensuring the garden is tidy. We can also seek advice from the local community experts.\n\nI hope you will consider this proposal favorably. I am happy to discuss the details further at your convenience.\n\nYours sincerely,\nFung Tam\nStudent Council Representative",
    "score": 18,
    "grade_label": "5",
    "level_estimate": 5,
    "feedback": "Strong writing with clear organization and good vocabulary."
};

async function testWritingAssessor() {
    console.log("Testing Writing Assessor...");
    try {
        const skills = await MicroSkillAssessor.assessWritingSkills(writingData);
        console.log("Assessment Results:");
        console.log(JSON.stringify(skills, null, 2));
    } catch (err) {
        console.error("Error during assessment:", err);
    }
}

testWritingAssessor().then(() => process.exit());
