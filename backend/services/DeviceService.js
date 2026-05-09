const UserProfileService = require('./UserProfileService');

class DeviceService {
    /**
     * Check if a device is allowed to access an account.
     * @param {string} uid 
     * @param {string} fingerprint 
     */
    async checkDeviceAccess(uid, fingerprint) {
        if (!uid || uid === 'guest') return { allowed: true };
        if (!fingerprint) return { allowed: false, error: 'No device fingerprint provided.' };

        const userData = await UserProfileService.getProfile(uid);
        if (!userData) return { allowed: false, error: 'User not found.' };
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

        try {
            const userData = await UserProfileService.getProfile(uid);
            let activeDevices = [];
            let tier = 'free';

            if (userData) {
                activeDevices = userData.active_devices || [];
                tier = userData.subscription_tier || 'free';

                if (!Array.isArray(activeDevices)) activeDevices = [];
            }

            const deviceName = metadata.name || 'Unknown Device';
            const deviceBrowser = metadata.browser || 'Unknown Browser';
            const deviceOS = metadata.os || 'Unknown OS';

            // RANKING: Chrome/Edge/Firefox (10) > Safari/Other (1)
            // This prevents automated Safari ghosts from hijacking a real user's Chrome session.
            const getRank = (b) => /chrome|edge|firefox/i.test(b) ? 10 : 1;
            const incomingRank = getRank(deviceBrowser);

            // 1. DEDUPLICATION & CLEANUP
            // Merge sessions that share the same fingerprint
            const filteredDevices = [];
            const seenFingerprints = new Set();
            
            // We process from newest to oldest to keep the most recent info
            const sortedDevices = [...activeDevices].sort((a, b) => {
                const dateA = a.lastSeen?.toDate ? a.lastSeen.toDate() : new Date(a.lastSeen || 0);
                const dateB = b.lastSeen?.toDate ? b.lastSeen.toDate() : new Date(b.lastSeen || 0);
                return dateB - dateA;
            });

            for (const d of sortedDevices) {
                if (!d.fingerprint) continue; // Skip malformed
                
                if (!seenFingerprints.has(d.fingerprint)) {
                    seenFingerprints.add(d.fingerprint);
                    filteredDevices.push(d);
                }
            }
            
            // SPECIAL CLEANUP: If we STILL have more than 3 identical names, merge them (they are likely ghosts)
            const cleanedDevices = [];
            const nameCounts = {};
            for (const d of filteredDevices) {
                const key = `${d.browser}-${d.os}`;
                nameCounts[key] = (nameCounts[key] || 0) + 1;
                
                // If we see too many "identical" entries, we merge them into the most recent one
                if (nameCounts[key] <= 3 || d.fingerprint === fingerprint) {
                    cleanedDevices.push(d);
                }
            }

            activeDevices = cleanedDevices;

            // 2. REGISTRATION / UPDATE
            const existingIndex = activeDevices.findIndex(d => d.fingerprint === fingerprint);

            if (existingIndex !== -1) {
                // Update existing: STRICT PRIORITY LOGIC
                const existing = activeDevices[existingIndex];
                const existingRank = getRank(existing.browser);

                if (incomingRank >= existingRank) {
                    // Upgrade or Maintain High Quality info
                    activeDevices[existingIndex] = {
                        ...existing,
                        lastSeen: new Date(),
                        browser: deviceBrowser,
                        os: deviceOS,
                        name: deviceName
                    };
                    console.log(`[DeviceService] Applied metadata for ${uid} (Rank ${incomingRank})`);
                } else {
                    // IGNORE LOW QUALITY OVERWRITE: Only update timestamp
                    activeDevices[existingIndex] = {
                        ...existing,
                        lastSeen: new Date()
                    };
                    console.log(`[DeviceService] Ignored lower-rank metadata for ${uid} (Incoming: ${incomingRank}, Existing: ${existingRank})`);
                }
            } else {
                // New device
                const limit = tier === 'premium' ? 5 : 3;
                if (activeDevices.length >= limit) {
                    console.warn(`[DeviceService] Limit reached for ${uid}: ${activeDevices.length}/${limit}`);
                    // We'll still allow the update of the list (cleanup) but won't add the new one
                    // OR we could drop the oldest one? Standard says "Blocked".
                } else {
                    activeDevices.push({
                        fingerprint,
                        name: deviceName,
                        os: deviceOS,
                        browser: deviceBrowser,
                        lastSeen: new Date(),
                        addedAt: new Date()
                    });
                    console.log(`[DeviceService] Registered new device for ${uid}: ${deviceName}`);
                }
            }

            // Save
            await UserProfileService.createOrUpdateProfile(uid, {
                active_devices: activeDevices
            });

        } catch (error) {
            console.error(`[DeviceService] ERROR in registerDevice:`, error);
        }
    }

    /**
     * Remove a device from an account.
     * @param {string} uid 
     * @param {string} fingerprint 
     */
    async forgetDevice(uid, fingerprint) {
        if (!uid || uid === 'guest') return;

        const userData = await UserProfileService.getProfile(uid);
        if (!userData) return;
        const activeDevices = userData.active_devices || [];
        const updatedDevices = activeDevices.filter(d => d.fingerprint !== fingerprint);

        await UserProfileService.createOrUpdateProfile(uid, {
            active_devices: updatedDevices
        });

        console.log(`[DeviceService] Device forgotten for ${uid}: ${fingerprint}`);
    }

    /**
     * Update the last seen timestamp for a device.
     */
    async updateLastSeen(uid, fingerprint) {
        const userData = await UserProfileService.getProfile(uid);
        if (!userData) return;
        const activeDevices = userData.active_devices || [];
        const deviceIndex = activeDevices.findIndex(d => d.fingerprint === fingerprint);

        if (deviceIndex !== -1) {
            activeDevices[deviceIndex].lastSeen = new Date();
            await UserProfileService.createOrUpdateProfile(uid, { active_devices: activeDevices });
        }
    }
}

module.exports = new DeviceService();
