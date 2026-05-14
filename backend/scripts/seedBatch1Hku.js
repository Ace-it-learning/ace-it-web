/**
 * Seed Batch 1 HKU programme details (PREMIUM version with 8 sections) into Cosmos DB
 * Also seeds base programme metadata so API routes work correctly.
 * Run: node backend/scripts/seedBatch1Hku.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");
const batchData = require("./generated-programmes/batch1-hku-1-10-premium.json");

// Base programme metadata matching jupasPrograms.js structure
const PROGRAMME_METADATA = {
    "JS6107": { id: "hku-med", code: "JS6107", name: "內外全科醫學士", university: "香港大學", faculty: "醫學院", median: 36, band_a: 38, category: "medicine" },
    "JS6113": { id: "hku-dent", code: "JS6113", name: "牙醫學士", university: "香港大學", faculty: "牙醫學院", median: 35, band_a: 37, category: "medicine" },
    "JS6070": { id: "hku-law", code: "JS6070", name: "法學士", university: "香港大學", faculty: "法律學院", median: 32, band_a: 34, category: "law" },
    "JS6781": { id: "hku-gf", code: "JS6781", name: "環球金融學士", university: "香港大學", faculty: "商學院", median: 31, band_a: 33, category: "business" },
    "JS6227": { id: "hku-qfin", code: "JS6227", name: "計量金融學士", university: "香港大學", faculty: "商學院", median: 30, band_a: 32, category: "business" },
    "JS6411": { id: "hku-arch", code: "JS6411", name: "建築學士", university: "香港大學", faculty: "建築學院", median: 29, band_a: 31, category: "design" },
    "JS6767": { id: "hku-bba-acc", code: "JS6767", name: "工商管理學士(會計及財務)", university: "香港大學", faculty: "商學院", median: 28, band_a: 30, category: "business" },
    "JS6808": { id: "hku-bba-law", code: "JS6808", name: "工商管理學士及法學士", university: "香港大學", faculty: "商學院/法律學院", median: 33, band_a: 35, category: "law" },
    "JS6951": { id: "hku-eng-cs", code: "JS6951", name: "工程學士(計算機科學)", university: "香港大學", faculty: "工程學院", median: 27, band_a: 29, category: "engineering" },
    "JS6963": { id: "hku-eng-civil", code: "JS6963", name: "土木工程學士", university: "香港大學", faculty: "工程學院", median: 24, band_a: 26, category: "engineering" }
};

async function seed() {
    const programmes = batchData.programmes;
    const codes = Object.keys(programmes);

    console.log(`[Seed] ========================================`);
    console.log(`[Seed] PREMIUM Batch 1 Seeding`);
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
            const result = await JupasProgrammeService.upsertProgramme(meta);
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
                id: prog.id,
                name: prog.name,
                university: prog.university,
                en: prog.content.en,
                zh: prog.content.zh
            };

            const result = await JupasProgrammeService.upsertProgrammeDetails(detailsDoc);
            const sectionCount = Object.keys(prog.content.en.sections).length;
            console.log(`[Seed] ✓ Details ${code} (${prog.name}) -> ${result.id} [${sectionCount} sections]`);
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
