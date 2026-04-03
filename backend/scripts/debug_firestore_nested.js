const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const fs = require('fs');
const contentPath = path.join(__dirname, '..', 'data', 'math_content', 'math_geo_coord.json');
const fileContent = fs.readFileSync(contentPath, 'utf8');
const data = JSON.parse(fileContent);

function findNestedArrays(obj, path = '') {
    if (Array.isArray(obj)) {
        if (obj.length > 0 && Array.isArray(obj[0])) {
            console.log(`[Nested Array Found] at path: ${path}`, obj);
        }
        obj.forEach((item, index) => findNestedArrays(item, `${path}[${index}]`));
    } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach(key => findNestedArrays(obj[key], `${path}.${key}`));
    }
}

console.log("Checking for nested arrays (Firestore unsupported)...");
findNestedArrays(data, 'root');
console.log("Check complete.");
