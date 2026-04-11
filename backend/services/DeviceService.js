const admin = require('firebase-admin');

class DeviceService {
    get db() {
        return admin.firestore();
    }

    get usersCollection() {
        return this.db.collection('users');
    }

    /**
     * Check if a device is allowed to access an account.
     * @param {string} uid 
     * @param {string} fingerprint 
     */
    async checkDeviceAccess(uid, fingerprint) {
        if (!uid || uid === 'guest') return { allowed: true };
        if (!fingerprint) return { allowed: false, error: 'No device fingerprint provided.' };

        const userDoc = await this.usersCollection.doc(uid).get();
        if (!userDoc.exists) return { allowed: false, error: 'User not found.' };

        const userData = userDoc.data();
        const activeDevices = userData.active_devices || [];
        const tier = userData.subscription_tier || 'free';

        // Check if device is already registered
        const isRegistered = activeDevices.some(d => d.fingerprint === fingerprint);
        if (isRegistered) {
            // Update last seen
            await this.updateLastSeen(uid, fingerprint);
            return { allowed: true };
        }

        // New device - check limits
        const limit = tier === 'premium' ? 5 : 3;
        if (activeDevices.length >= limit) {
            return { 
                allowed: false, 
                error: `Device limit reached (${limit} devices). Please remove a device from your account settings to register this one.`,
                limitReached: true
            };
        }

        return { allowed: true, isNew: true };
    }

    /**
     * Register a new device to an account.
     * @param {string} uid 
     * @param {string} fingerprint 
     * @param {Object} metadata 
     */
    async registerDevice(uid, fingerprint, metadata = {}) {
        if (!uid || uid === 'guest') return;

        const device = {
            fingerprint,
            name: metadata.name || 'Unknown Device',
            os: metadata.os || 'Unknown OS',
            browser: metadata.browser || 'Unknown Browser',
            lastSeen: admin.firestore.FieldValue.serverTimestamp(),
            addedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await this.usersCollection.doc(uid).update({
            active_devices: admin.firestore.FieldValue.arrayUnion(device)
        });

        console.log(`[DeviceService] Registered new device for ${uid}: ${device.name}`);
    }

    /**
     * Remove a device from an account.
     * @param {string} uid 
     * @param {string} fingerprint 
     */
    async forgetDevice(uid, fingerprint) {
        if (!uid || uid === 'guest') return;

        const userDoc = await this.usersCollection.doc(uid).get();
        if (!userDoc.exists) return;

        const userData = userDoc.data();
        const activeDevices = userData.active_devices || [];
        const updatedDevices = activeDevices.filter(d => d.fingerprint !== fingerprint);

        await this.usersCollection.doc(uid).update({
            active_devices: updatedDevices
        });

        console.log(`[DeviceService] Device forgotten for ${uid}: ${fingerprint}`);
    }

    /**
     * Update the last seen timestamp for a device.
     */
    async updateLastSeen(uid, fingerprint) {
        const userDoc = await this.usersCollection.doc(uid).get();
        if (!userDoc.exists) return;

        const activeDevices = userDoc.data().active_devices || [];
        const deviceIndex = activeDevices.findIndex(d => d.fingerprint === fingerprint);

        if (deviceIndex !== -1) {
            activeDevices[deviceIndex].lastSeen = admin.firestore.FieldValue.serverTimestamp();
            await this.usersCollection.doc(uid).update({ active_devices: activeDevices });
        }
    }
}

module.exports = new DeviceService();
