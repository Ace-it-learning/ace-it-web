/**
 * Helper script to add a programme to the premium batch JSON file
 * Usage: node backend/scripts/addProgrammeToBatch.js <code> <json-file-path>
 */

const fs = require('fs');
const path = require('path');

const batchFile = path.join(__dirname, 'generated-programmes/batch1-hku-1-10-premium.json');
const data = JSON.parse(fs.readFileSync(batchFile, 'utf8'));

// Programme data to add - passed as command line or read from separate files
// For now, we'll add programmes one by one using this script structure

console.log('Current programmes:', Object.keys(data.programmes).join(', '));
console.log('Use this script to append new programme data.');
