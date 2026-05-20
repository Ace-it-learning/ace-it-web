const UserProfileService = require('./UserProfileService');
const EmailService = require('./EmailService');
const GamificationService = require('./GamificationService');
const moment = require('moment');
const CosmosStore = require('./CosmosStore');

class ParentReportService {
    /**
     * Generate and send a weekly report for a specific user.
     * @param {string} uid User ID
     * @param {string} parentEmail Primary recipient (parent)
     * @param {string|null} selfEmail Optional secondary recipient (student copy)
     */
    async generateAndSendReport(uid, parentEmail, selfEmail = null) {
        try {
            console.log(`[ParentReportService] Generating report for ${uid}...`);
            const profile = await UserProfileService.getProfile(uid);
            if (!profile) throw new Error("User profile not found");

            const sevenDaysAgo = moment().subtract(7, 'days').toDate().toISOString();
            const periodStart = moment().subtract(7, 'days').format('MMM D');
            const periodEnd = moment().format('MMM D, YYYY');

            // Fetch all data in parallel
            const [
                events,
                userStats,
                weeklyQuestStatus,
                recentQuests,
                enSkillMap,
                mathSkillMap,
                recentMock,
                enMistakes,
                mathMistakes,
                personalizedContext,
                allMockResults
            ] = await Promise.all([
                CosmosStore.getTimelineSince(uid, sevenDaysAgo),
                CosmosStore.getUserStats(uid).catch(() => null),
                GamificationService.getWeeklyQuestStatus(uid),
                GamificationService.getRecentQuestSummary(uid, 5).catch(() => []),
                UserProfileService.getSkillMap(uid, 'english').catch(() => null),
                UserProfileService.getMathSkillMap(uid).catch(() => null),
                UserProfileService.getMockSummary(uid).catch(() => null),
                UserProfileService.getMistakes(uid, 'english', 3).catch(() => []),
                UserProfileService.getMistakes(uid, 'maths', 3).catch(() => []),
                UserProfileService.getPersonalizedContext(uid, 'english').catch(() => null),
                CosmosStore.listQuestResults(uid, 20).catch(() => [])
            ]);

            // 1. Aggregate Stats from timeline
            const stats = {
                totalTimeFormatted: "0h 0m",
                sessionsCount: 0,
                totalXP: 0
            };
            let totalMinutes = 0;
            events.forEach(e => {
                if (e.xp) stats.totalXP += e.xp;
                if (e.type === 'practice' || e.type === 'milestone') stats.sessionsCount++;
                if (e.duration) totalMinutes += e.duration;
            });
            if (totalMinutes === 0 && stats.sessionsCount > 0) {
                totalMinutes = stats.sessionsCount * 15;
            }
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            stats.totalTimeFormatted = `${h}h ${m}m`;

            // 2. Streak & Level from user stats
            const streakDays = userStats?.streakDays || profile?.streakDays || 0;
            const level = profile?.level || userStats?.level || 1;
            const xp = profile?.xp || userStats?.xp || 0;

            // 3. Weekly Quest Status
            const weeklyQuest = {
                completed: weeklyQuestStatus?.completed || false,
                weekId: weeklyQuestStatus?.weekId || null
            };

            // 4. Recent Quests
            const quests = (recentQuests || []).map(q => ({
                topic: q.topic || 'Quest',
                score: q.score || null,
                type: q.type || null
            }));

            // 5. Subject Breakdown
            const subjectBreakdown = {
                english: { pillars: [], weakestSkills: [] },
                maths: { strands: [], weakestSkills: [] }
            };

            // English pillars from skill map
            if (enSkillMap?.microSkills) {
                const pillarIds = ['reading_comprehension', 'writing_content', 'listening_content', 'speaking_delivery'];
                const pillarNames = {
                    reading_comprehension: 'Reading',
                    writing_content: 'Writing',
                    listening_content: 'Listening',
                    speaking_delivery: 'Speaking'
                };
                pillarIds.forEach(id => {
                    const skill = enSkillMap.microSkills[id];
                    if (skill) {
                        subjectBreakdown.english.pillars.push({
                            name: pillarNames[id] || id,
                            level: skill.level || 0
                        });
                    }
                });
                // Weakest skills
                const sorted = Object.entries(enSkillMap.microSkills)
                    .filter(([id]) => !id.startsWith('speaking_') || ['speaking_delivery', 'speaking_strategies', 'speaking_language', 'speaking_organization'].includes(id))
                    .sort((a, b) => (a[1].level || 0) - (b[1].level || 0))
                    .slice(0, 3);
                subjectBreakdown.english.weakestSkills = sorted.map(([id, data]) => ({
                    name: UserProfileService.getSkillName(id, 'english') || id,
                    level: data.level || 0
                }));
            }

            // Math strands from skill map
            if (mathSkillMap?.microSkills) {
                const strands = Object.entries(mathSkillMap.microSkills)
                    .map(([id, data]) => ({ name: data.name || id, level: data.level || 0 }))
                    .sort((a, b) => (b.level || 0) - (a.level || 0));
                subjectBreakdown.maths.strands = strands.slice(0, 5);
                subjectBreakdown.maths.weakestSkills = [...strands]
                    .sort((a, b) => (a.level || 0) - (b.level || 0))
                    .slice(0, 3);
            }

            // 6. Recent Mock Exam (from mock_summary) + All Mock Exams (from quest_results)
            let recentMockFormatted = null;
            if (recentMock) {
                const mockDate = recentMock.timestamp || recentMock.completedAt;
                const isRecent = mockDate && moment(mockDate).isAfter(moment().subtract(7, 'days'));
                if (isRecent || recentMock) {
                    recentMockFormatted = {
                        paper: recentMock.paper || recentMock.topic || 'Mock Exam',
                        score: recentMock.score ?? null,
                        total: recentMock.total ?? null,
                        percentage: recentMock.percentage ?? null,
                        level: recentMock.level || null,
                        topMistakes: Array.isArray(recentMock.topMistakes) ? recentMock.topMistakes.slice(0, 3) : []
                    };
                }
            }

            // 6b. All Mock Exam History (from quest_results)
            const mockExamHistory = (allMockResults || [])
                .filter(r => r.type === 'READING' || r.type === 'WRITING' || r.type === 'LISTENING' || r.type === 'SPEAKING')
                .map(r => ({
                    type: r.type,
                    topic: r.topic || r.paperId || 'Mock Exam',
                    score: r.totalScore ?? r.score ?? null,
                    total: r.possibleScore ?? null,
                    percentage: r.percentage ?? null,
                    level: r.level || null,
                    date: r.completedAt || r.timestamp || null,
                    sectionalScores: r.sectionalScores || null,
                    skillScores: r.skillScores ? Object.entries(r.skillScores).map(([k, v]) => ({
                        skill: k,
                        score: v.score || 0,
                        possible: v.possible || 0,
                        percentage: v.possible > 0 ? Math.round((v.score / v.possible) * 100) : 0
                    })) : []
                }))
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            // 7. Top Mistakes
            const allMistakes = [...enMistakes, ...mathMistakes]
                .sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0))
                .slice(0, 5);
            const topMistakes = allMistakes.map(m => ({
                term: m.term || m.question?.substring(0, 50) || 'Unknown',
                subject: m.subject || 'english'
            }));

