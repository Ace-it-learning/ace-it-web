const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, '..', 'services', 'maths', 'MathsLabService.js');
let content = fs.readFileSync(servicePath, 'utf8');

const startTag = `static async getLearningContent(topicId, language = 'en') {`;
const endTag = `static async gradeShortAnswers(answers, systemConfig) {`;

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const newFunction = `static async getLearningContent(topicId, language = 'en') {
        const admin = require('firebase-admin');
        const db = admin.firestore();

        try {
            // Check Firestore for modular content
            const docRef = db.collection('learning_content').doc(topicId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                console.log(\`[MathsLabService] Loaded modular content for \${topicId} from Firestore\`);
                return docSnap.data();
            }
        } catch (error) {
            console.error(\`[MathsLabService] Error fetching learning content for \${topicId}:\`, error);
        }

        // Generic fallback if not in Firestore
        const isChinese = language === 'zh' || language === 'zh-HK';

        return {
            name: "Learning Brief",
            name_zh: "學習簡報",
            roadmap: isChinese ? "此主題的學習路徑即將推出。" : "Mastery roadmap for this topic is coming soon.",
            content_en: {
                concept: "Learning content for this topic is being prepared by our AI tutors.",
                methodology: "Step-by-step methodology will be available shortly.",
                tips: "Expert tips are being curated.",
                traps: "DSE traps are being analyzed."
            },
            content_zh: {
                concept: "AI 導師正在準備此主題的學習內容。",
                methodology: "詳細的解題步驟即將推出。",
                tips: "專家提示正在編寫中。",
                traps: "DSE 考試陷阱正在分析中。"
            }
        };
    }

    `;

    content = content.substring(0, startIndex) + newFunction + content.substring(endIndex);
    fs.writeFileSync(servicePath, content);
    console.log("Successfully replaced getLearningContent.");
} else {
    console.error("Could not find start or end tags.");
}
