/**
 * Seed one test HKU programme into Cosmos DB
 * Run: node backend/scripts/seed_jupas_hku_test.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const JupasProgrammeService = require('../services/JupasProgrammeService');

const testProgramme = {
    code: 'JS6456',
    name: '內外全科醫學士',
    name_en: 'Bachelor of Medicine and Bachelor of Surgery',
    university: '香港大學',
    faculty: '醫學院',
    median: 36,
    band_a: 38,
    category: 'medicine'
};

async function seed() {
    try {
        console.log('[Seed] Adding test HKU programme:', testProgramme.code);
        const result = await JupasProgrammeService.seedProgramme(testProgramme);
        console.log('[Seed] Success:', result.id);
        
        // Verify by reading back
        const verify = await JupasProgrammeService.getProgrammeByCode('JS6456');
        console.log('[Seed] Verified:', verify ? 'FOUND' : 'NOT FOUND');
        if (verify) {
            console.log('[Seed] Programme:', JSON.stringify(verify, null, 2));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('[Seed] Failed:', error.message);
        process.exit(1);
    }
}

seed();
