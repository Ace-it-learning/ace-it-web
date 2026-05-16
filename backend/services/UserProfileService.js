const { MICRO_SKILLS } = require('../constants/microSkills');
const { MATHS_MICRO_SKILLS } = require('../constants/mathsMicroSkills');
const { DSE_SCORING, accuracyToLevel, laplaceSmooth, calculateWeightedEnglishGrade, calculateWeightedMathGrade } = require('../constants/dseScoring');
const CacheService = require('./CacheService');
const { createRepositories } = require('../repositories');
const CosmosStore = require('./CosmosStore');

/**
 * Service to manage User Profiles in Firestore
 * Replacing the legacy db.json file storage.
 */
class UserProfileService {

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
        const { userRepo } = createRepositories();
        const cacheKey = `profile_${uid}`;
        const cached = CacheService.getDbCache(cacheKey);
        if (cached) return cached;

        const userData = await userRepo.getProfile(uid);
        const stats = await userRepo.getStats(uid) || { xp: 0, level: 1, learningTime: 0 };
        if (!userData) {
            const now = new Date().toISOString();
            const defaultProfile = {
                nickname: "Student",
                role: "student",
                is_new_student: true,
                status: "active",
                createdAt: now,
                updatedAt: now,
                equipped_tutor: "default_janie",
                equipped_student_avatar: "s_marcus",
                subscription_tier: "free",
                subscribed_subjects: ["english", "maths"]
            };
            await userRepo.upsertProfile(uid, defaultProfile);
            await userRepo.ensureStats(uid, { xp: 0, level: 1, learningTime: 0 });
            const result = { ...defaultProfile, xp: 0, level: 1, learningTime: 0, uid };
            CacheService.setDbCache(cacheKey, result);
            return result;
        }

