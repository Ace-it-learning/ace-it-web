#!/usr/bin/env node
/**
 * Self-service user wipe script
 * Usage: node wipe_user.js <email>
 * Example: node wipe_user.js fungtam@gmail.com
 */

const email = process.argv[2];

if (!email) {
    console.error('❌ Error: Please provide an email address');
    console.log('Usage: node wipe_user.js <email>');
    console.log('Example: node wipe_user.js fungtam@gmail.com');
    process.exit(1);
}

const API_URL = process.env.API_URL || 'http://localhost:3001';

async function wipeUser(email) {
    console.log(`🔥 Wiping all data for: ${email}...`);

    try {
        const response = await fetch(`${API_URL}/api/debug/complete-wipe/${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.success) {
            console.log('✅ Success:', data.message);
            console.log('\n📝 Next steps:');
            console.log('1. Clear browser storage (F12 → Application → Clear site data)');
            console.log('2. Or use an incognito window');
            console.log('3. Sign in again with a fresh account\n');
        } else {
            console.error('❌ Error:', data.error || 'Unknown error');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Failed to wipe user:', error.message);
        console.error('Make sure the backend server is running on', API_URL);
        process.exit(1);
    }
}

wipeUser(email);
