const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function log(msg) {
    fs.appendFileSync('deploy_rules_log.txt', msg + '\n');
    console.log(msg);
}

log('--- Starting Rules Deployment ---');

try {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    async function deployRules() {
        try {
            // Test with minimal valid rules
            const minimalRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

            log("Attempting to deploy MINIMAL rules...");

            const rulesFile = {
                name: 'firestore.rules',
                content: minimalRules
            };

            log("Creating Ruleset...");
            const ruleset = await admin.securityRules().createRuleset({
                source: {
                    files: [rulesFile]
                }
            });

            log(`Ruleset created: ${ruleset.name}`);
            log("Releasing...");
            await admin.securityRules().releaseFirestoreRuleset(ruleset.name);

            log("✅ Firestore Security Rules deployed successfully via Admin SDK!");
        } catch (error) {
            log("❌ Failed to deploy rules.");
            log("Error Message: " + error.message);
            if (error.code) log("Error Code: " + error.code);
            if (error.details) log("Details: " + JSON.stringify(error.details));
        }
    }

    deployRules();

} catch (e) {
    log("CRITICAL SCRIPT ERROR: " + e.message);
}
