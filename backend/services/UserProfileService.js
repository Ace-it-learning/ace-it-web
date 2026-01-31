const admin = require('firebase-admin');

/**
 * Service to manage User Profiles in Firestore
 * Replacing the legacy db.json file storage.
 */
class UserProfileService {
    get db() {
        return admin.firestore();
    }

    get usersCollection() {
        return this.db.collection('users');
    }

    /**
     * Get a complete user profile including stats.
     * @param {string} uid 
     */
    async getProfile(uid) {
        if (!uid || uid === 'guest') return this.getGuestProfile();

        try {
            const userDoc = await this.usersCollection.doc(uid).get();
            if (!userDoc.exists) return null;

            const userData = userDoc.data();

            // Fetch separate stats doc
            const statsDoc = await this.usersCollection.doc(uid).collection('stats').doc('main').get();
            const stats = statsDoc.exists ? statsDoc.data() : { xp: 0, level: 1, learningTime: 0 };

            return { ...userData, ...stats, uid };
        } catch (error) {
            console.error(`[UserProfileService] Error fetching profile for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Create or update the core user profile (Onboarding).
     */
    async createOrUpdateProfile(uid, data) {
        if (!uid || uid === 'guest') return null;

        const { nickname, grade, school, preferredLanguage, photoURL, email, displayName } = data;

        // Fields to update in the main document
        const profileUpdate = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Only set if provided (merge logic handled by Firestore set with merge: true)
        if (nickname) profileUpdate.nickname = nickname;
        if (grade) profileUpdate.grade = grade;
        if (school) profileUpdate.school = school;
        if (preferredLanguage) profileUpdate.preferredLanguage = preferredLanguage;
        if (photoURL) profileUpdate.photoURL = photoURL;
        if (email) profileUpdate.email = email;
        if (displayName) profileUpdate.displayName = displayName;
        if (data.gender) profileUpdate.gender = data.gender;
        if (data.targetGradeEng) profileUpdate.targetGradeEng = data.targetGradeEng;
        if (data.targetGradeChi) profileUpdate.targetGradeChi = data.targetGradeChi;
        if (data.targetGradeMath) profileUpdate.targetGradeMath = data.targetGradeMath;

        // If creating new, add createdAt
        // We'll use set with merge, so we check existence first or just simple valid check?
        // Firestore set(..., {merge: true}) is robust.

        try {
            await this.usersCollection.doc(uid).set(profileUpdate, { merge: true });

            // Ensure stats doc exists
            const statsRef = this.usersCollection.doc(uid).collection('stats').doc('main');
            const statsDoc = await statsRef.get();
            if (!statsDoc.exists) {
                // Award 50 XP for completing Onboarding
                await statsRef.set({
                    xp: 50, // Onboarding Bonus
                    level: 1,
                    learningTime: 0,
                    streakDays: 0,
                    lastStudyDate: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[UserProfileService] Awarded 50 XP to ${uid} for onboarding.`);

                // Record to timeline
                await this.recordTimelineEvent(uid, {
                    id: 'onboarding',
                    type: 'milestone',
                    title: 'Joined Ace It!',
                    xp: 50,
                    score: 'Welcome'
                });
            }

            return this.getProfile(uid);
        } catch (error) {
            console.error(`[UserProfileService] Error updating profile for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Award XP to a user and record it.
     */
    async awardXP(uid, amount, source = 'Activity') {
        if (!uid || uid === 'guest') return 0;
        try {
            const statsRef = this.usersCollection.doc(uid).collection('stats').doc('main');

            await statsRef.set({
                xp: admin.firestore.FieldValue.increment(amount),
                lastActivity: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`[UserProfileService] Awarded ${amount} XP to ${uid} for ${source}`);

            // Record timeline event
            await this.recordTimelineEvent(uid, {
                id: `xp_${Date.now()}`,
                type: 'practice',
                title: source,
                xp: amount,
                score: `+${amount} XP`
            });

            return amount;
        } catch (error) {
            console.error(`[UserProfileService] Error awarding XP to ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Save a Golden Nugget to the student's notebook.
     */
    async saveGoldenNugget(uid, subject, content, practiceTopic = null) {
        if (!uid || uid === 'guest') return;
        try {
            const nugget = {
                note: content,
                subject,
                practiceTopic,
                type: 'golden_nugget',
                source: 'AI Mentor',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            };
            await this.usersCollection.doc(uid).collection('notebook').add(nugget);
            console.log(`[UserProfileService] Golden Nugget saved for ${uid}: ${content.substring(0, 30)}...`);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error saving Golden Nugget for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Save a Mistake to the student's notebook.
     */
    async saveMistake(uid, mistakeData) {
        if (!uid || uid === 'guest') return;
        try {
            const entry = {
                term: mistakeData.question,
                context: mistakeData.userAnswer,
                note: mistakeData.feedback,
                // Keep original fields just in case
                ...mistakeData,
                type: 'mistake',
                reviewStatus: 'new',
                source: mistakeData.source || 'Learning Lab',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            };
            await this.usersCollection.doc(uid).collection('notebook').add(entry);
            console.log(`[UserProfileService] Mistake saved for ${uid}: ${mistakeData.question?.substring(0, 30)}...`);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error saving Mistake for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Update Gamification Stats.
     */
    async updateStats(uid, updates) {
        if (!uid || uid === 'guest') return this.getGuestProfile();

        const { xp, level, learningTime } = updates;
        const updateData = {
            lastActivity: admin.firestore.FieldValue.serverTimestamp()
        };

        if (xp !== undefined) updateData.xp = xp;
        if (level !== undefined) updateData.level = level;
        if (learningTime !== undefined) updateData.learningTime = learningTime;

        try {
            await this.usersCollection.doc(uid).collection('stats').doc('main').set(updateData, { merge: true });
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error updating stats for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Fetch Subject Skill Map (Progress).
     */
    async getSkillMap(uid, subject) {
        if (!uid || uid === 'guest') return null;
        try {
            const doc = await this.usersCollection.doc(uid).collection('progress').doc(subject).get();
            return doc.exists ? doc.data() : null;
        } catch (err) {
            console.warn(`[UserProfileService] Failed to fetch Skill Map for ${uid}:`, err);
            return null;
        }
    }

    getGuestProfile() {
        return {
            uid: 'guest',
            nickname: "Visitor",
            grade: "Unknown",
            xp: 0,
            level: 1,
            learningTime: 0,
            diagnostic_completed: false,
            role: 'guest'
        };
    }
    /**
     * Save a chat message to history.
     */
    async saveChatMessage(uid, agentId, message) {
        if (!uid || uid === 'guest') return;
        try {
            await this.usersCollection.doc(uid).collection('chat_history').add({
                ...message,
                agentId,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error(`[UserProfileService] Error saving chat for ${uid}:`, error);
        }
    }

    /**
     * Record an event in the user's timeline.
     */
    async recordTimelineEvent(uid, event) {
        if (!uid || uid === 'guest') return;
        try {
            await this.usersCollection.doc(uid).collection('timeline').add({
                ...event,
                date: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[UserProfileService] Timeline event recorded for ${uid}: ${event.title}`);
        } catch (error) {
            console.error(`[UserProfileService] Error recording timeline for ${uid}:`, error);
        }
    }

    /**
     * Get chat history for an agent (last 7 days).
     */
    async getChatHistory(uid, agentId) {
        if (!uid || uid === 'guest') return [];

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const snapshot = await this.usersCollection.doc(uid).collection('chat_history')
                .where('agentId', '==', agentId)
                .get();

            const history = snapshot.docs.map(doc => {
                const d = doc.data();
                return {
                    role: d.role,
                    content: d.content,
                    timestamp: d.timestamp?.toDate() || new Date(0)
                };
            });

            // Filter and Sort in Memory to avoid Index requirements
            return history
                .filter(m => m.timestamp >= sevenDaysAgo)
                .sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error(`[UserProfileService] Error fetching chat history for ${uid}:`, error);
            return [];
        }
    }

    /**
     * Clear chat history for a specific agent.
     */
    async clearChatHistory(uid, agentId) {
        if (!uid || uid === 'guest') return { success: false };

        try {
            const snapshot = await this.usersCollection.doc(uid).collection('chat_history')
                .where('agentId', '==', agentId)
                .get();

            if (snapshot.empty) return { success: true };

            const batch = this.db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log(`[UserProfileService] Cleared history for ${uid} / ${agentId}`);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error clearing history for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Get the student's "Golden Nuggets" (personalized advice) from their notebook.
     */
    async getGoldenNuggets(uid, subject, limit = 5) {
        if (!uid || uid === 'guest') return [];
        try {
            const snapshot = await this.usersCollection.doc(uid).collection('notebook')
                .where('subject', '==', subject)
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => doc.data().note).filter(n => !!n);
        } catch (error) {
            console.error(`[UserProfileService] Error fetching Golden Nuggets for ${uid}:`, error);
            return [];
        }
    }

    /**
     * Save the result of "The Gauntlet" diagnostic.
     */
    async saveDiagnosticResult(uid, subject, result) {
        if (!uid || uid === 'guest') return;
        const { archetype, roadmap, xp_earned } = result;

        try {
            // 1. Mark onboarding as complete in main profile
            await this.usersCollection.doc(uid).update({
                is_new_student: false,
                diagnostic_completed: true,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const progressData = {
                archetype,
                roadmap: result.weekly_quest_plan || result.one_month_plan || roadmap,
                strengths: result.strengths || [],
                weaknesses: result.weaknesses || [],
                weekly_quest_plan: result.weekly_quest_plan || [],
                one_month_plan: result.one_month_plan || [],
                critical_areas: result.critical_areas || [],
                overall_level: result.overall_level || 1,
                level: result.overall_level || 1, // Start at assessed level
                microSkills: result.microSkills || {}, // Persist 47 micro-skills
                weaknessPriority: result.weaknessPriority || [],
                raw_results: result.raw_results || {}, // Persist raw data for possible re-mapping
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            };

            // 2. Save result to skill map (progress)
            const progressRef = this.usersCollection.doc(uid).collection('progress').doc(subject);
            await progressRef.set(progressData, { merge: true });

            // 2.1 NEW: Store Historical Snapshot for Mastery Radar Progress
            try {
                await progressRef.collection('history').add({
                    ...progressData,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[UserProfileService] Saved mastery historical snapshot for ${uid}`);
            } catch (histErr) {
                console.error(`[UserProfileService] Historical snapshot failed for ${uid}:`, histErr);
            }

            // 3. Credit XP for completing diagnostic (NEW!)
            const xpToAward = xp_earned || 500; // Default to 500 if not specified
            const statsRef = this.usersCollection.doc(uid).collection('stats').doc('main');
            const statsDoc = await statsRef.get();

            if (statsDoc.exists) {
                const currentXP = statsDoc.data().xp || 0;
                await statsRef.update({
                    xp: admin.firestore.FieldValue.increment(xpToAward),
                    lastActivity: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[UserProfileService] Awarded ${xpToAward} XP to ${uid} for completing diagnostic. Total: ${currentXP + xpToAward}`);
            } else {
                // Create stats doc if it doesn't exist
                await statsRef.set({
                    xp: xpToAward,
                    level: 1,
                    learningTime: 0,
                    streakDays: 0,
                    lastStudyDate: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[UserProfileService] Created stats and awarded ${xpToAward} XP to ${uid} for completing diagnostic.`);
            }

            // Record to timeline
            await this.recordTimelineEvent(uid, {
                id: 'diagnostic',
                type: 'exam',
                title: 'Study Calibration (Diagnostic)',
                xp: xpToAward,
                score: `Level ${result.overall_level || 1}`
            });

            console.log(`[UserProfileService] Diagnostic result saved for ${uid} (${subject}): ${archetype}`);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error saving diagnostic result for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Incrementally update a specific micro-skill level.
     * Logic: A high mastery score (+80%) triggers a level increment (+1) until level 7.
     */
    async updateMicroSkillLevel(uid, subject, skillId, masteryScore) {
        if (!uid || uid === 'guest' || !skillId) return;
        try {
            const progressRef = this.db.collection('users').doc(uid).collection('progress').doc(subject);
            const doc = await progressRef.get();
            if (!doc.exists) return;

            const data = doc.data();
            const microSkills = data.microSkills || {};
            const skillData = microSkills[skillId] || { level: 1, confidence: 0.5 };
            const practicedSkills = data.practicedSkills || [];

            let updateNeeded = false;

            // Always mark as practiced if they finished a mission
            if (!practicedSkills.includes(skillId)) {
                practicedSkills.push(skillId);
                updateNeeded = true;
            }

            // Threshold for level up: Mastery Score >= 80%
            if (masteryScore >= 80 && skillData.level < 7) {
                skillData.level += 1;
                skillData.confidence = Math.min(1.0, (skillData.confidence || 0.5) + 0.1);
                microSkills[skillId] = skillData;
                updateNeeded = true;
            }

            if (updateNeeded) {
                await progressRef.update({
                    microSkills,
                    practicedSkills: Array.from(new Set(practicedSkills)),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
                if (masteryScore >= 80) {
                    console.log(`[UserProfileService] Level up for ${uid} skill ${skillId}: Now Level ${skillData.level}`);
                }
            }
        } catch (error) {
            console.error(`[UserProfileService] Error updating micro-skill for ${uid}:`, error);
        }
    }

    async getDiagnosticResult(uid, subject) {
        return this.getSkillMap(uid, subject);
    }

    /**
     * DEBUG: Reset User (Delete all data)
     */
    async resetUser(uid) {
        if (!uid || uid === 'guest') return;
        try {
            console.log(`[UserProfileService] RESETTING USER: ${uid}`);

            // 1. Delete Subcollections (Helper)
            const deleteCollection = async (collectionPath) => {
                const ref = this.usersCollection.doc(uid).collection(collectionPath);
                const snapshot = await ref.get();
                if (snapshot.size === 0) return;

                const batch = this.db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            };

            await deleteCollection('stats');
            await deleteCollection('progress');
            await deleteCollection('chat_history');
            await deleteCollection('notebook');
            await deleteCollection('roadmap');
            await deleteCollection('inventory');
            await deleteCollection('timeline');
            await deleteCollection('practice_history');

            // 2. Delete Main Doc
            await this.usersCollection.doc(uid).delete();

            console.log(`[UserProfileService] User ${uid} wiped.`);
            return { success: true };
        } catch (e) {
        }
    }

    /**
     * Generate a timeline of user activities.
     */
    async getTimeline(uid) {
        if (!uid || uid === 'guest') return [];

        try {
            const timeline = [];

            // 1. Fetch Dynamic Timeline Collection
            const snapshot = await this.usersCollection.doc(uid).collection('timeline')
                .orderBy('date', 'desc')
                .limit(50)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                timeline.push({
                    ...data,
                    date: data.date?.toDate() || new Date()
                });
            });

            // 2. Legacy Check / Hardcoded Milestones (Optional: Could migrate these to collection)
            // If timeline is empty, we might want to check the basic two as fallback
            if (timeline.length === 0) {
                const userDoc = await this.usersCollection.doc(uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    const date = data.createdAt?.toDate() || data.updatedAt?.toDate();
                    if (date) {
                        timeline.push({
                            id: 'onboarding',
                            type: 'milestone',
                            title: 'Joined Ace It!',
                            date: date,
                            xp: 50,
                            score: 'Welcome'
                        });
                    }
                }

                const diagDoc = await this.usersCollection.doc(uid).collection('progress').doc('english').get();
                if (diagDoc.exists) {
                    const diag = diagDoc.data();
                    if (diag.lastUpdated) {
                        timeline.push({
                            id: 'diagnostic',
                            type: 'exam',
                            title: 'Study Calibration (Diagnostic)',
                            date: diag.lastUpdated.toDate(),
                            xp: 500,
                            score: `Level ${diag.overall_level || 1}`
                        });
                    }
                }
            }

            // Sort by date descending
            return timeline.sort((a, b) => b.date - a.date);

        } catch (error) {
            console.error(`[UserProfileService] Error generating timeline for ${uid}:`, error);
            return [];
        }
    }
}

module.exports = new UserProfileService();
