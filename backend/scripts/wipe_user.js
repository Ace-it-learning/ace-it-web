/**
 * ⚠️  DANGER: COMPLETE USER DATA WIPE SCRIPT
 *
 * This script will PERMANENTLY DELETE all data for a specified email account.
 *
 * It will wipe:
 *   - User profile (grade, targets, dream programs, devices, etc.)
 *   - Chat history with all AI tutors
 *   - Quest / Mock exam results & history
 *   - Exam submissions & attempts
 *   - Skill progress (English & Maths) + progress snapshots
 *   - Notebook items (golden nuggets, mistakes, vocabulary)
 *   - Inventory (avatars, frames, blind box items)
 *   - Timeline events (XP awards, milestones)
 *   - Gamification stats (XP, level, streaks)
 *   - Practice history
 *   - Voice/TTS usage records
 *   - Study roadmap plans
 *   - Tutor completion events
 *   - Report logs
 *   - Generic result documents
 *
 * Usage:
 *   node scripts/wipe_user.js <email>
 *
 * Examples:
 *   node scripts/wipe_user.js fungtram@gmail.com
 *   WIPE_AUTO_CONFIRM=1 node scripts/wipe_user.js fungtram@gmail.com
 *
 * IMPORTANT:
 *   - Requires backend/.env to be present (Cosmos DB connection)
 *   - Subscription data (Stripe) is NOT touched — cancel manually if needed
 */

require("dotenv").config();

const { createRepositories } = require("../repositories");
const CosmosStore = require("../services/CosmosStore");
const CacheService = require("../services/CacheService");

// ── Parse email from command line ──
const TARGET_EMAIL = process.argv[2];

function showUsage() {
    console.log("Usage: node scripts/wipe_user.js <email>");
    console.log("");
    console.log("Examples:");
    console.log('  node scripts/wipe_user.js fungtram@gmail.com');
    console.log('  WIPE_AUTO_CONFIRM=1 node scripts/wipe_user.js fungtram@gmail.com');
    console.log("");
    console.log("Environment variables:");
    console.log("  WIPE_AUTO_CONFIRM=1  Skip the 5-second safety pause");
    process.exit(1);
}

async function main() {
    if (!TARGET_EMAIL || !TARGET_EMAIL.includes("@")) {
        console.error("❌ Error: Please provide a valid email address.\n");
        showUsage();
    }

    console.log("========================================");
    console.log("  ACE IT! — COMPLETE USER DATA WIPE");
    console.log("========================================");
    console.log(`Target account: ${TARGET_EMAIL}`);
    console.log("");

    // ── 1. Resolve UID from email ──
    const { userRepo } = createRepositories();
    const uid = await userRepo.findUidByEmail(TARGET_EMAIL);

    if (!uid) {
        console.error(`❌ No user found with email: ${TARGET_EMAIL}`);
        console.error("   Nothing to delete. Exiting.");
        process.exit(1);
    }

    console.log(`✅ Resolved UID: ${uid}`);
    console.log("");

    // ── 2. Safety confirmation ──
    console.log("⚠️  WARNING: This action is IRREVERSIBLE.");
    console.log(`   All data for ${TARGET_EMAIL} (${uid}) will be PERMANENTLY deleted.`);
    console.log("");

    const autoConfirm = process.env.WIPE_AUTO_CONFIRM === "1";
    if (!autoConfirm) {
        console.log("   Set WIPE_AUTO_CONFIRM=1 to skip this pause.");
        console.log("   Waiting 5 seconds before proceeding...");
        console.log("   Press Ctrl+C now to abort.");
        console.log("");
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // ── 3. Clear cache first ──
    console.log("🧹 Clearing in-memory cache...");
    CacheService.invalidateUserDbCache(uid);
    console.log("   Done.");
    console.log("");

    // ── 4. Wipe all user-scoped containers ──
    const containersToWipe = [
        { name: "chat_messages", label: "Chat messages" },
        { name: "timeline_events", label: "Timeline events" },
        { name: "inventory_items", label: "Inventory items" },
        { name: "quest_results", label: "Quest / Mock results" },
        { name: "notebook_items", label: "Notebook items" },
        { name: "progress_snapshots", label: "Progress snapshots" },
        { name: "exam_submissions", label: "Exam submissions" },
        { name: "exam_attempts", label: "Exam attempts" },
        { name: "practice_history", label: "Practice history" },
        { name: "voice_usage", label: "Voice/TTS usage" },
        { name: "roadmap_plans", label: "Study roadmaps" },
        { name: "tutor_completion_events", label: "Tutor completion events" },
        { name: "report_logs", label: "Report logs" },
        { name: "results", label: "Result documents" },
        { name: "user_stats", label: "Gamification stats (XP, streaks, level)" },
        { name: "users", label: "User profile" },
    ];

    let totalDeleted = 0;
    const results = [];

    for (const { name, label } of containersToWipe) {
        try {
            const count = await CosmosStore.purgeByPk(name, uid);
            totalDeleted += count;
            results.push({ label, count, ok: true });
            console.log(`   ✅ ${label}: ${count} item(s) deleted`);
        } catch (err) {
            results.push({ label, count: 0, ok: false, error: err.message });
            console.error(`   ❌ ${label}: FAILED — ${err.message}`);
        }
    }

    // ── 5. Wipe subject-specific progress (english, maths, mock_summary) ──
    const progressSubjects = ["english", "maths", "mock_summary"];
    for (const subject of progressSubjects) {
        try {
            await CosmosStore.clearProgress(uid, subject);
            results.push({ label: `Progress (${subject})`, count: 1, ok: true });
            console.log(`   ✅ Progress (${subject}): cleared`);
        } catch (err) {
            results.push({ label: `Progress (${subject})`, count: 0, ok: false, error: err.message });
            console.error(`   ❌ Progress (${subject}): FAILED — ${err.message}`);
        }
    }

    // ── 6. Final summary ──
    console.log("");
    console.log("========================================");
    console.log("  WIPE COMPLETE");
    console.log("========================================");
    console.log(`Account: ${TARGET_EMAIL}`);
    console.log(`UID:     ${uid}`);
    console.log(`Total items deleted: ${totalDeleted}`);
    console.log("");

    const failures = results.filter((r) => !r.ok);
    if (failures.length > 0) {
        console.log("⚠️  Some containers failed to wipe:");
        failures.forEach((f) => console.log(`   - ${f.label}: ${f.error}`));
        console.log("");
        process.exit(1);
    } else {
        console.log("🎉 All data wiped successfully.");
        console.log("   You can now start fresh with this account.");
        console.log("");
        console.log("NOTE: Stripe subscription data was NOT touched.");
        console.log("      Cancel your subscription manually if needed.");
        process.exit(0);
    }
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
