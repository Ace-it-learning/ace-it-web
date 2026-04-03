const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const diagrams = {
    "Arc Length & Sector Area": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 100 100 L 180 100 A 80 80 0 0 0 140 30 Z" fill="rgba(59,130,246,0.1)" stroke="#333" stroke-width="2"/><text x="120" y="90" font-family="sans-serif" font-size="12">θ</text><text x="140" y="115" font-family="sans-serif" font-size="12">r</text></svg>`,
    "Area of a Segment": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M 100 100 L 180 100 A 80 80 0 0 0 140 30 Z" fill="none" stroke="#333" stroke-width="2"/><path d="M 180 100 A 80 80 0 0 0 140 30 L 180 100 Z" fill="rgba(59,130,246,0.3)" stroke="#333" stroke-width="2"/><line x1="100" y1="100" x2="140" y2="30" stroke="#333" stroke-width="2"/><text x="120" y="90" font-family="sans-serif" font-size="12">θ</text></svg>`,
    "Cylinder": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="50" rx="40" ry="15" fill="none" stroke="#333" stroke-width="2"/><path d="M 60 50 L 60 150 A 40 15 0 0 0 140 150 L 140 50" fill="none" stroke="#333" stroke-width="2"/><line x1="100" y1="50" x2="140" y2="50" stroke="#333"/><text x="115" y="45" font-family="sans-serif" font-size="12">r</text><text x="150" y="100" font-family="sans-serif" font-size="12">h</text></svg>`,
    "Cone": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="150" rx="50" ry="15" fill="none" stroke="#333" stroke-width="2"/><line x1="50" y1="150" x2="100" y2="40" stroke="#333" stroke-width="2"/><line x1="150" y1="150" x2="100" y2="40" stroke="#333" stroke-width="2"/><line x1="100" y1="150" x2="100" y2="40" stroke="#333" stroke-dasharray="4,4"/><line x1="100" y1="150" x2="150" y2="150" stroke="#333"/><text x="120" y="165" font-family="sans-serif" font-size="12">r</text><text x="85" y="100" font-family="sans-serif" font-size="12">h</text><text x="135" y="95" font-family="sans-serif" font-size="12">l</text></svg>`,
    "Sphere": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="50" fill="none" stroke="#333" stroke-width="2"/><ellipse cx="100" cy="100" rx="50" ry="15" fill="none" stroke="#333" stroke-dasharray="4,4"/><line x1="100" y1="100" x2="150" y2="100" stroke="#333"/><text x="120" y="95" font-family="sans-serif" font-size="12">r</text></svg>`,
    "Frustum (Truncated Cone/Pyramid)": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="70" rx="25" ry="8" fill="none" stroke="#333" stroke-width="2"/><ellipse cx="100" cy="150" rx="50" ry="15" fill="none" stroke="#333" stroke-width="2"/><line x1="75" y1="70" x2="50" y2="150" stroke="#333" stroke-width="2"/><line x1="125" y1="70" x2="150" y2="150" stroke="#333" stroke-width="2"/></svg>`,
    "Ratios of Similar Solids": `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="70" cy="100" r="30" fill="none" stroke="#333" stroke-width="2"/><circle cx="150" cy="100" r="45" fill="none" stroke="#333" stroke-width="2"/><text x="65" y="150" font-family="sans-serif" font-size="12">V₁</text><text x="145" y="165" font-family="sans-serif" font-size="12">V₂</text></svg>`
};

async function patchMensurationBriefing() {
    console.log("🚀 Starting Patching of Mensuration Briefing diagrams...");

    const docRef = db.collection('learning_content').doc('math_mensuration');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        console.error("❌ math_mensuration document NOT FOUND.");
        return;
    }

    const data = docSnap.data();
    let updated = false;

    if (data.learning_modules) {
        data.learning_modules.forEach(module => {
            if (module.concepts) {
                module.concepts.forEach(concept => {
                    const diagram = diagrams[concept.name];
                    if (diagram) {
                        const base64 = Buffer.from(diagram).toString('base64');
                        concept.visual_aid = `data:image/svg+xml;base64,${base64}`;
                        concept.visual = diagram; // Keep raw SVG for future reference
                        console.log(`✅ Injected Base64 diagram into (visual_aid): ${concept.name}`);
                        updated = true;
                    }
                });
            }
        });
    }

    if (updated) {
        await docRef.set(data);
        console.log("🎊 Successfully updated math_mensuration briefing diagrams!");
    } else {
        console.log("⚠️ No matching concepts found for diagram injection.");
    }
}

patchMensurationBriefing().then(() => process.exit(0)).catch(err => {
    console.error("❌ Patching failed:", err);
    process.exit(1);
});
