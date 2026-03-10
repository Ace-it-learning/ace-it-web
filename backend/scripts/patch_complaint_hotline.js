const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const QUEST_ID = '728a48bb1240eb9309dd85c1e54c336b';

async function updateQuest() {
    const questRef = db.collection('question_bank').doc(QUEST_ID);

    const updateData = {
        introduction: "You are working as a trainee at a customer service hotline for 'TechGadget HK'. You will hear a call from an angry customer, Mr. Lee, who is reporting an issue with his recently purchased laptop.",
        situation: "Mr. Lee is frustrated because his new laptop is overheating. He wants a refund, but he might have voided the warranty. Your job is to listen for the specific details of his complaint and the outcome.",
        prediction_metadata: {
            topic_name: "Customer Service Complaints",
            sub_topics: [
                {
                    id: '1',
                    name: "Defective Product",
                    synonyms: ["broken", "not working", "malfunction", "faulty"],
                    is_distractor: false
                },
                {
                    id: '2',
                    name: "Refund Request",
                    synonyms: ["money back", "return", "reimbursement"],
                    is_distractor: false
                },
                {
                    id: '3',
                    name: "Warranty Policy",
                    synonyms: ["guarantee", "terms and conditions", "coverage"],
                    is_distractor: false
                },
                {
                    id: '4',
                    name: "Space Travel",
                    synonyms: [],
                    is_distractor: true,
                    hint: "Is this relevant to a laptop complaint?"
                },
                {
                    id: '5',
                    name: "Store Credit",
                    synonyms: ["voucher", "exchange", "coupon"],
                    is_distractor: false
                },
                {
                    id: '6',
                    name: "Tax Reform",
                    synonyms: [],
                    is_distractor: true,
                    hint: "Government policy is unlikely to be discussed here."
                }
            ]
        }
    };

    try {
        await questRef.update(updateData);
        console.log('Successfully updated quest:', QUEST_ID);
        console.log('Added Introduction, Situation, and Prediction Metadata.');
    } catch (err) {
        console.error('Error updating quest:', err);
    }
}

updateQuest();
