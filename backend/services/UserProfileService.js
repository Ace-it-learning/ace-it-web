const admin = require('firebase-admin');
const { MICRO_SKILLS } = require('../constants/microSkills');
const { MATHS_MICRO_SKILLS } = require('../constants/mathsMicroSkills');
const { DSE_SCORING, accuracyToLevel, laplaceSmooth, calculateWeightedEnglishGrade, calculateWeightedMathGrade } = require('../constants/dseScoring');
const CacheService = require('./CacheService');

/**
 * Service to manage User Profiles in Firestore
 * Replacing the legacy db.json file storage.
 */
class UserProfileService {
    get db() {
        return admin.firestore();
    }

    /**
     * Deeply removes 'undefined' values from an object to prevent Firestore crashes.
     */
    cleanData(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        const result = { ...obj };
        Object.keys(result).forEach(key => {
            if (result[key] === undefined) {
                delete result[key];
            } else if (result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = this.cleanData(result[key]);
            }
        });
        return result;
    }

    get usersCollection() {
        return this.db.collection('users');
    }

    /**
     * Resolves a human-readable skill name from a technical ID.
     */
    getSkillName(id, subject = 'english') {
        if (!id) return null;
        const pool = subject === 'math' || subject === 'maths' ? MATHS_MICRO_SKILLS : MICRO_SKILLS;
        const skill = pool[id];
        if (skill) return skill.name;

        // Fallback: Clean up snake_case
        return id.replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Get a complete user profile including stats.
     * @param {string} uid 
     */
    async getProfile(uid) {
        if (!uid || uid === 'guest') return this.getGuestProfile();

        try {
            const cacheKey = `profile_${uid}`;
            const cached = CacheService.getDbCache(cacheKey);
            if (cached) return cached;

            const [userDoc, statsDoc] = await Promise.all([
                this.usersCollection.doc(uid).get(),
                this.usersCollection.doc(uid).collection('stats').doc('main').get()
            ]);

            if (!userDoc.exists) {
                console.log(`[UserProfileService] New user detected: ${uid}. Provisioning default profile...`);
                // Auto-provision a basic profile
                const defaultProfile = {
                    nickname: "Student",
                    role: 'student',
                    is_new_student: true,
                    status: 'active',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    equipped_tutor: 'default_janie',
                    equipped_student_avatar: 's_bookworm'
                };
                await this.usersCollection.doc(uid).set(defaultProfile);

                const stats = { xp: 0, level: 1, learningTime: 0 };
                await this.usersCollection.doc(uid).collection('stats').doc('main').set(stats);

                const result = { ...defaultProfile, ...stats, uid };
                CacheService.setDbCache(cacheKey, result);
                return result;
            }

            const userData = userDoc.data();
            const stats = statsDoc.exists ? statsDoc.data() : { xp: 0, level: 1, learningTime: 0 };

            const result = {
                ...userData,
                ...stats,
                uid,
                equipped_tutor: userData.equipped_tutor || 'default_janie',
                equipped_student_avatar: userData.equipped_student_avatar || 's_bookworm',
                equipped_frame: userData.equipped_frame || null
            };
            CacheService.setDbCache(cacheKey, result);
            return result;
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

        CacheService.invalidateUserDbCache(uid);

        const { nickname, grade, school, preferredLanguage, photoURL, email, displayName, subscription_tier } = data;

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
        if (subscription_tier) profileUpdate.subscription_tier = subscription_tier;
        if (displayName) profileUpdate.displayName = displayName;
        if (data.gender) profileUpdate.gender = data.gender;
        if (data.targetGradeEng) profileUpdate.targetGradeEng = data.targetGradeEng;
        if (data.targetGradeChi) profileUpdate.targetGradeChi = data.targetGradeChi;
        if (data.targetGradeMath) profileUpdate.targetGradeMath = data.targetGradeMath;
        if (data.dreamSubject) profileUpdate.dreamSubject = data.dreamSubject;
        if (data.electives) profileUpdate.electives = data.electives;

        // Handle student status flags
        if (data.is_new_student !== undefined) profileUpdate.is_new_student = data.is_new_student;
        if (data.status) profileUpdate.status = data.status;
        else if (data.is_new_student === false) profileUpdate.status = 'active';

        // --- SUBSCRIPTION & ANTI-ABUSE FIELDS ---
        // Initialize these if they don't exist
        const defaultTier = 'free';
        const defaultSubjects = ['english', 'maths'];

        // We use set with merge: true, but for arrays/objects we might want to be careful.
        // If the user already has a tier, don't overwrite it with 'free' unless explicitly requested.
        // For a new profile, these will be set.
        profileUpdate.subscription_tier = data.subscription_tier || defaultTier;
        profileUpdate.subscribed_subjects = data.subscribed_subjects || defaultSubjects;

        if (!data.active_devices) {
            profileUpdate.active_devices = []; // Array of {fingerprint, name, lastSeen}
        }

        if (!data.usage_stats) {
            profileUpdate.usage_stats = {
                month: new Date().toISOString().substring(0, 7), // YYYY-MM
                quests: {}, // { [questId]: { questions: number } }
                mock_exams: { count: 0, attempts: [] }
            };
        }

        // --- PARENTS OVERLOOK ---
        const userDoc = await this.usersCollection.doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        if (data.parent_email !== undefined) profileUpdate.parent_email = data.parent_email;
        if (data.parent_report_enabled !== undefined) profileUpdate.parent_report_enabled = data.parent_report_enabled;

        // Only set default if not already present in payload AND not already in DB
        if (!data.hasOwnProperty('parent_report_enabled') && userData.parent_report_enabled === undefined) {
            profileUpdate.parent_report_enabled = false;
        }

        // If creating new, add createdAt
        if (!userDoc.exists) {
            profileUpdate.createdAt = admin.firestore.FieldValue.serverTimestamp();
            profileUpdate.is_new_student = true;
            profileUpdate.status = 'active';
        }

        try {
            const cleanProfile = this.cleanData(profileUpdate);
            await this.usersCollection.doc(uid).set(cleanProfile, { merge: true });

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
     * Check if a user has remaining quota for mock exams.
     */
    async checkMockQuota(uid, paperId) {
        if (!uid || uid === 'guest') return { allowed: false, message: "Guest users cannot access mocks." };

        const profile = await this.getProfile(uid);
        const tier = (profile?.subscription_tier || 'free').toLowerCase();
        
        if (tier === 'premium') return { allowed: true };

        if (tier === 'pro') {
            const currentMonth = new Date().toISOString().substring(0, 7);
            const usage = profile.usage_stats || {};
            
            // Auto-reset if month changed
            if (usage.month !== currentMonth) {
                return { allowed: true, resetNeeded: true };
            }

            const mockExams = usage.mock_exams || { count: 0, attempts: [] };
            
            // Allow if already attempted this month
            if (mockExams.attempts && mockExams.attempts.includes(paperId)) {
                return { allowed: true };
            }

            if ((mockExams.count || 0) < 4) {
                return { allowed: true };
            }

            return { allowed: false, message: "Monthly quota of 4 mock exams reached. Upgrade to Premium for unlimited access!" };
        }

        // For Free tier: handled by paper index gating (1st paper free)
        return { allowed: true }; 
    }

    /**
     * Record a mock exam attempt to the user's quota.
     */
    async recordMockAttempt(uid, paperId) {
        if (!uid || uid === 'guest') return;

        const profile = await this.getProfile(uid);
        const tier = (profile?.subscription_tier || 'free').toLowerCase();
        
        if (tier !== 'pro') return;

        const currentMonth = new Date().toISOString().substring(0, 7);
        let usage = profile.usage_stats || {};
        
        CacheService.invalidateUserDbCache(uid);

        // Reset logic
        if (usage.month !== currentMonth) {
            usage = {
                month: currentMonth,
                quests: usage.quests || {},
                mock_exams: { count: 1, attempts: [paperId] }
            };
        } else {
            const mockExams = usage.mock_exams || { count: 0, attempts: [] };
            if (!mockExams.attempts.includes(paperId)) {
                mockExams.count = (mockExams.count || 0) + 1;
                mockExams.attempts.push(paperId || 'unknown');
                usage.mock_exams = mockExams;
            }
        }

        await this.usersCollection.doc(uid).update({ usage_stats: usage });
    }

    /**
     * Award XP to a user and record it.
     */
    async awardXP(uid, amount, source = 'Activity') {
        if (!uid || uid === 'guest') return 0;

        CacheService.invalidateUserDbCache(uid);

        try {
            const statsRef = this.usersCollection.doc(uid).collection('stats').doc('main');
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            await this.db.runTransaction(async (t) => {
                const statsDoc = await t.get(statsRef);
                let stats = statsDoc.exists ? statsDoc.data() : { xp: 0, level: 1, streakDays: 0, last_xp_date: null };

                // Handle Streak and Active Days (Sync with GamificationService)
                if (stats.last_xp_date !== today) {
                    if (stats.last_xp_date === yesterday) {
                        stats.streakDays = (stats.streakDays || 0) + 1;
                    } else {
                        stats.streakDays = 1;
                    }
                    stats.totalActiveDays = (stats.totalActiveDays || stats.streakDays || 0) + 1;
                    stats.last_xp_date = today;
                } else if (!stats.streakDays) {
                    stats.streakDays = 1;
                    if (!stats.totalActiveDays) stats.totalActiveDays = 1;
                }

                // Update XP
                stats.xp = (stats.xp || 0) + amount;
                stats.total_xp = (stats.total_xp || stats.xp || 0) + amount;
                stats.lastActivity = admin.firestore.FieldValue.serverTimestamp();
                stats.lastStudyDate = admin.firestore.FieldValue.serverTimestamp(); // For legacy compatibility

                t.set(statsRef, stats, { merge: true });
            });

            console.log(`[UserProfileService] Awarded ${amount} XP to ${uid} for ${source} (Streak: updated)`);

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
                term: mistakeData.question || 'Unknown Question',
                context: mistakeData.userAnswer || 'No Answer Provided',
                note: mistakeData.feedback || 'No Feedback Provided',
                // Keep original fields just in case
                ...mistakeData,
                type: 'mistake',
                reviewStatus: 'new',
                subject: mistakeData.subject || 'english', // Default to english
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
     * Fetch recent mistakes for a subject.
     */
    async getMistakes(uid, subject, limit = 5) {
        if (!uid || uid === 'guest') return [];
        try {
            const snapshot = await this.usersCollection.doc(uid)
                .collection('notebook')
                .where('type', '==', 'mistake')
                .where('subject', '==', subject)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.warn(`[UserProfileService] Failed to fetch mistakes for ${uid} (${subject}):`, err);
            return [];
        }
    }

    /**
     * Update Gamification Stats.
     */
    async updateStats(uid, updates) {
        if (!uid || uid === 'guest') return this.getGuestProfile();

        CacheService.invalidateUserDbCache(uid);

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
            const cacheKey = `skillmap_${subject}_${uid}`;
            const cached = CacheService.getDbCache(cacheKey);
            if (cached) return cached;

            const doc = await this.usersCollection.doc(uid).collection('progress').doc(subject).get();
            const result = doc.exists ? doc.data() : null;

            // --- PILLAR AGGREGATION FOR RADAR CHART (English Only) ---
            if (result && subject === 'english' && result.microSkills) {
                const skills = result.microSkills;
                const avg = (list) => {
                    const valid = list.map(s => skills[s]?.level || 0).filter(l => l > 0);
                    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 1;
                };

                // Speaking Pillars - Recalculated for Radar
                skills.speaking_delivery = { level: avg(['speaking_pronunciationClarity', 'speaking_intonation', 'speaking_paceRhythm', 'speaking_grammaticalAccuracy', 'speaking_delivery']) };
                skills.speaking_strategies = { level: avg(['speaking_turnTaking', 'speaking_activeListening', 'speaking_facilitation', 'speaking_strategies']) };
                skills.speaking_language = { level: avg(['speaking_spontaneity', 'speaking_confidence', 'speaking_vocabularyInSpeech', 'speaking_language']) };
                skills.speaking_organization = { level: avg(['speaking_logicalDevelopment', 'speaking_relevance', 'speaking_organisation', 'speaking_organization']) };

                // Writing Pillars - Recalculated for Radar
                skills.writing_content = { level: avg(['writing_relevance', 'writing_development', 'writing_originality', 'writing_content']) };
                skills.writing_language = { level: avg(['writing_vocabularyRange', 'writing_collocations', 'writing_idiomaticExpressions', 'writing_registerAppropriate', 'writing_wordChoicePrecision', 'writing_sentenceVariety', 'writing_advancedStructures', 'writing_grammaticalAccuracy', 'writing_punctuation', 'writing_language']) };
                skills.writing_organization = { level: avg(['writing_paragraphStructure', 'writing_transitions', 'writing_overallCoherence', 'writing_organization']) };

                // Listening Pillars (Part A is usually granular, Part B is Pillar)
                if (!skills.listening_part_a) skills.listening_part_a = { level: avg(['listening_mainIdea', 'listening_detailListening', 'listening_noteTaking', 'listening_prediction', 'listening_gist', 'listening_accentRecognition', 'listening_speedProcessing', 'listening_speakerAttitude', 'listening_ambiguityHandling', 'listening_part_a']) };
            }

            if (result) CacheService.setDbCache(cacheKey, result);
            return result;
        } catch (err) {
            console.warn(`[UserProfileService] Failed to fetch Skill Map for ${uid}:`, err);
            return null;
        }
    }

    /**
     * Get Math Skill Map (dedicated method for Math subject).
     */
    async getMathSkillMap(uid) {
        if (!uid || uid === 'guest') return null;
        try {
            const cacheKey = `mathskillmap_${uid}`;
            const cached = CacheService.getDbCache(cacheKey);
            if (cached) return cached;

            const doc = await this.usersCollection.doc(uid).collection('progress').doc('maths').get();
            if (!doc.exists) {
                // Return empty structure if no data yet
                const emptyStruct = {
                    subject: 'Mathematics',
                    level: 0,
                    xp: 0,
                    microSkills: {},
                    weaknessPriority: [],
                    last_paper_done: null,
                    last_updated: null
                };
                return emptyStruct;
            }
            const result = doc.data();
            CacheService.setDbCache(cacheKey, result);
            return result;
        } catch (err) {
            console.warn(`[UserProfileService] Failed to fetch Math Skill Map for ${uid}:`, err);
            return null;
        }
    }

    /**
     * Fetch historical skill snapshots for a subject.
     * @param {string} uid - User ID
     * @param {string} subject - 'english' | 'maths'
     * @param {number} limit - Max history records
     */
    async getSkillHistory(uid, subject, limit = 5) {
        if (!uid || uid === 'guest') return [];
        try {
            const histDoc = subject === 'maths' ? 'maths_history' : 'english_history';
            const snapshotsRef = this.usersCollection.doc(uid)
                .collection('progress').doc(histDoc)
                .collection('snapshots');

            const snapshot = await snapshotsRef
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            if (snapshot.empty) return [];
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.warn(`[UserProfileService] Failed to fetch skill history for ${uid} (${subject}):`, err);
            return [];
        }
    }

    /**
     * Get a condensed context for personalized greetings.
     */
    async getPersonalizedContext(uid, subject) {
        if (!uid || uid === 'guest') return null;
        try {
            const profile = await this.getProfile(uid);
            const skillMap = await this.getSkillMap(uid, subject === 'math' ? 'maths' : subject);
            const mistakes = await this.getMistakes(uid, subject, 2);

            const formatLevel = (lvl) => {
                const numericLvl = Math.round(lvl || 1);
                if (numericLvl === 6) return '5*';
                if (numericLvl === 7) return '5**';
                return numericLvl;
            };

            let topWeaknesses = [];
            if (skillMap && skillMap.microSkills) {
                topWeaknesses = Object.entries(skillMap.microSkills)
                    .map(([id, data]) => ({ id, ...data }))
                    .sort((a, b) => (a.level || 0) - (b.level || 0))
                    .slice(0, 3)
                    .map(s => {
                        const skillInfo = MICRO_SKILLS[s.id];
                        const name = skillInfo ? skillInfo.name : s.id.replace(/_/g, ' ');
                        return `${name} (Level ${formatLevel(s.level)})`;
                    });
            }

            const skippedPapers = profile?.diagnostic_results?.english ?
                ['reading', 'writing', 'listening', 'speaking'].filter(p => !profile.diagnostic_results.english.raw_results?.[p])
                : [];

            // FETCH WEEKLY QUEST STATUS
            const GamificationService = require('./GamificationService');
            const weeklyStatus = await GamificationService.getWeeklyQuestStatus(uid);

            // Calculate days remaining in the current week (Quest expires on Sunday night)
            const now = new Date();
            const daysToSunday = (7 - now.getDay()) % 7 || 7;
            const expirationDate = new Date(now);
            expirationDate.setDate(now.getDate() + daysToSunday);
            expirationDate.setHours(23, 59, 59, 999);

            // FETCH COMPLETED TOPICS
            const RoadmapService = require('./RoadmapService');
            const completedTopics = await RoadmapService.getCompletedTopics(uid, subject === 'math' ? 'maths' : subject);

            // RECOMMENDED NEXT STEPS
            let recommendedNextSteps = [];
            if (skillMap?.level >= 4 && skippedPapers.length > 0) {
                recommendedNextSteps.push(`Take a ${skippedPapers[0]} Mock Exam`);
            } else if (topWeaknesses.length > 0) {
                recommendedNextSteps.push(`Practice ${topWeaknesses[0].split(' (')[0]}`);
            }

            if (!weeklyStatus.completed) {
                recommendedNextSteps.push("Finish Weekly Challenge");
            }

            // Get Available Quests for the subject
            let availableQuests = [];
            const skills = subject === 'maths' || subject === 'math' ? MATHS_MICRO_SKILLS : MICRO_SKILLS;
            availableQuests = Object.values(skills)
                .filter(s => s.paper !== 'mock' && s.paper !== 'assessment') // Filter out full mocks
                .map(s => s.name);

            return {
                nickname: profile?.nickname || profile?.displayName || "Student",
                grade: profile?.grade || "F4",
                level: formatLevel(skillMap?.level),
                topWeaknesses,
                recentMistakes: mistakes.map(m => m.term).filter(Boolean),
                skippedPapers,
                completedTopics,
                recommendedNextSteps,
                weeklyQuest: {
                    weekId: weeklyStatus.weekId,
                    completed: weeklyStatus.completed,
                    daysRemaining: daysToSunday
                },
                availableQuests: availableQuests.slice(0, 30) // Limit to avoid token bloat
            };
        } catch (err) {
            console.error(`[UserProfileService] Error creating personalized context for ${uid}:`, err);
            return null;
        }
    }

    /**
     * High-Density Insight Formatter (Token Optimization)
     */
    formatInsightsForPrompt(pContext) {
        if (!pContext) return "No data available.";
        
        const parts = [
            `LVL:${pContext?.level || '?'}`,
            `W:${pContext?.topWeaknesses?.map(w => w.split(' (')[0]).join(',') || 'None'}`,
            `DONE:${pContext?.completedTopics?.length || 0}`,
            `WEEKLY:${pContext?.weeklyQuest?.completed ? 'DONE' : (pContext?.weeklyQuest?.daysRemaining ? pContext.weeklyQuest.daysRemaining + 'd' : '?')}`,
            `NEXT:${pContext?.recommendedNextSteps?.join(';') || 'None'}`,
            `QUESTS:${pContext?.availableQuests?.join(';') || 'None'}`
        ];
        
        return `[STUDENT_INSIGHTS] ${parts.filter(Boolean).join(' | ')}`;
    }

    /**
     * Update Math micro-skills after diagnostic, lab, or mock exam.
     * @param {string} uid - User ID
     * @param {Object} skillUpdates - { skillId: { level: 4.2, practiceCount: 1 }, ... }
     * @param {string} source - 'diagnostic' | 'lab' | 'mock'
     * @param {Object} metadata - { archetype, strengths, weaknesses }
     */
    async updateMathSkills(uid, skillUpdates, source = 'diagnostic', metadata = {}) {
        if (!uid || uid === 'guest') return;

        CacheService.invalidateUserDbCache(uid);

        try {
            const progressRef = this.usersCollection.doc(uid).collection('progress').doc('maths');
            const doc = await progressRef.get();

            const currentData = doc.exists ? doc.data() : {
                subject: 'Mathematics',
                level: 0,
                xp: 0,
                microSkills: {},
                weaknessPriority: [],
                last_paper_done: null
            };

            // Save metadata (archetype, strengths, weaknesses) if provided
            if (metadata.archetype) currentData.archetype = metadata.archetype;
            if (metadata.strengths) currentData.strengths = metadata.strengths;
            if (metadata.weaknesses) currentData.weaknesses = metadata.weaknesses;
            if (metadata.weekly_quest_plan) currentData.weekly_quest_plan = metadata.weekly_quest_plan;
            if (metadata.one_month_plan) currentData.one_month_plan = metadata.one_month_plan;

            // Merge new skill levels using HKEAA evidence-accumulation model.
            // The 70/30 weighted average is ONLY used for the Overall Subject Level (macro bar).
            // Micro-skills on the Ability Radar use strict evidence accumulation + difficulty caps.
            Object.entries(skillUpdates).forEach(([skillId, update]) => {
                const existing = currentData.microSkills[skillId] || {};

                // Accumulate raw evidence across all sessions
                const newTotalCorrect = (existing.totalCorrect || existing.correctCount || 0) + (update.correctCount || 0);
                const newTotalAttempts = (existing.totalAttempts || existing.practiceCount || 0) + (update.practiceCount || 1);

                // Calculate new candidate level from cumulative accuracy
                const cumulativeAccuracy = newTotalAttempts > 0 ? newTotalCorrect / newTotalAttempts : 0;
                const candidateLevel = accuracyToLevel(cumulativeAccuracy);

                // Diagnostic cap: micro-skills from diagnostic are already capped at Level 4.
                // For lab/mock updates arriving here, use the level as-is from the update.
                // The difficulty cap is applied in updateMicroSkillLevel for lab sessions.
                const newLevel = Math.max(existing.level || 1, Math.min(candidateLevel, update.level || candidateLevel));

                // Gate check: must have enough correct answers to qualify for this level
                const minCorrect = DSE_SCORING.MIN_CORRECT_FOR_LEVEL[newLevel] || 0;
                const finalLevel = newTotalCorrect >= minCorrect ? newLevel : (existing.level || update.level || 1);

                currentData.microSkills[skillId] = {
                    level: finalLevel,
                    totalCorrect: newTotalCorrect,
                    totalAttempts: newTotalAttempts,
                    accuracy: Math.round(cumulativeAccuracy * 100) / 100,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    practiceCount: newTotalAttempts,
                    source: update.source || 'lab'
                };

                // DATA HANDLING FAN-OUT: Map consolidated quest to granular abilities
                const updateValue = { ...currentData.microSkills[skillId], lastUpdated: admin.firestore.FieldValue.serverTimestamp() };

                // 1. Probability & Stats (Legacy)
                if (skillId === 'math_stat_prob') {
                    const subSkills = ['math_stat_probability', 'math_stat_counting', 'math_stat_measures'];
                    subSkills.forEach(subId => { currentData.microSkills[subId] = updateValue; });
                }

                // 2. Integrated Algebra (Propagate to sub-skills)
                if (skillId === 'math_int_algebra') {
                    const subSkills = ['math_alg_formulas', 'math_alg_quadratics', 'math_alg_functions', 'math_alg_polynomials', 'math_alg_indices_log', 'math_alg_sequences'];
                    subSkills.forEach(subId => {
                        const existing = currentData.microSkills[subId]?.level || 0;
                        if (existing < finalLevel) currentData.microSkills[subId] = updateValue;
                    });
                }

                // 3. Integrated Geometry (Propagate to sub-skills)
                if (skillId === 'math_int_geometry') {
                    const subSkills = ['math_geo_coord', 'math_geo_circle_eq', 'math_geo_properties_circle', 'math_geo_properties_rect', 'math_geo_mensuration'];
                    subSkills.forEach(subId => {
                        const existing = currentData.microSkills[subId]?.level || 0;
                        if (existing < finalLevel) currentData.microSkills[subId] = updateValue;
                    });
                }

                // 4. Integrated Trig (Propagate to sub-skills)
                if (skillId === 'math_int_trig' || skillId === 'math_trig_3d') {
                    const subSkills = ['math_trig_ratios', 'math_trig_applications', 'math_geo_trig_func', 'math_geo_mensuration'];
                    subSkills.forEach(subId => {
                        const existing = currentData.microSkills[subId]?.level || 0;
                        if (existing < finalLevel) currentData.microSkills[subId] = updateValue;
                    });
                }

                // 5. Integrated Data (Propagate to sub-skills)
                if (skillId === 'math_int_data') {
                    const subSkills = ['math_stat_measures', 'math_stat_probability', 'math_stat_counting'];
                    subSkills.forEach(subId => {
                        const existing = currentData.microSkills[subId]?.level || 0;
                        if (existing < finalLevel) currentData.microSkills[subId] = updateValue;
                    });
                }
            });

            // Recalculate overall level
            if (source.startsWith('diagnostic') && metadata.overall_level) {
                // If it's a diagnostic, the overall grade is the source of truth
                const levelStr = String(metadata.overall_level);
                // Convert DSE string (5**, 5*, 5, 4...) to numeric 0-7 for the progress bar if needed
                const levelMap = { '5**': 7, '5*': 6, '5': 5, '4': 4, '3': 3, '2': 2, '1': 1 };
                currentData.level = levelMap[levelStr] || parseFloat(levelStr) || 1;
            } else {
                // For non-diagnostic (labs/practice), use a weighted average across ALL DSE topics
                // to prevent single-skill success from inflating the overall grade.
                const allLevels = Object.values(currentData.microSkills).map(s => s.level || 0);

                // Assume there are at least 15-20 core topics in DSE Math
                // If we've only practiced a few, the "overall" grade should still be cautious
                const MIN_TOPICS = 15;
                const effectiveCount = Math.max(allLevels.length, MIN_TOPICS);
                const sum = allLevels.reduce((a, b) => a + b, 0);

                currentData.level = Math.round((sum / effectiveCount) * 100) / 100;
            }

            // Identify top 3 weaknesses
            const weakSkills = Object.entries(currentData.microSkills)
                .filter(([_, data]) => data.level < 3.5) // Below Level 4
                .sort((a, b) => a[1].level - b[1].level)
                .slice(0, 3)
                .map(([skillId, data]) => ({
                    skillId,
                    level: data.level,
                    recommendedAction: `Practice ${skillId.replace('math_', '').replace(/_/g, ' ')} with targeted exercises.`
                }));

            currentData.weaknessPriority = weakSkills;
            currentData.last_updated = admin.firestore.FieldValue.serverTimestamp();
            currentData.last_paper_done = source;

            // Maintain practicedSkills (consistent with English)
            // CRITICAL: ONLY add to practicedSkills if this is NOT a diagnostic session.
            // Diagnostics assess many skills at once, but we only want to show "Repeat Quest" 
            // in the Library if the user has actually performed a dedicated practice/mission.
            if (!source.startsWith('diagnostic')) {
                const practicedSkills = currentData.practicedSkills || [];
                Object.keys(skillUpdates).forEach(skillId => {
                    if (!practicedSkills.includes(skillId)) {
                        practicedSkills.push(skillId);
                    }
                });
                currentData.practicedSkills = Array.from(new Set(practicedSkills));
            }

            await progressRef.set(currentData, { merge: true });

            // Ensure main user document flags are set if this is a diagnostic
            if (source.startsWith('diagnostic')) {
                await this.usersCollection.doc(uid).update({
                    has_maths_diagnostic: true,
                    is_new_student: false,
                    status: 'active',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log(`[UserProfileService] Force updated main flags for ${uid} after Math diagnostic completion.`);
            }

            // Save snapshot to history
            await this.usersCollection.doc(uid).collection('progress').doc('maths_history').collection('snapshots').add({
                ...currentData,
                source,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`[UserProfileService] Updated Math skills for ${uid} from ${source}`);
            return currentData;
        } catch (error) {
            console.error(`[UserProfileService] Error updating Math skills for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Get skill history (last N snapshots) for any subject.
     */
    async getSkillHistory(uid, subject = 'english', limit = 5) {
        if (!uid || uid === 'guest') return [];
        try {
            const normalizedSubject = subject.toLowerCase();

            // Handle different history collection structures
            if (normalizedSubject === 'maths' || normalizedSubject === 'math') {
                return this.getMathSkillHistory(uid, limit);
            }

            // Default English/Other history structure
            const snapshot = await this.usersCollection.doc(uid)
                .collection('progress').doc(normalizedSubject)
                .collection('history')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.warn(`[UserProfileService] Failed to fetch ${subject} history for ${uid}:`, err.message);
            return [];
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
            console.log(`[UserProfileService] Attempting to save chat for UID: ${uid}, Agent: ${agentId}, Role: ${message.role}`);
            const cleanMessage = this.cleanData(message);

            // Ensure role is mapped correctly for Gemini compatibility
            const dbRole = (cleanMessage.role === 'assistant' || cleanMessage.role === 'model') ? 'model' : 'user';

            const docRef = await this.usersCollection.doc(uid).collection('chat_history').add({
                ...cleanMessage,
                role: dbRole,
                agentId,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[UserProfileService] ✅ Chat saved successfully with ID: ${docRef.id}`);
        } catch (error) {
            console.error(`[UserProfileService] ❌ Error saving chat for ${uid}:`, error);
            throw error; // Propagate to router
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
     * Get chat history for an agent.
     */
    async getChatHistory(uid, agentId) {
        if (!uid || uid === 'guest') return [];

        console.log(`[UserProfileService] Fetching history for UID: ${uid}, Agent: ${agentId}`);
        try {
            // NOTE: Sorting by timestamp requires a composite index in Firestore for the where clause.
            // If the index is missing, this query will throw an error.
            // We fetch and then sort manually if needed to avoid index errors in dev.
            const snapshot = await this.usersCollection.doc(uid).collection('chat_history')
                .where('agentId', '==', agentId)
                .get();

            console.log(`[UserProfileService] Found ${snapshot.size} history documents.`);

            const history = [];
            snapshot.docs.forEach(doc => {
                const d = doc.data();
                const ts = d.timestamp?.toDate() || new Date(0);

                // Legacy Fallback: combined document format { message, response }
                if (d.message && d.response) {
                    history.push({
                        role: 'user',
                        content: d.message,
                        timestamp: ts
                    });
                    // AI response timestamp set slightly later to preserve order
                    history.push({
                        role: 'model',
                        content: d.response,
                        timestamp: new Date(ts.getTime() + 100)
                    });
                }
                // Standard format: individual document per role { role, content }
                else if (d.role && (d.content !== undefined)) {
                    history.push({
                        role: (d.role === 'assistant' || d.role === 'model') ? 'model' : d.role,
                        content: d.content || "",
                        timestamp: ts
                    });
                }
            });

            console.log(`[UserProfileService] Total processed history length: ${history.length}`);
            // Filter and Sort in Memory to avoid Index requirements
            return history.sort((a, b) => a.timestamp - b.timestamp);
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

        CacheService.invalidateUserDbCache(uid);

        try {
            // 1. Mark onboarding as complete in main profile
            await this.usersCollection.doc(uid).update({
                is_new_student: false,
                diagnostic_completed: true,
                status: 'active',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // --- Evidence Seeding -----------------------------------------------
            // Mine per-question evidence from question_breakdown to seed totalCorrect/
            // totalAttempts. This lets MIN_CORRECT_FOR_LEVEL gates work correctly after
            // quests, and makes the Mastery Radar non-blank immediately post-diagnostic.
            const rawResults = result.raw_results || {};
            const questionEvidence = {}; // { skillId: { correct, total } }

            ['reading', 'writing', 'listening', 'speaking'].forEach(paper => {
                const paperResult = rawResults[paper];
                if (!paperResult?.question_breakdown) return;
                paperResult.question_breakdown.forEach(q => {
                    (q.skills || []).forEach(skillId => {
                        if (!questionEvidence[skillId]) {
                            questionEvidence[skillId] = { correct: 0, total: 0 };
                        }
                        questionEvidence[skillId].total++;
                        if (q.status === 'correct') {
                            questionEvidence[skillId].correct++;
                        }
                    });
                });
            });

            // Build normalised micro-skill objects with evidence counts
            const normalizedSkills = {};
            Object.entries(result.microSkills || {}).forEach(([skillId, assessment]) => {
                const evidence = questionEvidence[skillId] || { correct: 0, total: 0 };
                const aiLevel = typeof assessment === 'object' ? (assessment.level || 1) : (assessment || 1);
                // Cap diagnostic-seeded level at DIAGNOSTIC_MAX_LEVEL (4)
                const diagnosticLevel = Math.min(aiLevel, DSE_SCORING.DIAGNOSTIC_MAX_LEVEL);
                // Smooth accuracy only when we have real evidence
                const smoothedAccuracy = evidence.total > 0
                    ? Math.round(laplaceSmooth(evidence.correct, evidence.total) * 100) / 100
                    : null;

                normalizedSkills[skillId] = {
                    level: diagnosticLevel,
                    totalCorrect: evidence.correct,
                    totalAttempts: evidence.total,
                    accuracy: smoothedAccuracy,
                    confidence: typeof assessment === 'object' ? (assessment.confidence || null) : null,
                    evidence: typeof assessment === 'object' ? (assessment.evidence || null) : null,
                    source: 'diagnostic',
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                };
            });

            console.log(`[UserProfileService] Evidence-seeded ${Object.keys(normalizedSkills).length} micro-skills for ${uid} (tagged evidence for ${Object.keys(questionEvidence).length} skills)`);
            // --- End Evidence Seeding ---------------------------------------------

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
                microSkills: normalizedSkills, // Evidence-seeded micro-skills
                weaknessPriority: result.weaknessPriority || [],
                raw_results: rawResults, // Persist raw data for possible re-mapping
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
     * Update Micro-Skill level for a user (Subject Proficiency).
     * This updates the persistent Ability Radar chart data.
     * @param {string} uid - User ID
     * @param {string} subject - 'english' | 'maths'
     * @param {string} skillId - Technical ID (e.g., 'reading_inference')
     * @param {number} masteryScore - 0-100 (percentage)
     * @param {Object} sessionDetails - { type: 'Quest'|'Mock', difficulty: 1-7, ... }
     */
    async updateMicroSkillLevel(uid, subject, rawSkillId, masteryScore, sessionDetails = {}) {
        if (!uid || uid === 'guest') return;

        const skillId = this.normalizeSkillId(rawSkillId, subject);
        if (!skillId) return;

        const cacheKey = `skillmap_${subject}_${uid}`;
        CacheService.invalidateUserDbCache(uid);

        try {
            const progressRef = this.usersCollection.doc(uid).collection('progress').doc(subject);
            const doc = await progressRef.get();

            let data = {
                subject: subject === 'maths' ? 'Mathematics' : 'English',
                overall_level: 1,
                microSkills: {},
                practicedSkills: [],
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            };
            if (doc.exists) {
                data = doc.data();
            } else {
                console.log(`[UserProfileService] Creating initial progress document for ${uid} / ${subject}`);
            }

            const microSkills = data.microSkills || {};
            const existing = microSkills[skillId] || {};

            // Initialization: Create skill structure if missing
            const skillData = {
                level: typeof existing.level === 'number' ? existing.level : 1,
                totalAttempts: (existing.totalAttempts || 0),
                totalCorrect: (existing.totalCorrect || 0),
                history: existing.history || [] // Sliding window of recent results (0.0 - 1.0)
            };

            const practicedSkills = data.practicedSkills || [];
            if (!practicedSkills.includes(skillId)) {
                practicedSkills.push(skillId);
            }

            // 1. Calculate Session Result (1-7 scale for display)
            const sessionGrade = Math.round(accuracyToLevel(masteryScore / 100));
            const activityType = sessionDetails.type || 'Quest'; // 'Quest', 'Weekly', 'Mock'

            // 2. Update History (Max 10)
            const historyEntry = {
                grade: sessionGrade,
                type: activityType,
                date: new Date().toISOString()
            };

            skillData.history.push(historyEntry);
            if (skillData.history.length > 10) {
                skillData.history.shift(); // Remove oldest
            }

            // 3. Accumulate Global Stats
            const sessionCorrectRate = masteryScore / 100;
            const sessionTotal = sessionDetails.totalQuestions || 5;
            const sessionCorrect = Math.round(sessionCorrectRate * sessionTotal);
            skillData.totalAttempts += sessionTotal;
            skillData.totalCorrect += sessionCorrect;

            // 4. Calculate Window Accuracy (based on history grades)
            const avgGrade = skillData.history.reduce((a, b) => a + b.grade, 0) / skillData.history.length;
            const candidateLevel = Math.round(avgGrade);

            // 5. Apply Difficulty Cap
            const sessionDifficulty = sessionDetails.difficulty || 4;
            const skillRules = DSE_SCORING.SUBJECT_RULES[subject]?.[skillId] || {};

            // Writing and Speaking ignore difficulty caps (performance based)
            const isSkillBased = subject === 'english' && (skillId.startsWith('writing_') || skillId.startsWith('speaking_'));
            const useCap = isSkillBased ? false : (skillRules.useDifficultyCap ?? true);

            let cappedCandidateLevel = candidateLevel;
            if (useCap) {
                const difficultyCap = DSE_SCORING.DIFFICULTY_CAPS[sessionDifficulty] || 7;
                cappedCandidateLevel = Math.min(candidateLevel, difficultyCap);
            }

            // 6. Gate check & Redemption
            // We find the highest level that the student qualifies for based on totalCorrect,
            // up to the cappedCandidateLevel (which is their current potential).
            let qualifiedLevel = 1;
            for (let l = 1; l <= cappedCandidateLevel; l++) {
                const threshold = DSE_SCORING.MIN_CORRECT_FOR_LEVEL[l] || 0;
                if (skillData.totalCorrect >= threshold) {
                    qualifiedLevel = l;
                } else {
                    break;
                }
            }
            
            // Apply promotion. 
            // We allow promotion to the highest qualified level.
            // If they are performing poorly, history will eventually drag avgGrade down.
            skillData.level = Math.max(existing.level || 1, qualifiedLevel);
            
            // Special Case: If their window performance is significantly LOWER than their current level, 
            // we let the level drop to match the performance (demotion).
            if (candidateLevel < skillData.level) {
                skillData.level = candidateLevel;
            }

            skillData.accuracy = Math.round((avgGrade / 7) * 100) / 100;
            skillData.lastUpdated = admin.firestore.FieldValue.serverTimestamp();
            microSkills[skillId] = skillData;

            // 7. OVERALL LEVEL CALCULATION (HKEAA WEIGHTED)
            let overallLevel = data.overall_level || 1;

            if (subject === 'english') {
                const { MICRO_SKILLS } = require('../constants/microSkills');
                const paperAvgs = { reading: [], writing: [], listening: [], speaking: [] };

                // Group micro-skills by paper and calculate paper-wide averages
                Object.keys(microSkills).forEach(sid => {
                    const paper = MICRO_SKILLS[sid]?.paper;
                    if (paper && paperAvgs[paper]) {
                        paperAvgs[paper].push(microSkills[sid].level || 1);
                    }
                });

                const paperFinalLevels = {};
                Object.entries(paperAvgs).forEach(([paper, levels]) => {
                    // Normalize: if a paper has NO data, it is treated as Level 1
                    paperFinalLevels[paper] = levels.length > 0
                        ? (levels.reduce((a, b) => a + b, 0) / levels.length)
                        : 1;
                });

                overallLevel = calculateWeightedEnglishGrade(paperFinalLevels);
                console.log(`[UserProfileService] Recalculated English Grade: ${overallLevel} (R=${paperFinalLevels.reading.toFixed(1)}, W=${paperFinalLevels.writing.toFixed(1)}, L=${paperFinalLevels.listening.toFixed(1)}, S=${paperFinalLevels.speaking.toFixed(1)})`);
            } else if (subject === 'maths') {
                const strandAvgs = { algebra: [], geometry: [], data: [] };

                Object.keys(microSkills).forEach(sid => {
                    const skillConfig = MATHS_MICRO_SKILLS[sid];
                    if (skillConfig) {
                        const category = skillConfig.category?.toLowerCase();
                        if (category?.includes('algebra')) strandAvgs.algebra.push(microSkills[sid].level || 1);
                        else if (category?.includes('geometry')) strandAvgs.geometry.push(microSkills[sid].level || 1);
                        else if (category?.includes('data')) strandAvgs.data.push(microSkills[sid].level || 1);
                    }
                });

                const strandFinalLevels = {};
                Object.entries(strandAvgs).forEach(([strand, levels]) => {
                    strandFinalLevels[strand] = levels.length > 0
                        ? (levels.reduce((a, b) => a + b, 0) / levels.length)
                        : 1;
                });

                overallLevel = calculateWeightedMathGrade(strandFinalLevels);
                console.log(`[UserProfileService] Recalculated Maths Grade: ${overallLevel} (Algebra=${strandFinalLevels.algebra.toFixed(1)}, Geometry=${strandFinalLevels.geometry.toFixed(1)}, Data=${strandFinalLevels.data.toFixed(1)})`);
            }

            await progressRef.set({
                microSkills,
                overall_level: overallLevel,
                practicedSkills: Array.from(new Set(practicedSkills)),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`[UserProfileService] Skill ${skillId} updated. Window Avg Grade: ${avgGrade.toFixed(1)}. Current Level: ${skillData.level}`);

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
            const userRef = this.usersCollection.doc(uid);

            const deleteRecursive = async (ref) => {
                const subcollections = await ref.listCollections();
                for (const sub of subcollections) {
                    const snapshot = await sub.get();
                    if (snapshot.size > 0) {
                        const batch = this.db.batch();
                        for (const doc of snapshot.docs) {
                            await deleteRecursive(doc.ref);
                            batch.delete(doc.ref);
                        }
                        await batch.commit();
                    }
                }
            };

            await deleteRecursive(userRef);
            await userRef.delete();

            console.log(`[UserProfileService] User ${uid} wiped completely (including nested data).`);
            return { success: true };
        } catch (e) {
            console.error(`[UserProfileService] Reset failed for ${uid}:`, e);
            throw e;
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

    /**
     * Delete Math-specific progress and history.
     */
    async resetMathProgress(uid) {
        if (!uid || uid === 'guest') return;
        try {
            console.log(`[UserProfileService] Resetting Math Progress for ${uid}`);
            const mathProgressRef = this.usersCollection.doc(uid).collection('progress').doc('maths');
            const mathHistoryRef = this.usersCollection.doc(uid).collection('progress').doc('maths_history');

            // Delete math progress doc
            await mathProgressRef.delete();

            // Delete history snapshots
            const snapshots = await mathHistoryRef.collection('snapshots').get();
            if (!snapshots.empty) {
                const batch = this.db.batch();
                snapshots.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }

            console.log(`[UserProfileService] Math data for ${uid} wiped.`);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error resetting Math for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Get the dynamic persona prompt injection for an AI agent.
     */
    async getPersona(uid, agentId) {
        if (!uid || uid === 'guest') return { name: "Ace Sir", prompt: "" };

        const profile = await this.getProfile(uid);
        const equippedTutorId = profile.equipped_tutor;

        const cardPool = require('../data/card_pool.json');

        // Subject normalization mapping
        const subjectMap = {
            'english': ['english'],
            'math': ['maths', 'math'],
            'chinese': ['chinese'],
            'ace': ['general', 'ace']
        };

        const isSubjectMatch = (agentId, tutorCard) => {
            if (!tutorCard) return false;
            const targetSubjects = subjectMap[agentId] || [];
            return targetSubjects.includes(tutorCard.subject);
        };

        // Find tutor in pool
        let tutor = cardPool.tutor_cards.find(c => c.id === equippedTutorId);
        if (!tutor) tutor = cardPool.default_tutors.find(c => c.id === equippedTutorId);

        // Filter by subject compatibility
        if (tutor && !isSubjectMatch(agentId, tutor)) {
            tutor = null; // Ignore non-matching equipped skin
        }

        // Fallback to subject defaults if no match
        if (!tutor) {
            const defaultIdMap = {
                'english': 'default_janie',
                'math': 'default_matt',
                'chinese': 'default_chung',
                'ace': 'default_ace'
            };
            const defaultId = defaultIdMap[agentId] || 'default_ace';
            tutor = cardPool.default_tutors.find(c => c.id === defaultId) || cardPool.default_tutors[0];
        }

        const traits = tutor.traits || {
            intensity: "moderate",
            disposition: "kind",
            vibe: "friendly",
            philosophy: "learning-driven"
        };

        const personaPrompt = `
### YOUR PERSONA: ${tutor.name}
- **Intensity**: ${traits.intensity} (How pushy/demanding you are).
- **Disposition**: ${traits.disposition} (How kind/harsh your feedback is).
- **Vibe**: ${traits.vibe} (How friendly/serious your social interaction is).
- **Philosophy**: ${traits.philosophy} (Whether you focus on deep learning or high grades).

**ADHERE STRICTLY to these traits in every response.**
${tutor.tone ? `**TONE & MANNER**: ${tutor.tone}` : ''}
`;

        return {
            id: tutor.id,
            name: tutor.name,
            prompt: personaPrompt,
            greeting: tutor.greeting_style
        };
    }

    /**
     * Equip an item (tutor, avatar, or frame).
     */
    async equipItem(uid, itemId, slot) {
        console.log(`[UserProfileService] equipItem Attempt: uid=${uid}, itemId=${itemId}, slot=${slot}`);
        if (!uid || !itemId || !slot) throw new Error("Missing parameters");

        const validSlots = [
            'equipped_tutor',
            'equipped_tutor_english',
            'equipped_tutor_maths',
            'equipped_tutor_ace',
            'equipped_student_avatar',
            'equipped_frame'
        ];
        if (!validSlots.includes(slot)) throw new Error("Invalid equipment slot");

        CacheService.invalidateUserDbCache(uid);
        await this.usersCollection.doc(uid).set({
            [slot]: itemId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { success: true };
    }

    /**
     * Persist full Quest results for historical review.
     */
    async saveQuestResult(uid, resultData) {
        if (!uid || uid === 'guest') return null;
        try {
            const resultRef = this.usersCollection.doc(uid).collection('quest_results').doc();
            const resultId = resultRef.id;
            await resultRef.set({
                ...resultData,
                resultId,
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[UserProfileService] Quest result saved for ${uid}: ${resultId}`);
            return resultId;
        } catch (error) {
            console.error(`[UserProfileService] Error saving quest result for ${uid}:`, error);
            return null;
        }
    }

    /**
     * Retrieve a specific quest result.
     */
    async getQuestResult(uid, resultId) {
        if (!uid || uid === 'guest' || !resultId) return null;
        try {
            const doc = await this.usersCollection.doc(uid).collection('quest_results').doc(resultId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error(`[UserProfileService] Error fetching quest result ${resultId}:`, error);
            return null;
        }
    }

    /**
     * Cancel a user's subscription.
     * Marks the account as cancelled but preserves the expiry date for access.
     */
    async cancelSubscription(uid) {
        if (!uid || uid === 'guest') return;
        CacheService.invalidateUserDbCache(uid);

        await this.usersCollection.doc(uid).update({
            subscription_status: 'cancelled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    }

    /**
     * Delete a full user profile and all associated data.
     * Complies with data deletion regulations.
     */
    async deleteUserProfile(uid) {
        if (!uid || uid === 'guest') return;
        CacheService.invalidateUserDbCache(uid);

        const userRef = this.usersCollection.doc(uid);

        // List of sub-collections to delete
        const subCollections = [
            'stats', 'progress', 'timeline', 'notebook',
            'chat_history', 'inventory', 'quest_results'
        ];

        try {
            // Delete sub-collections recursively
            for (const collName of subCollections) {
                const subCollRef = userRef.collection(collName);
                const snapshot = await subCollRef.get();
                if (snapshot.empty) continue;

                const batch = this.db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }

            // Finally delete the main user document
            await userRef.delete();
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error deleting user profile for ${uid}:`, error);
            throw error;
        }
    }
    /**
     * Normalizes a skill ID or display name into a technical ID.
     */
    normalizeSkillId(id, subject = 'english') {
        if (!id) return null;
        
        const pool = subject === 'math' || subject === 'maths' ? MATHS_MICRO_SKILLS : MICRO_SKILLS;
        
        // 1. Direct Match
        if (pool[id]) return id;

        // 2. Case-Insensitive/Display Name Match
        const normalizedInput = id.toLowerCase().trim();
        const byName = Object.values(pool).find(s => s.name.toLowerCase() === normalizedInput);
        if (byName) return byName.id;

        // 3. Fuzzy/Shorthand Mappings for English
        if (subject === 'english') {
            const mappings = {
                'inference': 'reading_inference',
                'main idea': 'reading_mainIdea',
                'main idea identification': 'reading_mainIdea',
                'detail recognition': 'reading_detailRecognition',
                'literal comprehension': 'reading_literalComprehension',
                'sequencing': 'reading_sequencing',
                'synthesis': 'reading_synthesis',
                'fact vs opinion': 'reading_factVsOpinion',
                'author\'s purpose': 'reading_authorPurpose',
                'tone & attitude': 'reading_toneAttitude',
                'register & style': 'reading_registerStyle',
                'metaphorical language': 'reading_metaphoricalLanguage',
                'text organisation': 'reading_textOrganization',
                'skimming & scanning': 'reading_skimmingScanning',
                'paraphrasing': 'reading_paraphrasing',
                'cohesion & reference': 'reading_cohesionReference',
                // Lab/Quest Specific Tags
                'writing weekly': 'writing_organization',
                'listening weekly': 'listening_part_a',
                'reading weekly': 'reading_mainIdea',
                'listening part a': 'listening_part_a',
                'listening part b': 'listening_content',
                // Speaking Normalization
                'speaking_organisation': 'speaking_organization',
                'speaking_vocabularyInSpeech': 'speaking_language',
                'pronunciation': 'speaking_pronunciationClarity',
                'language': 'speaking_language',
                'ideas': 'speaking_logicalDevelopment',
                'strategies': 'speaking_strategies',
                'delivery': 'speaking_delivery',
                // Mock Specific Tags
                'content': 'writing_relevance',
                'writing_content': 'writing_relevance',
                'writing_language': 'writing_grammaticalAccuracy',
                'writing_organization': 'writing_paragraphStructure',
                'appropriacy': 'writing_registerAppropriate'
            };
            if (mappings[normalizedInput]) return mappings[normalizedInput];
            
            // Try prefix search (e.g. "inference" -> "reading_inference")
            const prefixMatch = Object.keys(pool).find(key => key.endsWith('_' + normalizedInput) || key.includes(normalizedInput.replace(/\s/g, '')));
            if (prefixMatch) return prefixMatch;
        }

        return id;
    }

    /**
     * Syncs Mock Exam results to the User Mastery Radar.
     * @param {string} uid - User ID
     * @param {string} subject - 'english' | 'maths'
     * @param {Object} assessment - Evaluation results from MockService
     */
    async syncMockResultsToMastery(uid, subject, assessment) {
        if (!uid || uid === 'guest' || !assessment) return;

        console.log(`[UserProfileService] Syncing Mock Results to Mastery for ${uid} (${subject})`);
        
        try {
            const skillScores = assessment.skillScores || {};
            const promises = Object.entries(skillScores).map(([skillName, data]) => {
                const skillId = this.normalizeSkillId(skillName, subject);
                if (!skillId) return Promise.resolve();

                const score = typeof data === 'number' ? data : (data.score || 0);
                const total = data.possible || (typeof data === 'number' ? 100 : 1);
                const masteryScore = Math.min(100, Math.max(0, Math.round((score / total) * 100)));

                return this.updateMicroSkillLevel(uid, subject, skillId, masteryScore, {
                    type: 'Mock',
                    difficulty: assessment.difficulty || 5,
                    totalQuestions: assessment.totalQuestions || 10
                });
            });

            await Promise.all(promises);
            console.log(`[UserProfileService] Successfully synced ${promises.length} skills from Mock.`);
        } catch (err) {
            console.error(`[UserProfileService] Failed to sync Mock results:`, err);
        }
    }

    /**
     * Compatibility wrapper for legacy saveSkillMap calls.
     * Maps bulk updates to individual updateMicroSkillLevel calls to maintain history/stats.
     */
    async saveSkillMap(uid, subject, mapData) {
        if (!uid || uid === 'guest' || !mapData) return;
        console.log(`[UserProfileService] saveSkillMap (compat) called for ${uid} / ${subject}`);
        
        try {
            const microSkills = mapData.microSkills || {};
            const promises = Object.entries(microSkills).map(([skillId, data]) => {
                // If the data already has history/stats, we might be restoring a backup.
                // But usually it's from assessAllSkills which only has level.
                const level = data.level || 1;
                const masteryScore = (level / 7) * 100;
                
                return this.updateMicroSkillLevel(uid, subject, skillId, masteryScore, {
                    type: 'Assessment',
                    difficulty: 4
                });
            });
            
            await Promise.all(promises);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] saveSkillMap failed:`, error);
            throw error;
        }
    }
}

module.exports = new UserProfileService();
