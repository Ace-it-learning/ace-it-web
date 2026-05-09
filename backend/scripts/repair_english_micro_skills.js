const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const CosmosStore = require("../services/CosmosStore");
const UserProfileService = require("../services/UserProfileService");

function parseArgs(argv = []) {
    const args = {
        uid: null,
        all: false,
        dryRun: false
    };

    for (const arg of argv) {
        if (arg === "--all") args.all = true;
        if (arg === "--dry-run") args.dryRun = true;
        if (arg.startsWith("--uid=")) args.uid = arg.slice("--uid=".length).trim();
    }
    return args;
}

async function listEnglishProgressUids(limit = 5000) {
    const c = await CosmosStore.container("user_progress");
    const top = Math.min(Math.max(Number(limit) || 5000, 1), 20000);
    const result = await c.items.query({
        query: `SELECT TOP ${top} c.pk FROM c WHERE c.subject = "english" AND IS_DEFINED(c.payload.microSkills)`
    }).fetchAll();
    return Array.from(new Set((result.resources || []).map((r) => r.pk).filter(Boolean)));
}

function mergePracticedSkills(existing, canonicalIds) {
    return Array.from(new Set([
        ...(Array.isArray(existing) ? existing : []),
        ...canonicalIds
    ]));
}

async function repairUid(uid, { dryRun = false } = {}) {
    const progress = await CosmosStore.getProgress(uid, "english");
    if (!progress || !progress.microSkills || typeof progress.microSkills !== "object") {
        return { uid, repaired: false, reason: "no english microSkills payload" };
    }

    const beforeKeys = Object.keys(progress.microSkills);
    const canonicalized = UserProfileService.canonicalizeEnglishMicroSkills(progress.microSkills);
    const afterKeys = Object.keys(canonicalized.microSkills || {});
    const removedKeys = beforeKeys.filter((k) => !afterKeys.includes(k));
    const addedKeys = afterKeys.filter((k) => !beforeKeys.includes(k));

    if (!canonicalized.changed) {
        return { uid, repaired: false, reason: "already canonical", beforeCount: beforeKeys.length, afterCount: afterKeys.length };
    }

    const patched = {
        ...progress,
        microSkills: canonicalized.microSkills,
        practicedSkills: mergePracticedSkills(progress.practicedSkills, afterKeys),
        lastUpdated: new Date().toISOString()
    };

    if (!dryRun) {
        await CosmosStore.upsertProgress(uid, "english", patched, false);
    }

    return {
        uid,
        repaired: true,
        dryRun,
        beforeCount: beforeKeys.length,
        afterCount: afterKeys.length,
        removedKeys,
        addedKeys
    };
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.uid && !args.all) {
        console.log("Usage:");
        console.log("  node scripts/repair_english_micro_skills.js --uid=<email_or_uid> [--dry-run]");
        console.log("  node scripts/repair_english_micro_skills.js --all [--dry-run]");
        process.exit(1);
    }

    const targets = args.uid ? [args.uid] : await listEnglishProgressUids();
    console.log(`[repair_english_micro_skills] targets=${targets.length}, dryRun=${args.dryRun}`);

    let repairedCount = 0;
    let unchangedCount = 0;
    let failedCount = 0;

    for (const uid of targets) {
        try {
            const report = await repairUid(uid, { dryRun: args.dryRun });
            if (report.repaired) {
                repairedCount += 1;
                console.log(`[REPAIRED] ${uid} (${report.beforeCount} -> ${report.afterCount})`);
                if (report.removedKeys?.length) {
                    console.log(`  removed: ${report.removedKeys.join(", ")}`);
                }
                if (report.addedKeys?.length) {
                    console.log(`  added: ${report.addedKeys.join(", ")}`);
                }
            } else {
                unchangedCount += 1;
                console.log(`[UNCHANGED] ${uid} (${report.reason})`);
            }
        } catch (error) {
            failedCount += 1;
            console.error(`[FAILED] ${uid}: ${error.message}`);
        }
    }

    console.log(`\nDone. repaired=${repairedCount}, unchanged=${unchangedCount}, failed=${failedCount}`);
}

main().catch((error) => {
    console.error("[repair_english_micro_skills] fatal:", error);
    process.exit(1);
});
