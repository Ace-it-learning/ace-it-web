import { db } from "../firebase";

/**
 * Utility to upload Past Paper JSON to Firestore.
 * This should be run from the browser console while logged in with a Student account
 * that has broad write permissions (or update firestore.rules temporarily).
 * NOTE: This utility is legacy and only works when Firebase is enabled (PROD or legacy DEV).
 */
export const uploadPaperToFirestore = async (paperData) => {
    if (!db) {
        console.error("[Migration] Firebase Firestore is not initialized. This utility requires Firebase mode (VITE_USE_ENTRA=false).");
        return false;
    }
    const { collection, doc, setDoc, writeBatch } = await import("firebase/firestore");
    const { paper_metadata, resource_files, questions } = paperData;
    const paperId = paper_metadata.paper_id;

    console.log(`[Migration] Starting upload for ${paperId}...`);

    try {
        // 1. Metadata
        console.log("- Submitting Metadata setDoc...");
        await setDoc(doc(db, "past_papers", paperId), {
            metadata: paper_metadata,
            lastUpdated: new Date().toISOString()
        });
        console.log("✓ Metadata uploaded.");

        // 2. Resources (Passages)
        console.log("- Submitting Resources...");
        for (const res of resource_files) {
            console.log(`  > Resource: ${res.resource_id}...`);
            await setDoc(doc(db, "past_papers", paperId, "resources", res.resource_id), res);
        }
        console.log("✓ Resources uploaded.");

        // 3. Questions (Batching for efficiency)
        console.log("- Submitting Questions batch...");
        const batch = writeBatch(db);
        questions.forEach(q => {
            const qRef = doc(db, "past_papers", paperId, "questions", `q${q.id}`);
            batch.set(qRef, q);
        });
        await batch.commit();
        console.log("✓ Questions uploaded.");

        console.log(`[Migration] Success! ${questions.length} questions uploaded.`);
        return true;
    } catch (err) {
        console.error("[Migration] CRITICAL ERROR:", err.code, err.message, err);
        alert(`Migration Error: ${err.message}`);
        return false;
    }
};