        const result = {
            ...userData,
            ...stats,
            uid,
            equipped_tutor: userData.equipped_tutor || 'default_janie',
            equipped_student_avatar: userData.equipped_student_avatar || 's_marcus',
            equipped_frame: userData.equipped_frame || null
        };
        CacheService.setDbCache(cacheKey, result);
        return result;
    }

    /**
     * Create or update the core user profile (Onboarding).
     */
    async createOrUpdateProfile(uid, data) {
        if (!uid || uid === 'guest') return null;
        CacheService.invalidateUserDbCache(uid);
        const { userRepo } = createRepositories();
        const existing = await userRepo.getProfile(uid);
        const now = new Date().toISOString();
        const cleanInput = this.cleanData(data || {});
        const profilePatch = {
            ...cleanInput,
            updatedAt: now,
            subscription_tier: cleanInput.subscription_tier || existing?.subscription_tier || 'free',
            subscribed_subjects: cleanInput.subscribed_subjects || existing?.subscribed_subjects || ['english', 'maths'],
            parent_report_enabled: cleanInput.parent_report_enabled ?? existing?.parent_report_enabled ?? false
        };

        if (!existing) {
            profilePatch.createdAt = now;
            profilePatch.is_new_student = cleanInput.is_new_student ?? true;
            profilePatch.status = cleanInput.status || 'active';
            profilePatch.nickname = profilePatch.nickname || 'Student';
            profilePatch.role = profilePatch.role || 'student';
            profilePatch.equipped_tutor = profilePatch.equipped_tutor || 'default_janie';
            profilePatch.equipped_student_avatar = profilePatch.equipped_student_avatar || 's_marcus';
        }

        await userRepo.upsertProfile(uid, profilePatch);
        const stats = await userRepo.ensureStats(uid, {
            xp: existing ? 0 : 50,
            level: 1,
            learningTime: 0,
            streakDays: 0,
            lastStudyDate: now
        });

        return {
            ...(await userRepo.getProfile(uid)),
            ...(stats || {}),
            uid
        };
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

        await CosmosStore.updateUserProfile(uid, { usage_stats: usage });
    }

    /**
     * Award XP to a user and record it.
     */
    async awardXP(uid, amount, source = 'Activity') {
        if (!uid || uid === 'guest') return 0;

        CacheService.invalidateUserDbCache(uid);

        try {
            const nowIso = new Date().toISOString();
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            let stats = await CosmosStore.getUserStats(uid) || { xp: 0, level: 1, streakDays: 0, last_xp_date: null };
            if (stats.last_xp_date !== today) {
                if (stats.last_xp_date === yesterday) stats.streakDays = (stats.streakDays || 0) + 1;
                else stats.streakDays = 1;
                stats.totalActiveDays = (stats.totalActiveDays || stats.streakDays || 0) + 1;
                stats.last_xp_date = today;
            } else if (!stats.streakDays) {
                stats.streakDays = 1;
                if (!stats.totalActiveDays) stats.totalActiveDays = 1;
            }
            stats.xp = (stats.xp || 0) + amount;
            stats.total_xp = (stats.total_xp || stats.xp || 0) + amount;
            stats.lastActivity = nowIso;
            stats.lastStudyDate = nowIso;
            await CosmosStore.upsertUserStats(uid, stats, true);

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
            await CosmosStore.addNotebookItem(uid, {
                note: content,
                subject,
                practiceTopic,
                type: 'golden_nugget',
                source: 'AI Mentor',
                timestamp: new Date().toISOString()
            });
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
            await CosmosStore.addNotebookItem(uid, {
                term: mistakeData.question || 'Unknown Question',
                context: mistakeData.userAnswer || 'No Answer Provided',
                note: mistakeData.feedback || 'No Feedback Provided',
                // Keep original fields just in case
                ...mistakeData,
                type: 'mistake',
                reviewStatus: 'new',
                subject: mistakeData.subject || 'english', // Default to english
                source: mistakeData.source || 'Learning Lab',
                timestamp: new Date().toISOString()
            });
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
            const rows = await CosmosStore.listNotebook(uid, 500);
            return rows
                .filter((r) => r.type === 'mistake' && r.subject === subject)
                .sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0))
                .slice(0, limit)
                .map((r) => ({ id: r.id, ...r }));
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
        const updateData = { lastActivity: new Date().toISOString() };

        if (xp !== undefined) updateData.xp = xp;
        if (level !== undefined) updateData.level = level;
        if (learningTime !== undefined) updateData.learningTime = learningTime;

        try {
            await CosmosStore.upsertUserStats(uid, updateData, true);
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

            const result = await CosmosStore.getProgress(uid, subject);
            let normalizedResult = result;

            if (result && subject === 'english' && result.microSkills) {
                const canonicalized = this.canonicalizeEnglishMicroSkills(result.microSkills);
                if (canonicalized.changed) {
                    normalizedResult = {
                        ...result,
                        microSkills: canonicalized.microSkills,
                        practicedSkills: Array.from(new Set([
                            ...(Array.isArray(result.practicedSkills) ? result.practicedSkills : []),
                            ...Object.keys(canonicalized.microSkills)
                        ])),
                        lastUpdated: new Date().toISOString()
                    };
                    await CosmosStore.upsertProgress(uid, subject, normalizedResult, true);
                }
            }

            // --- PILLAR AGGREGATION FOR RADAR CHART (English Only) ---
            if (normalizedResult && subject === 'english' && normalizedResult.microSkills) {
                const skills = normalizedResult.microSkills;
                const avg = (list) => {
                    const valid = list.map(s => skills[s]?.level || 0).filter(l => l > 0);
                    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
                };

                // Speaking Pillars - Recalculated for Radar
                skills.speaking_delivery = { level: avg(['speaking_pronunciationClarity', 'speaking_intonation', 'speaking_paceRhythm', 'speaking_grammaticalAccuracy', 'speaking_delivery']) };
                skills.speaking_strategies = { level: avg(['speaking_turnTaking', 'speaking_activeListening', 'speaking_facilitation', 'speaking_strategies']) };
                skills.speaking_language = { level: avg(['speaking_spontaneity', 'speaking_confidence', 'speaking_vocabularyInSpeech', 'speaking_language']) };
                skills.speaking_organization = { level: avg(['speaking_logicalDevelopment', 'speaking_relevance', 'speaking_organisation', 'speaking_organization']) };

                // Writing Pillars - Recalculated for Radar
                // Only the 3 HKEAA pillars are shown on the radar. Granular skills
                // (e.g. writing_grammaticalAccuracy) are tracked internally but not displayed.
                skills.writing_content = { level: avg(['writing_relevance', 'writing_development', 'writing_originality', 'writing_content']) };
                skills.writing_language = { level: avg(['writing_vocabularyRange', 'writing_collocations', 'writing_idiomaticExpressions', 'writing_registerAppropriate', 'writing_wordChoicePrecision', 'writing_sentenceVariety', 'writing_advancedStructures', 'writing_grammaticalAccuracy', 'writing_punctuation', 'writing_language']) };
                skills.writing_organization = { level: avg(['writing_paragraphStructure', 'writing_transitions', 'writing_overallCoherence', 'writing_organization']) };

                // Remove granular writing skills from the radar-visible microSkills.
                // They remain in the DB for internal tracking but won't clutter the radar.
                const granularWritingSkills = [
                    'writing_relevance', 'writing_development', 'writing_originality',
                    'writing_vocabularyRange', 'writing_collocations', 'writing_idiomaticExpressions',
                    'writing_registerAppropriate', 'writing_wordChoicePrecision', 'writing_sentenceVariety',
                    'writing_advancedStructures', 'writing_grammaticalAccuracy', 'writing_punctuation',
                    'writing_paragraphStructure', 'writing_transitions', 'writing_overallCoherence',
                    'writing_general', 'writing_genre_debate', 'writing_genre_lte', 'writing_genre_exp',
                    'writing_genre_article', 'writing_genre_speech', 'writing_genre_proposal'
                ];
                for (const gid of granularWritingSkills) {
                    if (skills[gid] && !skills[gid]._preserve) {
                        delete skills[gid];
                    }
                }

                // Listening Pillars — compute from granular skills + any existing pillar data
                skills.listening_part_a = { level: avg(['listening_mainIdea', 'listening_detailListening', 'listening_noteTaking', 'listening_prediction', 'listening_gist', 'listening_accentRecognition', 'listening_speedProcessing', 'listening_speakerAttitude', 'listening_ambiguityHandling', 'listening_part_a']) };
                skills.listening_content = { level: avg(['listening_integratedTasks', 'listening_content']) };
                skills.listening_language = { level: avg(['listening_noteTaking', 'listening_language']) };
                skills.listening_organization = { level: avg(['listening_integratedTasks', 'listening_organization']) };

                // Remove granular skills from radar-visible output.
                // Only HKEAA pillar skills are displayed for Writing, Listening, Speaking.
                const granularSkillsToHide = [
                    // Writing granular
                    'writing_relevance', 'writing_development', 'writing_originality',
                    'writing_vocabularyRange', 'writing_collocations', 'writing_idiomaticExpressions',
                    'writing_registerAppropriate', 'writing_wordChoicePrecision', 'writing_sentenceVariety',
                    'writing_advancedStructures', 'writing_grammaticalAccuracy', 'writing_punctuation',
                    'writing_paragraphStructure', 'writing_transitions', 'writing_overallCoherence',
                    'writing_general', 'writing_genre_debate', 'writing_genre_lte', 'writing_genre_exp',
                    'writing_genre_article', 'writing_genre_speech', 'writing_genre_proposal',
                    // Listening granular
                    'listening_mainIdea', 'listening_detailListening', 'listening_noteTaking',
                    'listening_prediction', 'listening_gist', 'listening_accentRecognition',
                    'listening_speedProcessing', 'listening_speakerAttitude', 'listening_ambiguityHandling',
                    'listening_integratedTasks',
                    // Speaking granular
                    'speaking_pronunciationClarity', 'speaking_intonation', 'speaking_paceRhythm',
                    'speaking_grammaticalAccuracy', 'speaking_spontaneity', 'speaking_confidence',
                    'speaking_vocabularyInSpeech', 'speaking_turnTaking', 'speaking_activeListening',
                    'speaking_facilitation'
                ];
                for (const gid of granularSkillsToHide) {
                    if (skills[gid] && !skills[gid]._preserve) {
                        delete skills[gid];
                    }
                }
            }

            if (normalizedResult) CacheService.setDbCache(cacheKey, normalizedResult);
            return normalizedResult;
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

            const result = await CosmosStore.getProgress(uid, 'maths');
            if (!result) {
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
            const histSubject = subject === 'maths' ? 'maths_history' : 'english_history';
            const rows = await CosmosStore.listProgressSnapshots(uid, histSubject, limit);
            return rows.map((doc) => ({ id: doc.id, ...doc }));
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

            // FETCH WEEKLY QUEST STATUS + RECENT ACTIVITY (mock + quest summary)
            const GamificationService = require('./GamificationService');
            const [weeklyStatus, recentQuests, recentMock] = await Promise.all([
                GamificationService.getWeeklyQuestStatus(uid),
                GamificationService.getRecentQuestSummary(uid, 3).catch(() => []),
                this.getMockSummary(uid).catch(() => null)
            ]);

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
                .map(s => `${s.name}${s.name_zh ? ` / ${s.name_zh}` : ''}`);

            const subjectSkills = subject === 'maths' || subject === 'math'
                ? MATHS_MICRO_SKILLS
                : MICRO_SKILLS;
            const skillEntries = Object.entries(skillMap?.microSkills || {})
                .map(([skillId, data]) => {
                    const meta = subjectSkills[skillId] || {};
                    return {
                        skillId,
                        name: meta.name || this.getSkillName(skillId, subject),
                        level: Number(data?.level || 0),
                        attempts: Number(data?.totalAttempts || data?.practiceCount || 0),
                        accuracy: typeof data?.accuracy === 'number' ? Number(data.accuracy) : null,
                        lastUpdated: data?.lastUpdated || null
                    };
                })
                .filter((item) => item.level > 0);
            const weakestSkills = [...skillEntries].sort((a, b) => a.level - b.level).slice(0, 5);
            const strongestSkills = [...skillEntries].sort((a, b) => b.level - a.level).slice(0, 3);

            // Find unassessed / never-attempted skills from taxonomy
            const attemptedSkillIds = new Set(
                Object.entries(skillMap?.microSkills || {})
                    .filter(([_, data]) => (data?.level || 0) > 0)
                    .map(([skillId, _]) => skillId)
            );
            const unassessedSkills = Object.entries(subjectSkills)
                .filter(([skillId, meta]) => meta.paper !== 'mock' && meta.paper !== 'assessment' && !attemptedSkillIds.has(skillId))
                .map(([skillId, meta]) => ({
                    skillId,
                    name: meta.name || this.getSkillName(skillId, subject)
                }))
                .slice(0, 5);

            const leanRecentQuests = (recentQuests || []).slice(0, 5).map((q) => ({
                topic: q.topic || q.questName || q.module || "Quest",
                score: q.score ?? null,
                completedAt: q.completedAt || q.timestamp || null
            }));
            const leanRecentMock = recentMock
                ? {
                    paper: recentMock.paper || null,
                    topic: recentMock.topic || null,
                    score: recentMock.score ?? null,
                    total: recentMock.total ?? null,
                    percentage: recentMock.percentage ?? null,
                    level: recentMock.level || null,
                    topMistakes: Array.isArray(recentMock.topMistakes) ? recentMock.topMistakes.slice(0, 3) : [],
                    achievedSkills: Array.isArray(recentMock.achievedSkills) ? recentMock.achievedSkills.slice(0, 6) : []
                }
                : null;

            const tutorLeanContext = {
                profile: {
                    nickname: profile?.nickname || profile?.displayName || "Student",
                    grade: profile?.grade || "F4",
                    subject: subject === 'math' ? 'maths' : subject,
                    level: formatLevel(skillMap?.level),
                    hasDiagnostic: Boolean(skillMap && Object.keys(skillMap?.microSkills || {}).length > 0),
                    weeklyQuestCompleted: Boolean(weeklyStatus?.completed)
                },
                microSkills: {
                    weakest: weakestSkills,
                    strongest: strongestSkills,
                    unassessed: unassessedSkills,
                    coverage: skillEntries.length
                },
                outcomes: {
                    recentQuests: leanRecentQuests,
                    recentMock: leanRecentMock
                },
                plan: {
                    recommendedNextSteps: (recommendedNextSteps || []).slice(0, 4),
                    weekly: {
                        weekId: weeklyStatus?.weekId || null,
                        completed: Boolean(weeklyStatus?.completed),
                        daysRemaining: daysToSunday
                    },
                    dailyTasks: []
                },
                availableQuestTitles: availableQuests.slice(0, 15)
            };
            tutorLeanContext.plan.dailyTasks = this.buildDeterministicDailyTasks(tutorLeanContext);

            const predictedGrades = this.buildPredictedGradesSnapshot(profile);

            return {
                nickname: profile?.nickname || profile?.displayName || "Student",
                grade: profile?.grade || "F4",
                level: formatLevel(skillMap?.level),
                predictedGrades,
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
                availableQuests: availableQuests.slice(0, 30), // Limit to avoid token bloat
                recentQuests,
                recentMock,
                tutorLeanContext
            };
        } catch (err) {
            console.error(`[UserProfileService] Error creating personalized context for ${uid}:`, err);
            return null;
        }
    }

    /**
     * Snapshot of student-reported target DSE levels (onboarding / account).
     * Used by chat so tutors do not re-ask for grades already on file.
     */
    buildPredictedGradesSnapshot(profile) {
        if (!profile) return null;
        const t = profile.targets || {};
        const eng = String(profile.targetGradeEng || t.eng || '').trim();
        const chi = String(profile.targetGradeChi || t.chi || '').trim();
        const math = String(profile.targetGradeMath || t.math || '').trim();
        const rawElectives = Array.isArray(profile.electives) ? profile.electives : (Array.isArray(t.electives) ? t.electives : []);
        const electives = rawElectives
            .filter((e) => e && (String(e.subject || '').trim() || String(e.targetGrade || '').trim()))
            .map((e) => ({
                subject: String(e.subject || '').trim(),
                grade: String(e.targetGrade || '').trim()
            }));
        if (!eng && !chi && !math && electives.length === 0) return null;
        return { eng, chi, math, electives };
    }

    formatPredictedGradesForPrompt(pContext) {
        const snap = pContext?.predictedGrades;
        if (!snap) {
            return '[PREDICTED_DSE] (none on profile — student may fill target levels in Account)';
        }
        const bits = [];
        if (snap.chi) bits.push(`CHI:${snap.chi}`);
        if (snap.eng) bits.push(`ENG:${snap.eng}`);
        if (snap.math) bits.push(`MATH:${snap.math}`);
        (snap.electives || []).forEach((e) => {
            const label = e.subject || 'Elective';
            const g = e.grade || '?';
            bits.push(`${label}:${g}`);
        });
        if (!bits.length) {
            return '[PREDICTED_DSE] (none on profile — student may fill target levels in Account)';
        }
        return `[PREDICTED_DSE] ${bits.join(' | ')} | Tutor: use these as the student's self-reported targets; do not ask them to re-type saved subjects; ask only for gaps (e.g. missing elective or Citizenship/通識 if relevant — not stored in profile).`;
    }

    /**
     * Short block appended near the end of chat system prompts so the model
     * reliably sees account targets (not only the long insight JSON).
     */
    formatProfileAdmissionsBlock(user) {
        if (!user || user.uid === 'guest') return '';
        const snap = this.buildPredictedGradesSnapshot(user);
        const lines = [];
        lines.push(this.formatPredictedGradesForPrompt({ predictedGrades: snap }));
        const focus = String(user.dreamSubject || '').trim();
        if (focus) {
            lines.push(`[INTENDED_STUDY] ${focus}`);
        }
        const dreams = Array.isArray(user.dreamPrograms) ? user.dreamPrograms : [];
        if (dreams.length) {
            const labels = dreams
                .slice(0, 8)
                .map((p) => {
                    if (!p) return '';
                    if (typeof p === 'string') return p.trim();
                    return String(
                        p.programmeCode || p.code || p.jupasCode || p.label || p.title || p.name || ''
                    ).trim();
                })
                .filter(Boolean);
            if (labels.length) {
                lines.push(`[DREAM_JUPAS_PROGRAMMES] ${labels.join('; ')}`);
            }
        }
        if (snap || focus || dreams.length) {
            lines.push('CRITICAL: Do not ask the student to re-type grades or intended study already listed above. Ask only for gaps.');
        }
        return lines.join('\n');
    }

    /**
     * High-Density insight pack for chat: student skills, recent activity,
     * and lean JSON context. (Target DSE levels are appended separately in
     * chatRoutes via formatProfileAdmissionsBlock so they stay visible.)
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

        const insightsLine = `[STUDENT_INSIGHTS] ${parts.filter(Boolean).join(' | ')}`;

        // Compact recent activity - capped to keep prompt cheap
        const questsStr = (pContext?.recentQuests || [])
            .slice(0, 3)
            .map(q => q.score ? `${q.topic}:${q.score}` : q.topic)
            .join(',') || 'None';

        const m = pContext?.recentMock;
        let mockStr = 'None';
        if (m && (m.paper || m.topic)) {
            const label = m.paper || m.topic || 'Mock';
            const score = m.level
                || (typeof m.percentage === 'number' ? `${Math.round(m.percentage)}%` : null)
                || (m.score && m.total ? `${m.score}/${m.total}` : null);
            const top = Array.isArray(m.topMistakes) && m.topMistakes.length
                ? m.topMistakes.slice(0, 2).join(';')
                : null;
            const strengths = Array.isArray(m.achievedSkills) && m.achievedSkills.length
                ? m.achievedSkills.slice(0, 2).join(';')
                : null;
            mockStr = [label, score, top ? `weak:${top}` : null, strengths ? `strong:${strengths}` : null].filter(Boolean).join(':');
            mockStr = mockStr.slice(0, 80);
        }

        const activityLine = `[RECENT_ACTIVITY] QUESTS:${questsStr} | MOCK:${mockStr}`;
        const leanContext = this.buildLeanTutorPromptContext(pContext);
        const leanJson = JSON.stringify(leanContext);
        const leanLine = `[TUTOR_LEAN_CONTEXT] ${leanJson.length > 1800 ? `${leanJson.slice(0, 1800)}...` : leanJson}`;

        return `${insightsLine}\n${activityLine}\n${leanLine}`;
    }

    buildLeanTutorPromptContext(pContext) {
        const lean = pContext?.tutorLeanContext || {};
        return {
            profile: lean.profile || {
                nickname: pContext?.nickname || "Student",
                grade: pContext?.grade || "F4",
                level: pContext?.level || "?",
                hasDiagnostic: Boolean(pContext?.hasDiagnostic)
            },
            microSkills: lean.microSkills || {
                weakest: (pContext?.topWeaknesses || []).slice(0, 3).map((w) => ({ name: w })),
                strongest: [],
                unassessed: [],
                coverage: 0
            },
            outcomes: lean.outcomes || {
                recentQuests: (pContext?.recentQuests || []).slice(0, 3),
                recentMock: pContext?.recentMock || null
            },
            plan: lean.plan || {
                recommendedNextSteps: (pContext?.recommendedNextSteps || []).slice(0, 3),
                weekly: pContext?.weeklyQuest || null,
                dailyTasks: []
            },
            availableQuestTitles: (lean.availableQuestTitles || pContext?.availableQuests || []).slice(0, 15)
        };
    }

    buildDeterministicDailyTasks(leanContext = {}) {
        const weakest = leanContext?.microSkills?.weakest || [];
        const strongest = leanContext?.microSkills?.strongest || [];
        const unassessed = leanContext?.microSkills?.unassessed || [];
        const mock = leanContext?.outcomes?.recentMock || null;
        const questTitles = leanContext?.availableQuestTitles || [];
        const tasks = [];

        // Prioritize unassessed skills first, then weak skills
        if (unassessed.length > 0) {
            const target = unassessed[0];
            tasks.push(`Baseline unassessed micro-skill: ${target.name} (first practice to unlock your skill map).`);
        } else if (weakest.length > 0) {
            const target = weakest[0];
            tasks.push(`Target weak micro-skill: ${target.name} (20-30 mins focused practice).`);
        } else {
            tasks.push("Start one baseline Quest to calibrate your current weak areas.");
        }

        if (mock && (mock.topMistakes?.length || mock.topic || mock.paper)) {
            const weakness = (mock.topMistakes || []).slice(0, 2).join(", ");
            const strength = (mock.achievedSkills || []).slice(0, 1).join(", ");
            const source = mock.paper || mock.topic || "recent mock";
            tasks.push(weakness
                ? `Review ${source} mistakes: ${weakness}, then retry a similar question set.`
                : (strength
                    ? `Build on ${source} strength (${strength}) with one advanced timed checkpoint.`
                    : `Review your ${source} errors and retry one similar question set.`));
        } else if (questTitles.length > 0) {
            tasks.push(`Complete one structured Quest from your plan: ${questTitles[0]}.`);
        } else {
            tasks.push("Complete one practice Quest and record your top 2 mistakes.");
        }

        if (strongest.length > 0) {
            tasks.push(`Stretch goal: reinforce ${strongest[0].name} with one timed checkpoint task.`);
        } else {
            tasks.push("Finish with a 10-minute recap: summarize one rule and one mistake pattern.");
        }

        return tasks.slice(0, 3);
    }

    /**
     * Persist a small denormalized doc with the latest mock exam summary.
     * Read by `getMockSummary` to inject into the tutor prompt.
     * Failure is non-fatal: the assessment response must always succeed.
     */
    async saveMockSummary(uid, summary) {
        if (!uid || uid === 'guest' || !summary) return;
        try {
            const nowIso = new Date().toISOString();
            await CosmosStore.upsertProgress(uid, 'mock_summary', {
                paper: summary.paper || null,
                topic: summary.topic || null,
                score: typeof summary.score === 'number' ? summary.score : null,
                total: typeof summary.total === 'number' ? summary.total : null,
                percentage: typeof summary.percentage === 'number'
                    ? Math.round(summary.percentage * 10) / 10
                    : null,
                level: summary.level || null,
                topMistakes: Array.isArray(summary.topMistakes)
                    ? summary.topMistakes.slice(0, 3)
                    : [],
                achievedSkills: Array.isArray(summary.achievedSkills)
                    ? summary.achievedSkills.slice(0, 6)
                    : [],
                updatedAt: nowIso
            }, true);
            await this.recordTutorCompletionEvent(uid, {
                type: 'mock_completed',
                sourceId: summary.mockId || summary.paperId || `${summary.paper || 'mock'}_${nowIso}`,
                completedAt: summary.completedAt || nowIso,
                payload: {
                    paper: summary.paper || null,
                    topic: summary.topic || null,
                    score: typeof summary.score === 'number' ? summary.score : null,
                    total: typeof summary.total === 'number' ? summary.total : null,
                    percentage: typeof summary.percentage === 'number'
                        ? Math.round(summary.percentage * 10) / 10
                        : null,
                    level: summary.level || null,
                    topMistakes: Array.isArray(summary.topMistakes)
                        ? summary.topMistakes.slice(0, 3)
                        : [],
                    achievedSkills: Array.isArray(summary.achievedSkills)
                        ? summary.achievedSkills.slice(0, 6)
                        : []
                }
            });
            CacheService.invalidateUserDbCache(uid);
        } catch (e) {
            console.warn(`[UserProfileService] saveMockSummary failed for ${uid}:`, e.message);
        }
    }

    async getMockSummary(uid) {
        if (!uid || uid === 'guest') return null;
        try {
            return await CosmosStore.getProgress(uid, 'mock_summary');
        } catch (e) {
            console.warn(`[UserProfileService] getMockSummary failed for ${uid}:`, e.message);
            return null;
        }
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
            const existingProgress = await CosmosStore.getProgress(uid, 'maths');
            const currentData = existingProgress || {
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
                    lastUpdated: new Date().toISOString(),
                    practiceCount: newTotalAttempts,
                    source: update.source || 'lab'
                };

                // DATA HANDLING FAN-OUT: Map consolidated quest to granular abilities
                const updateValue = { ...currentData.microSkills[skillId], lastUpdated: new Date().toISOString() };

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
            currentData.last_updated = new Date().toISOString();
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

            await CosmosStore.upsertProgress(uid, 'maths', currentData, true);

            // Ensure main user document flags are set if this is a diagnostic
            if (source.startsWith('diagnostic')) {
                await CosmosStore.updateUserProfile(uid, {
                    has_maths_diagnostic: true,
                    is_new_student: false,
                    status: 'active',
                    updatedAt: new Date().toISOString()
                });
                console.log(`[UserProfileService] Force updated main flags for ${uid} after Math diagnostic completion.`);
            }

            // Save snapshot to history
            await CosmosStore.addProgressSnapshot(uid, 'maths_history', {
                ...currentData,
                source,
                timestamp: new Date().toISOString()
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
            const histSubject = (normalizedSubject === 'maths' || normalizedSubject === 'math')
                ? 'maths_history'
                : `${normalizedSubject}_history`;
            const rows = await CosmosStore.listProgressSnapshots(uid, histSubject, limit);
            return rows.map((doc) => ({ id: doc.id, ...doc }));
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
            const cleanMessage = this.cleanData(message);
            await CosmosStore.saveChatMessage(uid, agentId, cleanMessage);
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
            await CosmosStore.addTimelineEvent(uid, event);
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
        try {
            const rows = await CosmosStore.getChatHistory(uid, agentId);
            return rows.map((d) => ({
                role: (d.role === 'assistant' || d.role === 'model') ? 'model' : d.role,
                content: d.content || "",
                timestamp: d.createdAt || null
            })).sort((a, b) => {
                const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return ta - tb;
            });
        } catch (error) {
            console.error(`[UserProfileService] Error fetching chat history for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Clear chat history for a specific agent.
     */
    async clearChatHistory(uid, agentId) {
        if (!uid || uid === 'guest') return { success: false };

        try {
            await CosmosStore.clearChatHistory(uid, agentId);
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
            const items = await CosmosStore.listNotebook(uid, 500);
            return items
                .map((doc) => doc.payload || doc)
                .filter((item) => item?.subject === subject)
                .slice(0, limit)
                .map((item) => item.note)
                .filter((n) => !!n);
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
            const nowIso = new Date().toISOString();
            await CosmosStore.updateUserProfile(uid, {
                is_new_student: false,
                diagnostic_completed: true,
                status: 'active',
                updatedAt: nowIso
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
                    lastUpdated: nowIso
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
                lastUpdated: nowIso
            };

            // 2. Save result to skill map (progress)
            await CosmosStore.upsertProgress(uid, subject, progressData, true);

            // 2.1 NEW: Store Historical Snapshot for Mastery Radar Progress
            try {
                const histSubject = subject === 'maths' ? 'maths_history' : 'english_history';
                await CosmosStore.addProgressSnapshot(uid, histSubject, {
                    ...progressData,
                    timestamp: nowIso
                });
                console.log(`[UserProfileService] Saved mastery historical snapshot for ${uid}`);
            } catch (histErr) {
                console.error(`[UserProfileService] Historical snapshot failed for ${uid}:`, histErr);
            }

            // 3. Credit XP for completing diagnostic (NEW!)
            const xpToAward = xp_earned || 500; // Default to 500 if not specified
            const stats = await CosmosStore.getUserStats(uid) || {};
            const currentXP = stats.xp || 0;
            await CosmosStore.upsertUserStats(uid, {
                ...stats,
                xp: currentXP + xpToAward,
                level: stats.level || 1,
                learningTime: stats.learningTime || 0,
                streakDays: stats.streakDays || 0,
                lastActivity: nowIso,
                lastStudyDate: nowIso
            }, true);
            console.log(`[UserProfileService] Awarded ${xpToAward} XP to ${uid} for completing diagnostic. Total: ${currentXP + xpToAward}`);

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
            const existingProgress = await CosmosStore.getProgress(uid, subject);

            let data = {
                subject: subject === 'maths' ? 'Mathematics' : 'English',
                overall_level: 1,
                microSkills: {},
                practicedSkills: [],
                lastUpdated: new Date().toISOString()
            };
            if (existingProgress) {
                data = existingProgress;
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
            skillData.lastUpdated = new Date().toISOString();
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

            await CosmosStore.upsertProgress(uid, subject, {
                microSkills,
                overall_level: overallLevel,
                practicedSkills: Array.from(new Set(practicedSkills)),
                lastUpdated: new Date().toISOString()
            }, true);

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
            return await this.deleteUserProfile(uid);
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
            const rows = await CosmosStore.listTimeline(uid, 50);
            rows.forEach((data) => {
                timeline.push({
                    ...data,
                    date: data.date ? new Date(data.date) : new Date()
                });
            });

            // 2. Legacy Check / Hardcoded Milestones (Optional: Could migrate these to collection)
            // If timeline is empty, we might want to check the basic two as fallback
            if (timeline.length === 0) {
                const profileDoc = await CosmosStore.getUserProfileDoc(uid);
                if (profileDoc?.profile) {
                    const data = profileDoc.profile;
                    const date = data.createdAt ? new Date(data.createdAt) : (data.updatedAt ? new Date(data.updatedAt) : null);
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

                const diag = await CosmosStore.getProgress(uid, 'english');
                if (diag) {
                    if (diag.lastUpdated) {
                        timeline.push({
                            id: 'diagnostic',
                            type: 'exam',
                            title: 'Study Calibration (Diagnostic)',
                            date: new Date(diag.lastUpdated),
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
            await CosmosStore.clearProgress(uid, 'maths');
            await CosmosStore.clearProgressSnapshots(uid, 'maths_history');

            console.log(`[UserProfileService] Math data for ${uid} wiped.`);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error resetting Math for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Which equipped tutor card id applies for this chat agent (matches collection / profileRoutes).
     * @param {object} profile user profile fields from getProfile / Cosmos
     * @param {string} agentId chat agent (english, math, maths, ace, chinese, …)
     */
    resolveEquippedTutorIdForAgent(profile = {}, agentId = 'ace') {
        const aid = agentId === 'maths' ? 'math' : agentId;
        if (aid === 'english') {
            return profile.equipped_tutor_english || profile.equipped_tutor || 'default_janie';
        }
        if (aid === 'math') {
            return profile.equipped_tutor_maths || profile.equipped_tutor || 'default_matt';
        }
        if (aid === 'ace') {
            return profile.equipped_tutor_ace || profile.equipped_tutor || 'default_ace';
        }
        if (aid === 'chinese') {
            return profile.equipped_tutor;
        }
        return profile.equipped_tutor;
    }

    /**
     * Get the dynamic persona prompt injection for an AI agent.
     */
    async getPersona(uid, agentId) {
        if (!uid || uid === 'guest') return { name: "Ace Sir", prompt: "" };

        const profile = await this.getProfile(uid);
        const equippedTutorId = this.resolveEquippedTutorIdForAgent(profile, agentId);

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

        const styleExemplar = tutor.style_exemplar
            ? `\n**STYLE EXAMPLE (match rhythm and reply length; do not copy the topic verbatim):**\n${tutor.style_exemplar}\n`
            : '';

        const personaPrompt = `
### YOUR PERSONA: ${tutor.name}
- **Intensity**: ${traits.intensity} (How pushy/demanding you are).
- **Disposition**: ${traits.disposition} (How kind/harsh your feedback is).
- **Vibe**: ${traits.vibe} (How friendly/serious your social interaction is).
- **Philosophy**: ${traits.philosophy} (Whether you focus on deep learning or high grades).

**ADHERE STRICTLY to these traits in every response.**
${tutor.persona_guidelines ? `**BEHAVIORAL GUIDELINES**: ${tutor.persona_guidelines}` : ''}
${tutor.tone ? `**TONE & MANNER**: ${tutor.tone}` : ''}
${tutor.verbal_tics ? `**VERBAL TICS & PHRASES**: Use these phrases naturally where appropriate: ${tutor.verbal_tics.join(', ')}` : ''}
${styleExemplar}`;

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

        if (slot === 'equipped_student_avatar') {
            const cardPool = require('../data/card_pool.json');
            const validIds = new Set((cardPool.student_cards || []).map((c) => c.id));
            if (!validIds.has(itemId)) throw new Error('Unknown student avatar');
            const inv = await CosmosStore.listInventory(uid, 500);
            const owns = inv.some((doc) => doc.itemId === itemId);
            if (!owns) throw new Error('Student avatar not unlocked');
        }

        CacheService.invalidateUserDbCache(uid);
        await CosmosStore.updateUserProfile(uid, {
            [slot]: itemId,
            updatedAt: new Date().toISOString()
        });

        return { success: true };
    }

    /**
     * Persist full Quest results for historical review.
     */
    async saveQuestResult(uid, resultData) {
        if (!uid || uid === 'guest') return null;
        try {
            const completedAt = new Date().toISOString();
            const resultId = await CosmosStore.saveQuestResult(uid, {
                ...resultData,
                completedAt
            });
            if (!this.isMockLikeQuestResult(resultData)) {
                await this.recordTutorCompletionEvent(uid, {
                    type: 'quest_completed',
                    sourceId: resultId,
                    completedAt,
                    payload: {
                        resultId,
                        questId: resultData.quest_id || resultData.questId || null,
                        topic: resultData.topic || resultData.questName || resultData.module || resultData.textType || 'Quest',
                        score: resultData.score ?? resultData.masteryScore ?? resultData.overall_score ?? null,
                        xpAwarded: resultData.xpAwarded || resultData.xp_earned || resultData.xp || null,
                        module: resultData.module || resultData.paper || null,
                        feedback: resultData.feedback || null
                    }
                });
            }
            console.log(`[UserProfileService] Quest result saved for ${uid}: ${resultId}`);
            return resultId;
        } catch (error) {
            console.error(`[UserProfileService] Error saving quest result for ${uid}:`, error);
            return null;
        }
    }

    isMockLikeQuestResult(resultData = {}) {
        const type = String(resultData.type || resultData.paper || resultData.module || '').toLowerCase();
        const topic = String(resultData.topic || resultData.questName || '').toLowerCase();
        return Boolean(
            resultData.paperId ||
            resultData.mockId ||
            type.includes('mock') ||
            topic.includes('mock')
        );
    }

    async recordTutorCompletionEvent(uid, eventData = {}) {
        if (!uid || uid === 'guest') return null;
        try {
            return await CosmosStore.addTutorCompletionEvent(uid, eventData);
        } catch (error) {
            console.warn(`[UserProfileService] recordTutorCompletionEvent failed for ${uid}:`, error.message);
            return null;
        }
    }

    async getPendingTutorCompletionEvents(uid, limit = 10) {
        if (!uid || uid === 'guest') return [];
        try {
            return await CosmosStore.listPendingTutorCompletionEvents(uid, limit);
        } catch (error) {
            console.warn(`[UserProfileService] getPendingTutorCompletionEvents failed for ${uid}:`, error.message);
            return [];
        }
    }

    async markTutorCompletionEventsSummarized(uid, eventIds = []) {
        if (!uid || uid === 'guest') return { updated: [] };
        try {
            return await CosmosStore.markTutorCompletionEventsSummarized(uid, eventIds);
        } catch (error) {
            console.warn(`[UserProfileService] markTutorCompletionEventsSummarized failed for ${uid}:`, error.message);
            return { updated: [] };
        }
    }

    async saveLastChatChips(uid, agentId, chips = []) {
        if (!uid || uid === 'guest' || !agentId) return null;
        const normalized = Array.isArray(chips) ? chips.filter(Boolean).slice(0, 6) : [];
        try {
            await CosmosStore.upsertProgress(uid, `chat_chips_${agentId}`, {
                chips: normalized,
                updatedAt: new Date().toISOString()
            }, true);
            return normalized;
        } catch (error) {
            console.warn(`[UserProfileService] saveLastChatChips failed for ${uid}/${agentId}:`, error.message);
            return null;
        }
    }

    async getLastChatChips(uid, agentId) {
        if (!uid || uid === 'guest' || !agentId) return [];
        try {
            const doc = await CosmosStore.getProgress(uid, `chat_chips_${agentId}`);
            return Array.isArray(doc?.chips) ? doc.chips : [];
        } catch (error) {
            console.warn(`[UserProfileService] getLastChatChips failed for ${uid}/${agentId}:`, error.message);
            return [];
        }
    }

    async clearLastChatChips(uid, agentId) {
        if (!uid || uid === 'guest' || !agentId) return false;
        try {
            await CosmosStore.clearProgress(uid, `chat_chips_${agentId}`);
            return true;
        } catch (error) {
            console.warn(`[UserProfileService] clearLastChatChips failed for ${uid}/${agentId}:`, error.message);
            return false;
        }
    }

    /**
     * Retrieve a specific quest result.
     */
    async getQuestResult(uid, resultId) {
        if (!uid || uid === 'guest' || !resultId) return null;
        try {
            return await CosmosStore.getQuestResult(uid, resultId);
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

        await CosmosStore.updateUserProfile(uid, {
            subscription_status: 'cancelled',
            updatedAt: new Date().toISOString()
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

        try {
            await CosmosStore.purgeByPk('chat_messages', uid);
            await CosmosStore.purgeByPk('timeline_events', uid);
            await CosmosStore.purgeByPk('inventory_items', uid);
            await CosmosStore.purgeByPk('quest_results', uid);
            await CosmosStore.purgeByPk('notebook_items', uid);
            await CosmosStore.purgeByPk('progress_snapshots', uid);
            await CosmosStore.clearProgress(uid, 'english');
            await CosmosStore.clearProgress(uid, 'maths');
            await CosmosStore.clearProgress(uid, 'mock_summary');
            await CosmosStore.purgeByPk('user_stats', uid);
            await CosmosStore.purgeByPk('users', uid);
            return { success: true };
        } catch (error) {
            console.error(`[UserProfileService] Error deleting user profile for ${uid}:`, error);
            throw error;
        }
    }
    /**
     * Normalizes a skill ID or display name into a technical ID.
     */
    normalizeSkillId(id, subject = 'english', options = {}) {
        if (!id) return null;
        const allowRawFallback = options.allowRawFallback === true;
        
        const pool = subject === 'math' || subject === 'maths' ? MATHS_MICRO_SKILLS : MICRO_SKILLS;
        const directPoolKey = Object.keys(pool).find((key) => key.toLowerCase() === String(id).toLowerCase());
        
        // 1. Direct Match
        if (pool[id]) return id;
        if (directPoolKey) return directPoolKey;

        // 2. Case-Insensitive/Display Name Match
        const normalizedInput = String(id).toLowerCase().trim();
        const byName = Object.values(pool).find(s => s.name.toLowerCase() === normalizedInput);
        if (byName) return byName.id;

        // 2b. Mixed-language display names (e.g. "Inference / 推論能力")
        // Strip everything after " / " and try again
        const slashParts = normalizedInput.split(' / ');
        if (slashParts.length > 1) {
            const englishPart = slashParts[0].trim();
            const byEnglishPart = Object.values(pool).find(s => s.name.toLowerCase() === englishPart);
            if (byEnglishPart) return byEnglishPart.id;
            // Also try against Chinese name if available
            const chinesePart = slashParts.slice(1).join(' / ').trim();
            const byChinesePart = Object.values(pool).find(s => s.name_zh && s.name_zh.trim() === chinesePart);
            if (byChinesePart) return byChinesePart.id;
        }

        // 3. Fuzzy/Shorthand Mappings for English
        if (subject === 'english') {
            const mappings = {
                'inference': 'reading_inference',
                'main idea': 'reading_mainIdea',
                'main idea identification': 'reading_mainIdea',
                'detail recognition': 'reading_detailRecognition',
                'detail': 'reading_detailRecognition',
                'literal comprehension': 'reading_literalComprehension',
                'literal': 'reading_literalComprehension',
                'sequencing': 'reading_sequencing',
                'synthesis': 'reading_synthesis',
                'comparison': 'reading_synthesis',
                'summary': 'reading_synthesis',
                'extraction': 'reading_detailRecognition',
                'fact vs opinion': 'reading_factVsOpinion',
                'author\'s purpose': 'reading_authorPurpose',
                'tone & attitude': 'reading_toneAttitude',
                'tone': 'reading_toneAttitude',
                'register & style': 'reading_registerStyle',
                'metaphorical language': 'reading_metaphoricalLanguage',
                'text organisation': 'reading_textOrganization',
                'skimming & scanning': 'reading_skimmingScanning',
                'paraphrasing': 'reading_paraphrasing',
                'cohesion & reference': 'reading_cohesionReference',
                'reference': 'reading_cohesionReference',
                'vocabulary': 'reading_paraphrasing',
                // Lab/Quest Specific Tags
                'writing weekly': 'writing_paragraphStructure',
                'listening weekly': 'listening_detailListening',
                'reading weekly': 'reading_mainIdea',
                // Listening Quest labels — map to HKEAA pillars
                'listening part a': 'listening_part_a',
                'listening part b': 'listening_content',
                // Listening Mock Labels
                'listening accuracy': 'listening_detailListening',
                'content synthesis': 'listening_integratedTasks',
                'integrated language': 'listening_noteTaking',
                'logical organization': 'writing_paragraphStructure',
                'register & tone': 'writing_registerAppropriate',
                // Speaking Normalization — ONLY map generic words, NEVER remap pillar IDs
                'speaking_organisation': 'speaking_organization',
                'pronunciation': 'speaking_pronunciationClarity',
                'ideas': 'speaking_spontaneity',
                'strategies': 'speaking_strategies',
                'delivery': 'speaking_pronunciationClarity',
                'speaking_logicaldevelopment': 'speaking_organization',
                // Mock Specific Tags — ONLY map generic 'content'/'organization' strings,
                // NEVER remap the HKEAA pillar IDs (writing_content, writing_language, writing_organization)
                // which are valid skill IDs used by Writing Quest and the frontend radar.
                'content': 'writing_relevance',
                'organization': 'writing_paragraphStructure',
                'appropriacy': 'writing_registerAppropriate'
            };
            if (mappings[normalizedInput]) return mappings[normalizedInput];
            
            // Try prefix search (e.g. "inference" -> "reading_inference")
            const prefixMatch = Object.keys(pool).find(key => key.endsWith('_' + normalizedInput) || key.includes(normalizedInput.replace(/\s/g, '')));
            if (prefixMatch) return prefixMatch;
        }
        return allowRawFallback ? id : null;
    }

    canonicalizeEnglishMicroSkills(microSkills = {}) {
        const next = {};
        let changed = false;

        for (const [rawSkillId, rawValue] of Object.entries(microSkills || {})) {
            const canonicalId = this.normalizeSkillId(rawSkillId, 'english', { allowRawFallback: false });
            if (!canonicalId || !MICRO_SKILLS[canonicalId]) {
                changed = true;
                continue;
            }

            if (canonicalId !== rawSkillId) {
                changed = true;
            }

            const current = next[canonicalId] || {};
            const incoming = rawValue && typeof rawValue === 'object' ? rawValue : {};
            const existingLevel = Number(current.level || 0);
            const incomingLevel = Number(incoming.level || 0);

            const merged = {
                ...current,
                ...incoming,
                level: Math.max(existingLevel, incomingLevel),
                history: [
                    ...(Array.isArray(current.history) ? current.history : []),
                    ...(Array.isArray(incoming.history) ? incoming.history : [])
                ].slice(-12)
            };

            if (!Array.isArray(merged.history)) {
                merged.history = [];
            }

            if (!merged.lastPracticed && incoming.lastPracticed) {
                merged.lastPracticed = incoming.lastPracticed;
            }

            next[canonicalId] = merged;
        }

        const beforeCount = Object.keys(microSkills || {}).length;
        const afterCount = Object.keys(next).length;
        if (beforeCount !== afterCount) changed = true;

        return { changed, microSkills: next };
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
                const skillId = this.normalizeSkillId(skillName, subject, { allowRawFallback: false });
                if (!skillId) {
                    console.warn(`[UserProfileService] Skipping unmapped skill score "${skillName}" for ${uid}/${subject}`);
                    return Promise.resolve();
                }

                const score = typeof data === 'number' ? data : (data.score || 0);
                const total = (typeof data === 'number')
                    ? 100
                    : Number(data?.possible || 0);
                if (total <= 0) return Promise.resolve();
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
