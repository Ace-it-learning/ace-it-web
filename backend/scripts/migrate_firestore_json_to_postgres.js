const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { getContainer } = require("../db/cosmos");

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function ensureContainers() {
    await getContainer("users", "/pk");
    await getContainer("user_stats", "/pk");
    await getContainer("mock_submissions", "/pk");
}

async function migrateUsers(usersJson) {
    if (!usersJson || typeof usersJson !== "object") return { migrated: 0 };
    const users = await getContainer("users", "/pk");
    const statsContainer = await getContainer("user_stats", "/pk");
    let migrated = 0;
    for (const [uid, profile] of Object.entries(usersJson)) {
        const p = profile || {};
        const stats = {
            xp: Number(p.xp || 0),
            level: Number(p.level || 1),
            learningTime: Number(p.learningTime || 0),
            streakDays: Number(p.streakDays || 0)
        };
        await users.items.upsert({
            id: `user_${uid}`,
            pk: uid,
            uid,
            profile: p,
            updatedAt: new Date().toISOString()
        });
        await statsContainer.items.upsert({
            id: `stats_${uid}`,
            pk: uid,
            uid,
            stats,
            updatedAt: new Date().toISOString()
        });
        migrated++;
    }
    return { migrated };
}

async function migrateExamSubmissions(submissionsJson) {
    if (!submissionsJson || typeof submissionsJson !== "object") return { migrated: 0 };
    const mockSubmissions = await getContainer("mock_submissions", "/pk");
    let migrated = 0;
    for (const [docId, payload] of Object.entries(submissionsJson)) {
        const uid = payload?.uid || "guest_user";
        const examId = payload?.examId || "unknown_exam";
        await mockSubmissions.items.upsert({
            id: `submission_${docId}`,
            pk: uid,
            uid,
            exam_id: examId,
            source_doc_id: docId,
            payload,
            created_at: new Date().toISOString()
        });
        migrated++;
    }
    return { migrated };
}

async function runParityReport(usersJson, submissionsJson) {
    const users = await getContainer("users", "/pk");
    const mockSubmissions = await getContainer("mock_submissions", "/pk");
    const usersCountResult = await users.items.query("SELECT VALUE COUNT(1) FROM c").fetchAll();
    const submissionsCountResult = await mockSubmissions.items.query("SELECT VALUE COUNT(1) FROM c").fetchAll();
    const usersCount = Number(usersCountResult.resources?.[0] || 0);
    const submissionsCount = Number(submissionsCountResult.resources?.[0] || 0);
    return {
        sourceUsers: usersJson ? Object.keys(usersJson).length : 0,
        dbUsers: usersCount,
        sourceSubmissions: submissionsJson ? Object.keys(submissionsJson).length : 0,
        dbSubmissions: submissionsCount
    };
}

async function main() {
    const backupDir = process.env.FIRESTORE_BACKUP_DIR || path.join(__dirname, "..", "backups", "firestore");
    const usersJson = readJson(path.join(backupDir, "users.json"));
    const submissionsJson = readJson(path.join(backupDir, "exam_submissions.json"));

    if (!usersJson && !submissionsJson) {
        throw new Error(`No migration source files found in ${backupDir}`);
    }

    await ensureContainers();
    const usersRes = await migrateUsers(usersJson);
    const subRes = await migrateExamSubmissions(submissionsJson);
    const parity = await runParityReport(usersJson, submissionsJson);

    console.log("[migrate_firestore_json_to_cosmos] done", {
        usersMigrated: usersRes.migrated,
        submissionsMigrated: subRes.migrated,
        parity
    });
}

main().catch((err) => {
    console.error("[migrate_firestore_json_to_cosmos] failed:", err);
    process.exit(1);
});
