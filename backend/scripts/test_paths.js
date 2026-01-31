console.log("Hello from test script");
const assert = require('assert');
console.log("Assert loaded");

try {
    const fs = require('fs');
    console.log("fs loaded");
    const path = require('path');
    console.log("path loaded");

    // Check paths
    console.log("__dirname:", __dirname);
    console.log("cwd:", process.cwd());

    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    console.log("Service Account Path:", serviceAccountPath);

    if (fs.existsSync(serviceAccountPath)) {
        console.log("Service key exists");
        try {
            const serviceKey = require(serviceAccountPath);
            console.log("Service key loaded successfully via require");
        } catch (reqErr) {
            console.error("Require serviceKey FAILED:", reqErr);
        }
    } else {
        console.log("Service key MISSING at " + serviceAccountPath);
    }

} catch (e) {
    console.error("Error:", e);
}
