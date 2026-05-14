/**
 * Seed Batch 1 CUHK programme details (PREMIUM version with 8 sections) into Cosmos DB
 * Also seeds base programme metadata so API routes work correctly.
 * Run: node backend/scripts/cuhk/seed-cuhk-batch1.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const JupasProgrammeService = require("../../services/JupasProgrammeService");
const batchData = require("./cuhk-batch1-details.json");
const programmesMeta = require("./cuhk-batch1-programmes.json");

// Build metadata lookup by code
const PROGRAMME_METADATA = {};
for (const prog of programmesMeta) {
    PROGRAMME_METADATA[prog.code] = prog;
}

async function seed() {
    const programmes = batchData.programmes;
    const codes = Object.keys(programmes);

    console.log(`[Seed] ========================================`);
    console.log(`[Seed] CUHK Batch 1 Seeding`);
    console.log(`[Seed] ${codes.length} programmes, 8 sections each`);
    console.log(`[Seed] Codes: ${codes.join(", ")}`);
    console.log(`[Seed] ========================================\n`);

    let metaSuccess = 0, metaFail = 0;
    let detailSuccess = 0, detailFail = 0;

    // Step 1: Seed base programme metadata
    console.log("[Seed] Step 1: Seeding base programme metadata...");
    for (const code of codes) {
        try {
            const meta = PROGRAMME_METADATA[code];
            if (!meta) {
                console.log(`[Seed] ⚠ No metadata found for ${code}, skipping`);
                metaFail++;
                continue;
            }
            // Ensure required fields
            const doc = {
                id: `prog_${code}`,
                pk: "programmes",
                type: "programme",
                ...meta,
                updatedAt: new Date().toISOString()
            };
            const result = await JupasProgrammeService.upsertProgramme(doc);
            console.log(`[Seed] ✓ Metadata ${code} -> ${result.id}`);
            metaSuccess++;
        } catch (error) {
            console.error(`[Seed] ✗ Metadata ${code} failed:`, error.message);
            metaFail++;
        }
    }

    // Step 2: Seed programme details
    console.log("\n[Seed] Step 2: Seeding premium programme details...");
    for (const code of codes) {
        try {
            const prog = programmes[code];
            const detailsDoc = {
                code: prog.code,
                university: prog.university,
                en: prog.en,
                zh: prog.zh
            };

            const result = await JupasProgrammeService.upsertProgrammeDetails(detailsDoc);
            const sectionCount = Object.keys(prog.en.sections).length;
            console.log(`[Seed] ✓ Details ${code} -> ${result.id} [${sectionCount} sections]`);
            detailSuccess++;
        } catch (error) {
            console.error(`[Seed] ✗ Details ${code} failed:`, error.message);
            detailFail++;
        }
    }

    console.log(`\n========================================`);
    console.log(`[Seed] COMPLETE`);
    console.log(`  Metadata:  ${metaSuccess} succeeded, ${metaFail} failed`);
    console.log(`  Details:   ${detailSuccess} succeeded, ${detailFail} failed`);
    console.log(`========================================`);

    process.exit(metaFail + detailFail > 0 ? 1 : 0);
}

seed();