            // 8. Recommended Next Steps
            const recommendedNextSteps = personalizedContext?.recommendedNextSteps || [];

            // 9. Ace Sir Advice
            let lowestSkill = "General Foundation";
            if (enSkillMap?.microSkills) {
                const sorted = Object.entries(enSkillMap.microSkills)
                    .sort((a, b) => (a[1].level || 1) - (b[1].level || 1));
                if (sorted[0]) lowestSkill = UserProfileService.getSkillName(sorted[0][0], 'english') || sorted[0][0];
            }

            const aceSir = {
                dreamPrograms: profile.dreamPrograms || [],
                estimatedBest5: Math.round((level || 1) * 4),
                recommendation: `Focus on mastering ${lowestSkill} next week. Consistent daily practice in this area will significantly boost the overall projected score.`
            };

            // 10. Mastery & Math Ability (legacy fields for template compatibility)
            const mastery = { recentSkills: subjectBreakdown.english.weakestSkills.map(s => s.name) };
            const mathAbility = { recentTopics: subjectBreakdown.maths.weakestSkills.map(s => s.name) };

            const reportData = {
                studentName: profile.nickname || profile.displayName || "Student",
                period: `${periodStart} - ${periodEnd}`,
                stats,
                mastery,
                mathAbility,
                aceSir,
                // NEW enriched fields
                weeklyQuest,
                streakDays,
                level,
                xp,
                recentQuests: quests,
                recentMock: recentMockFormatted,
                mockExamHistory,
                subjectBreakdown,
                topMistakes,
                recommendedNextSteps
            };

            // 11. Send Report to all recipients
            const recipients = [parentEmail];
            if (selfEmail) recipients.push(selfEmail);

            const result = await EmailService.sendWeeklyReport(recipients, reportData);

            if (result.success && !result.mock && result.deliveryMode !== 'simulated') {
                await UserProfileService.createOrUpdateProfile(uid, {
                    parent_last_report_sent: new Date().toISOString()
                });
            }

            return result;

        } catch (error) {
            console.error(`[ParentReportService] Error generating report for ${uid}:`, error);
            throw error;
        }
    }
}

module.exports = new ParentReportService();
